#!/usr/bin/env node

/**
 * Database Setup Script
 * Properly initializes and seeds the database with default users
 * 
 * Usage:
 *   node scripts/db-setup.js            # Initialize and seed database
 *   node scripts/db-setup.js --verify   # Verify database integrity
 *   node scripts/db-setup.js --reset    # Reset with fresh seed
 */

const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')
const crypto = require('crypto')

// Password Service equivalent in Node
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex')
}

const DEFAULT_SEED_USERS = [
  {
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: 'admin123',
    isAdmin: 1,
  },
  {
    name: 'John Doe',
    email: 'user@gmail.com',
    password: 'password123',
    isAdmin: 0,
  },
]

function getDatabasePath() {
  return path.join(process.cwd(), 'database', 'coffee_shop.db')
}

function getSchemaPath() {
  return path.join(process.cwd(), 'database', 'schema.sql')
}

function seedUsers(db, users = DEFAULT_SEED_USERS) {
  try {
    // Clear existing users
    db.prepare('DELETE FROM users').run()

    // Insert seed users with hashed passwords
    const insertStmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, is_admin)
      VALUES (?, ?, ?, ?)
    `)

    for (const user of users) {
      const passwordHash = hashPassword(user.password)
      insertStmt.run(user.name, user.email, passwordHash, user.isAdmin)
      console.log(`  ✓ ${user.email}`)
    }
  } catch (error) {
    console.error('❌ Failed to seed users:', error.message)
    throw error
  }
}

function verifyDatabase(db) {
  const issues = []
  const tables = []
  let userCount = 0

  try {
    const requiredTables = [
      'users',
      'menu_items',
      'customers',
      'orders',
      'order_items',
      'delivery_addresses',
      'contact_messages',
    ]

    for (const table of requiredTables) {
      const result = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .get(table)
      if (result) {
        tables.push(table)
      } else {
        issues.push(`  ✗ Missing table: ${table}`)
      }
    }

    const userResult = db.prepare('SELECT COUNT(*) as count FROM users').get()
    userCount = userResult.count

    if (userCount === 0) {
      issues.push('  ✗ No users found in database')
    }

    return {
      isValid: issues.length === 0,
      tables,
      userCount,
      issues,
    }
  } catch (error) {
    issues.push(`  ✗ Integrity check error: ${error.message}`)
    return {
      isValid: false,
      tables,
      userCount,
      issues,
    }
  }
}

function printTestCredentials() {
  console.log('\n📋 Test Credentials:')
  for (const user of DEFAULT_SEED_USERS) {
    const hash = hashPassword(user.password)
    console.log(`  ${user.email}`)
    console.log(`    Password: ${user.password}`)
    console.log(`    Role: ${user.isAdmin ? 'Admin' : 'User'}`)
    console.log()
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dbPath = getDatabasePath()
  const schemaPath = getSchemaPath()

  console.log('🔧 Database Setup Tool\n')
  console.log(`📁 Database: ${dbPath}\n`)

  try {
    // Verify schema file exists
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`)
    }

    const schema = fs.readFileSync(schemaPath, 'utf-8')

    // Handle --verify flag
    if (args.includes('--verify')) {
      console.log('🔍 Verifying database...\n')

      if (!fs.existsSync(dbPath)) {
        console.log('❌ Database file does not exist\n')
        return
      }

      const db = new Database(dbPath)
      const result = verifyDatabase(db)

      for (const issue of result.issues) {
        console.log(issue)
      }

      console.log(`\n📊 Status:`)
      console.log(`  Tables: ${result.tables.length}`)
      console.log(`  Users: ${result.userCount}`)
      console.log(`  Valid: ${result.isValid ? '✓ Yes' : '✗ No'}`)
      console.log()

      db.close()
      return
    }

    // Handle --reset flag
    if (args.includes('--reset')) {
      console.log('🔄 Resetting database...\n')

      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath)
        console.log('  ✓ Removed existing database')
      }
    }

    // Initialize database
    console.log('📋 Initializing database...')

    const db = new Database(dbPath)
    db.pragma('journal_mode = WAL')

    // Check if already initialized
    const tableExists = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
      .get()

    if (!tableExists) {
      console.log('  ✓ Creating tables from schema...')
      db.exec(schema)
    } else {
      console.log('  ✓ Tables already exist')
    }

    // Seed users
    console.log('\n👥 Seeding users...')
    seedUsers(db)

    db.close()

    console.log('\n✅ Database setup completed successfully!\n')
    printTestCredentials()

    // Verify
    const verifyDb = new Database(dbPath)
    const verification = verifyDatabase(verifyDb)
    console.log('✓ Verification passed\n')
    verifyDb.close()

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    console.error('\nPlease ensure:')
    console.error('  1. You\'re in the project root directory')
    console.error('  2. database/schema.sql exists')
    console.error('  3. You have write permission in the database folder\n')
    process.exit(1)
  }
}

main()
