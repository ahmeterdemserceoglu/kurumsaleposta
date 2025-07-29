import mysql from 'mysql2/promise'

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 10000,
  timeout: 10000,
  charset: 'utf8mb4',
  timezone: '+00:00'
}

// Create connection pool
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    console.log('Creating new database connection pool')
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Execute a query with automatic connection management
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  const pool = getPool()

  try {
    const [rows] = await pool.execute(query, params)
    return rows as T[]
  } catch (error: any) {
    console.error('Database query error:', {
      error: error.message,
      code: error.code,
      query: query.substring(0, 100) + '...'
    })

    // Reset pool on connection errors
    if (error.code === 'ER_CON_COUNT_ERROR' || error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Resetting database pool due to connection error')
      await closePool()
    }

    throw error
  }
}

// Execute a single query and return first result
export async function executeQuerySingle<T = any>(
  query: string,
  params?: any[]
): Promise<T | null> {
  const results = await executeQuery<T>(query, params)
  return results.length > 0 ? results[0] : null
}

// Get a single connection for transactions
export async function getConnection(): Promise<mysql.PoolConnection> {
  const pool = getPool()
  try {
    console.log('Getting database connection from pool')
    const connection = await pool.getConnection()
    return connection
  } catch (error: any) {
    console.error('Failed to get database connection:', error)
    throw error
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await executeQuery('SELECT 1 as test')
    return result.length > 0
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

// Close all connections
export async function closePool(): Promise<void> {
  if (pool) {
    console.log('Closing database connection pool')
    try {
      await pool.end()
    } catch (error) {
      console.error('Error closing pool:', error)
    }
    pool = null
  }
}

// Reset pool - force recreation
export async function resetPool(): Promise<void> {
  console.log('Resetting database connection pool...')
  await closePool()
  // Pool will be recreated on next getPool() call
}

// Health check function
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: {
    connection: boolean;
    timestamp: string;
  }
}> {
  try {
    const result = await executeQuery('SELECT 1 as test, NOW() as timestamp')
    
    return {
      status: 'healthy',
      details: {
        connection: true,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('Database health check failed:', error)
    return {
      status: 'unhealthy',
      details: {
        connection: false,
        timestamp: new Date().toISOString()
      }
    }
  }
}