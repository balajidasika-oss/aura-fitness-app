import crypto from 'crypto';

/**
 * Hash a password securely with PBKDF2 and a unique salt.
 */
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

/**
 * Verify a password against a stored salt and hash.
 */
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

/**
 * Generate a clean, memorable Coach Invite Code (e.g., COACH-7492).
 */
export function generateCoachCode(name?: string): string {
  const prefix = name ? name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) : 'PRO';
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `COACH-${prefix}-${randomDigits}`;
}
