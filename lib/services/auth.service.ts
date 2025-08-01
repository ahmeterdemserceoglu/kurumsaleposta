import bcrypt from 'bcryptjs'
import { executeQuery, executeQuerySingle, getConnection } from '@/lib/database'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/jwt'
import { User, Company, AuthResponse, LoginCredentials, RegistrationData } from '@/types'

export class AuthService {
  // Authenticate user with email and password
  static async authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials

    // Find user by email with company information
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.firstName,
        u.lastName,
        u.password,
        u.role,
        u.companyId,
        u.is_banned,
        u.ban_reason,
        u.status,
        u.lastLogin,
        c.status as companyStatus
      FROM users u
      JOIN companies c ON u.companyId = c.id
      WHERE u.email = ?
    `

    const user = await executeQuerySingle<any>(userQuery, [email])

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Check if user is banned
    if (user.is_banned) {
      throw new Error(`Account is banned: ${user.ban_reason || 'No reason provided'}`)
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is inactive')
    }

    // Check if company is active
    if (user.companyStatus !== 'active') {
      throw new Error('Company account is suspended')
    }

    // Update last login
    await executeQuery(
      'UPDATE users SET lastLogin = NOW() WHERE id = ?',
      [user.id]
    )

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    })

    const refreshToken = generateRefreshToken({
      userId: user.id
    })

    // Store refresh token in database
    await executeQuery(
      'INSERT INTO refresh_tokens (userId, token, expiresAt) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [user.id, refreshToken]
    )

    const authResponse: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        status: user.status,
        lastLogin: new Date()
      },
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    }

    return authResponse
  }

  // Register new company and admin user
  static async registerCompany(data: RegistrationData): Promise<AuthResponse> {
    const {
      companyName,
      backupEmail,
      adminEmail,
      adminFirstName,
      adminLastName,
      password,
      plan
    } = data

    // Generate domain from company name
    const domain = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .replace(/\s+/g, '') // Remove spaces
      + '.com'

    // Check if email already exists
    const existingUser = await executeQuerySingle(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    )

    if (existingUser) {
      throw new Error('Email address is already registered')
    }

    // Check if domain already exists
    const existingDomain = await executeQuerySingle(
      'SELECT id FROM companies WHERE domain = ?',
      [domain]
    )

    if (existingDomain) {
      throw new Error('Domain is already registered')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Start transaction
    const connection = await getConnection()
    
    try {
      await connection.beginTransaction()

      // Create company
      const [companyResult] = await connection.execute(
        `INSERT INTO companies (name, domain, backupEmail, plan, status, createdAt) 
         VALUES (?, ?, ?, ?, 'active', NOW())`,
        [companyName, domain, backupEmail, plan]
      )

      const companyId = (companyResult as any).insertId

      // Create admin user
      const [userResult] = await connection.execute(
        `INSERT INTO users (email, firstName, lastName, password, role, companyId, status, createdAt) 
         VALUES (?, ?, ?, ?, 'user', ?, 'active', NOW())`,
        [adminEmail, adminFirstName, adminLastName, hashedPassword, companyId]
      )

      const userId = (userResult as any).insertId

      // Create company settings
      await connection.execute(
        `INSERT INTO company_settings (companyId, maxEmailAccounts, storageLimit) 
         VALUES (?, ?, ?)`,
        [
          companyId,
          plan === 'starter' ? 10 : plan === 'business' ? 50 : 200,
          plan === 'starter' ? 10 : plan === 'business' ? 100 : 500
        ]
      )

      // Create default security settings
      await connection.execute(
        `INSERT INTO security_settings (companyId, passwordMinLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars, twoFactorRequired, sessionTimeout) 
         VALUES (?, 8, true, true, true, false, false, 480)`,
        [companyId]
      )

      // Create primary email account for admin user using company domain
      const primaryEmail = `${adminFirstName.toLowerCase()}.${adminLastName.toLowerCase()}@${domain}`;
      await connection.execute(
        `INSERT INTO email_accounts (email, userId, companyId, forwardingRules, storageUsed, status, createdAt) 
         VALUES (?, ?, ?, '[]', 0, 'active', NOW())`,
        [primaryEmail, userId, companyId]
      )

      await connection.commit()

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: userId.toString(),
        email: adminEmail,
        role: 'user', // Yeni kayıt olan kullanıcılar 'user' rolü alır
        companyId: companyId.toString()
      })

      const refreshToken = generateRefreshToken({
        userId: userId.toString()
      })

      // Store refresh token
      await executeQuery(
        'INSERT INTO refresh_tokens (userId, token, expiresAt) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
        [userId, refreshToken]
      )

      const authResponse: AuthResponse = {
        user: {
          id: userId.toString(),
          email: adminEmail,
          firstName: adminFirstName,
          lastName: adminLastName,
          role: 'admin',
          companyId: companyId.toString(),
          status: 'active'
        },
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }

      return authResponse

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)

    // Check if refresh token exists in database and is not expired
    const tokenRecord = await executeQuerySingle(
      'SELECT userId FROM refresh_tokens WHERE token = ? AND expiresAt > NOW()',
      [refreshToken]
    )

    if (!tokenRecord) {
      throw new Error('Invalid or expired refresh token')
    }

    // Get user information
    const user = await executeQuerySingle<any>(
      `SELECT id, email, firstName, lastName, role, companyId, status 
       FROM users WHERE id = ? AND status = 'active'`,
      [payload.userId]
    )

    if (!user) {
      throw new Error('User not found or inactive')
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    })

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken({
      userId: user.id
    })

    // Update refresh token in database
    await executeQuery(
      'UPDATE refresh_tokens SET token = ?, expiresAt = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE token = ?',
      [newRefreshToken, refreshToken]
    )

    const authResponse: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        status: user.status
      },
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }

    return authResponse
  }

  // Logout user (invalidate refresh token)
  static async logout(refreshToken: string): Promise<void> {
    await executeQuery(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [refreshToken]
    )
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    const user = await executeQuerySingle<any>(
      `SELECT id, email, firstName, lastName, role, companyId, status, lastLogin 
       FROM users WHERE id = ?`,
      [userId]
    )

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      status: user.status,
      lastLogin: user.lastLogin
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const allowedFields = ['firstName', 'lastName', 'email']
    const updateFields: string[] = []
    const updateValues: any[] = []

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`)
        updateValues.push(value)
      }
    })

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update')
    }

    updateValues.push(userId)

    await executeQuery(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    const updatedUser = await this.getUserById(userId)
    if (!updatedUser) {
      throw new Error('User not found after update')
    }

    return updatedUser
  }

  // Change user password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get current password hash
    const user = await executeQuerySingle<any>(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await executeQuery(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, userId]
    )

    // Invalidate all refresh tokens for this user (force re-login)
    await executeQuery(
      'DELETE FROM refresh_tokens WHERE userId = ?',
      [userId]
    )
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<void> {
    // Find user with company backup email information
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.firstName,
        u.lastName,
        c.backupEmail,
        c.name as companyName
      FROM users u
      JOIN companies c ON u.companyId = c.id
      WHERE u.email = ? AND u.status = 'active'
    `
    
    const user = await executeQuerySingle<any>(userQuery, [email])

    if (!user) {
      // Don't reveal if email exists or not
      return
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token
    await executeQuery(
      'INSERT INTO password_reset_tokens (userId, token, expiresAt) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token), expiresAt = VALUES(expiresAt)',
      [user.id, resetToken, expiresAt]
    )

    // In production, send email to backup email address
    // This is crucial: we send the reset link to the backup email, not the company email
    console.log(`Password reset requested for: ${email}`)
    console.log(`Reset token: ${resetToken}`)
    console.log(`Reset link will be sent to backup email: ${user.backupEmail}`)
    console.log(`User: ${user.firstName} ${user.lastName} from ${user.companyName}`)
    
    // TODO: Implement actual email sending to user.backupEmail
    // The email should contain:
    // - Information about which company email requested the reset
    // - Reset link with the token
    // - Security notice about the reset request
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find valid reset token
    const resetRecord = await executeQuerySingle<any>(
      'SELECT userId FROM password_reset_tokens WHERE token = ? AND expiresAt > NOW()',
      [token]
    )

    if (!resetRecord) {
      throw new Error('Invalid or expired reset token')
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await executeQuery(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, resetRecord.userId]
    )

    // Delete used reset token
    await executeQuery(
      'DELETE FROM password_reset_tokens WHERE token = ?',
      [token]
    )

    // Invalidate all refresh tokens for this user
    await executeQuery(
      'DELETE FROM refresh_tokens WHERE userId = ?',
      [resetRecord.userId]
    )
  }
}