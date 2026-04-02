#!/usr/bin/env node

/**
 * Initialize Database with Correct Password Hashes
 * Run: node scripts/setup-admin.js
 */

const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const Database = require('better-sqlite3');
const path = require('path');

// Generate correct password hashes
function generateHash(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

console.log('\n🔑 Admin Setup - Generating Password Hashes\n');

const admin_password = 'admin123';
const user_password = 'password123';

const admin_hash = generateHash(admin_password);
const user_hash = generateHash(user_password);

console.log('Generated Hashes:');
console.log(`  admin123 → ${admin_hash}`);
console.log(`  password123 → ${user_hash}\n`);

// Update database
const dbPath = path.join(process.cwd(), 'database', 'coffee_shop.db');

try {
  const db = new Database(dbPath);
  
  // Delete existing users to start fresh
  db.exec('DELETE FROM users;');
  
  // Insert with correct hashes
  const insertStmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, is_admin)
    VALUES (?, ?, ?, ?)
  `);
  
  insertStmt.run('Admin User', 'admin@gmail.com', admin_hash, 1);
  insertStmt.run('John Doe', 'user@gmail.com', user_hash, 0);
  
  db.close();
  
  console.log('✅ Database updated with correct password hashes!\n');
  console.log('Demo Credentials:');
  console.log('  👑 Admin: admin@gmail.com / admin123');
  console.log('  👤 User: user@gmail.com / password123\n');
  console.log('Type: npm run dev');
  
} catch (error) {
  console.error('❌ Error updating database:', error.message);
  console.log('\nMake sure:');
  console.log('  1. Database exists at:', dbPath);
  console.log('  2. Users table is initialized');
}
