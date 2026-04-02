/**
 * SQLite Database Helper for Next.js API Routes
 * Provides connection to SQLite database
 */

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { PasswordService } from '@/lib/services/password-service'
import { DatabaseSetupService } from '@/lib/services/database-setup-service'

const dbPath = path.join(process.cwd(), 'database', 'coffee_shop.db')

let db: Database.Database | null = null

function initializeDatabase() {
  const dbDir = path.dirname(dbPath)
  
  // Create database directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')
  
  const newDb = new Database(dbPath)
  newDb.pragma('journal_mode = WAL')
  
  // Check if database is already initialized
  try {
    if (!DatabaseSetupService.isInitialized(newDb)) {
      console.log('📋 Initializing database...')
      
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found at ${schemaPath}`)
      }
      
      const schema = fs.readFileSync(schemaPath, 'utf-8')
      DatabaseSetupService.setupDatabase(newDb, schema, false) // Don't seed here, seed manually
      console.log('✓ Database schema initialized successfully')
    } else {
      console.log('✓ Database already initialized')
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
  
  return newDb
}

export function getDatabase(): Database.Database {
  if (!db) {
    try {
      db = initializeDatabase()
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}

export interface User {
  id: number
  name: string
  email: string
  password_hash: string
  is_admin: number
  created_at: string
  updated_at: string
}

export function findUserByEmail(email: string): User | undefined {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  return stmt.get(email) as User | undefined
}

export function createUser(name: string, email: string, passwordHash: string, isAdmin: boolean = false): User {
  const db = getDatabase()
  const stmt = db.prepare(
    'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(name, email, passwordHash, isAdmin ? 1 : 0)

  const userData = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(result.lastInsertRowid) as User

  return userData
}

export function verifyPassword(storedHash: string, password: string): boolean {
  return PasswordService.verifyPassword(password, storedHash)
}
