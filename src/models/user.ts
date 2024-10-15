import pool from '../db';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string; // Consider hashing passwords
  createdAt: Date;
}

// Example function to get a user by ID
export async function getUserById(userId: number): Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}
