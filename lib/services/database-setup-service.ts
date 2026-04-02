/**
 * Database Setup Service - Handles database initialization and seeding
 * This is the single source of truth for database schema and seed data
 */

import Database from 'better-sqlite3'
import { PasswordService } from './password-service'

/**
 * Default seed users - Single source of truth
 * If you need to change demo credentials, update them here
 */
export const DEFAULT_SEED_USERS = [
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

export const DatabaseSetupService = {
    /**
     * Initialize database with schema
     * @param db Database instance
     * @param schema SQL schema string
     */
    initializeSchema(db: Database.Database, schema: string): void {
        try {
            // Execute schema
            db.exec(schema)
            console.log('✓ Database schema initialized')
        } catch (error) {
            console.error('✗ Failed to initialize schema:', error)
            throw error
        }
    },

    /**
     * Seed database with default users
     * @param db Database instance
     * @param users Users to seed (defaults to DEFAULT_SEED_USERS)
     */
    seedUsers(
        db: Database.Database,
        users: typeof DEFAULT_SEED_USERS = DEFAULT_SEED_USERS
    ): void {
        try {
            // Clear existing users
            db.prepare('DELETE FROM users').run()

            // Insert seed users with hashed passwords
            const insertStmt = db.prepare(`
        INSERT INTO users (name, email, password_hash, is_admin)
        VALUES (?, ?, ?, ?)
      `)

            for (const user of users) {
                const passwordHash = PasswordService.hashPassword(user.password)
                insertStmt.run(user.name, user.email, passwordHash, user.isAdmin)
                console.log(`✓ Seeded user: ${user.email}`)
            }
        } catch (error) {
            console.error('✗ Failed to seed users:', error)
            throw error
        }
    },

    /**
     * Setup database (initialize schema and seed users)
     * @param db Database instance
     * @param schema SQL schema string
     * @param seedUsers Whether to seed default users (default: true)
     */
    setupDatabase(
        db: Database.Database,
        schema: string,
        seedUsers: boolean = true
    ): void {
        this.initializeSchema(db, schema)
        if (seedUsers) {
            this.seedUsers(db)
        }
    },

    /**
     * Check if database is initialized
     * @param db Database instance
     * @returns true if users table exists
     */
    isInitialized(db: Database.Database): boolean {
        try {
            const result = db
                .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
                .get()
            return !!result
        } catch (error) {
            return false
        }
    },

    /**
     * Verify database integrity
     * @param db Database instance
     * @returns Object with integrity check results
     */
    verifyIntegrity(
        db: Database.Database
    ): {
        isValid: boolean
        tables: string[]
        userCount: number
        issues: string[]
    } {
        const issues: string[] = []
        const tables: string[] = []
        let userCount = 0

        try {
            // Check required tables
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
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
                    )
                    .get(table)
                if (result) {
                    tables.push(table)
                } else {
                    issues.push(`Missing table: ${table}`)
                }
            }

            // Check user count
            const userResult = db.prepare('SELECT COUNT(*) as count FROM users').get() as {
                count: number
            }
            userCount = userResult.count

            if (userCount === 0) {
                issues.push('No users found in database')
            }
        } catch (error) {
            issues.push(`Integrity check error: ${error}`)
        }

        return {
            isValid: issues.length === 0,
            tables,
            userCount,
            issues,
        }
    },
}
