/**
 * Password Service - Single source of truth for password operations
 * All password hashing and verification goes through this service
 */

import crypto from 'crypto'

export const PasswordService = {
  /**
   * Hash a password using SHA256
   * @param password The plain text password
   * @returns SHA256 hash as hex string
   */
  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex')
  },

  /**
   * Verify a password against a stored hash
   * @param password The plain text password to verify
   * @param hash The stored hash to compare against
   * @returns true if password matches hash
   */
  verifyPassword(password: string, hash: string): boolean {
    const computedHash = this.hashPassword(password)
    return computedHash === hash
  },

  /**
   * Generate a hash for a test password
   * Useful for generating credentials for documentation
   * @param password Test password
   * @returns Hash and the original password for reference
   */
  generateTestCredentials(password: string) {
    return {
      password,
      hash: this.hashPassword(password),
    }
  },
}
