import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'sifre123',
  database: process.env.DB_NAME || 'mydata',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig)

    const [settings] = await connection.execute('SELECT * FROM system_settings LIMIT 1')
    const settingsData = (settings as any[])[0]

    // Default settings if none exist
    const defaultSettings = {
      site_name: 'Email Marketing Platform',
      site_description: 'Professional email marketing solution',
      maintenance_mode: false,
      max_login_attempts: 5,
      session_timeout: 1440, // 24 hours in minutes
      email_verification_required: true,
      default_plan: 'starter',
      trial_period_days: 14,
      smtp_host: '',
      smtp_port: 587,
      smtp_user: '',
      smtp_from: '',
      backup_enabled: true,
      backup_frequency: 'daily',
      log_level: 'info'
    }

    return NextResponse.json({
      settings: settingsData ? {
        site_name: settingsData.site_name,
        site_description: settingsData.site_description,
        maintenance_mode: settingsData.maintenance_mode,
        max_login_attempts: settingsData.max_login_attempts,
        session_timeout: settingsData.session_timeout,
        email_verification_required: settingsData.email_verification_required,
        default_plan: settingsData.default_plan,
        trial_period_days: settingsData.trial_period_days,
        smtp_host: settingsData.smtp_host,
        smtp_port: settingsData.smtp_port,
        smtp_user: settingsData.smtp_user,
        smtp_from: settingsData.smtp_from,
        backup_enabled: settingsData.backup_enabled,
        backup_frequency: settingsData.backup_frequency,
        log_level: settingsData.log_level
      } : defaultSettings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

export async function PATCH(request: NextRequest) {
  let connection;
  try {
    const updates = await request.json()

    connection = await mysql.createConnection(dbConfig)

    // Check if settings exist
    const [existingSettings] = await connection.execute('SELECT id FROM system_settings LIMIT 1')
    const settingsExist = (existingSettings as any[]).length > 0

    if (settingsExist) {
      // Update existing settings
      const settingsId = (existingSettings as any[])[0].id
      
      const updateFields = []
      const updateValues = []
      
      Object.keys(updates).forEach(key => {
        updateFields.push(`${key} = ?`)
        updateValues.push(updates[key])
      })
      
      updateFields.push('updatedAt = NOW()')
      updateValues.push(settingsId)

      await connection.execute(
        `UPDATE system_settings SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )

      // Get updated settings
      const [updatedSettings] = await connection.execute('SELECT * FROM system_settings WHERE id = ?', [settingsId])
      const settingsData = (updatedSettings as any[])[0]

      return NextResponse.json({
        message: 'Settings updated successfully',
        settings: settingsData
      })
    } else {
      // Create new settings
      const fields = Object.keys(updates)
      const values = Object.values(updates)
      const placeholders = fields.map(() => '?').join(', ')

      await connection.execute(
        `INSERT INTO system_settings (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      )

      // Get created settings
      const [createdSettings] = await connection.execute('SELECT * FROM system_settings ORDER BY id DESC LIMIT 1')
      const settingsData = (createdSettings as any[])[0]

      return NextResponse.json({
        message: 'Settings created successfully',
        settings: settingsData
      })
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}