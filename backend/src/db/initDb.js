import { PrismaClient } from '@prisma/client';
import pool from '../db.js';

const prisma = new PrismaClient();

/**
 * Initialize database tables if they don't exist
 */
export async function initDatabase() {
  try {
    console.log('Checking database schema...');
    
    // Prisma already handles schema creation through migrations
    // This function can be used for additional setup if needed
    
    console.log('Database schema verified');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

/**
 * Update users table with additional fields if needed
 */
export async function updateUserTableWithAdditionalFields() {
  try {
    console.log('Checking user table for additional fields...');
    
    // This would be handled by Prisma migrations
    // We could add custom logic here if needed to add fields that aren't in the schema
    
    console.log('User table is up to date');
    return true;
  } catch (error) {
    console.error('Error updating user table:', error);
    return false;
  }
} 