// Quick password hash generator
// Run with: node scripts/generate-hashes.js

const crypto = require('crypto');

const passwords = {
  'admin123': 'Admin User',
  'password123': 'Regular User'
};

console.log('\n📝 Password Hash Generator\n');
console.log('Use these hashes in your schema:\n');

Object.entries(passwords).forEach(([password, user]) => {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  console.log(`${user} (${password}):`);
  console.log(`  Hash: ${hash}\n`);
});

// For database updates
console.log('--- SQLite Update Statements ---\n');
Object.entries(passwords).forEach(([password, user]) => {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const email = user === 'Admin User' ? 'admin@gmail.com' : 'user@gmail.com';
  const isAdmin = user === 'Admin User' ? 1 : 0;
  console.log(`INSERT OR IGNORE INTO users (name, email, password_hash, is_admin) VALUES`);
  console.log(`  ('${user}', '${email}', '${hash}', ${isAdmin});`);
  console.log();
});
