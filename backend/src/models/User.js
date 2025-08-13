import pool from '../db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

class User {
  static async create({ 
    email, 
    password, 
    fullName = null, 
    university = null, 
    major = null,
    year = null,
    state = null, 
    city = null, 
    mobileNumber = null, 
    dateOfBirth = null,
    bio = null,
    linkedin = null,
    heritage = [],
    languages = [],
    profileImage = null
  }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Add additional fields to the query
    const result = await pool.query(
      `INSERT INTO users (
        email, 
        password_hash, 
        full_name, 
        university,
        major,
        year, 
        state, 
        city, 
        mobile_number, 
        date_of_birth,
        bio,
        linkedin,
        heritage,
        languages,
        profile_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING id, email, full_name, profile_image`,
      [
        email, 
        hashedPassword, 
        fullName, 
        university,
        major,
        year, 
        state, 
        city, 
        mobileNumber, 
        dateOfBirth ? new Date(dateOfBirth) : null,
        bio,
        linkedin,
        JSON.stringify(heritage),
        JSON.stringify(languages),
        profileImage
      ]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
  
  static async updateProfile(userId, {
    fullName,
    university,
    major,
    year,
    state,
    city,
    bio,
    linkedin,
    heritage,
    languages,
    profileImage
  }) {
    // Build the query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCounter = 1;
    
    // Add fields that are provided
    if (fullName !== undefined) {
      updates.push(`full_name = $${paramCounter++}`);
      values.push(fullName);
    }
    
    if (university !== undefined) {
      updates.push(`university = $${paramCounter++}`);
      values.push(university);
    }
    
    if (major !== undefined) {
      updates.push(`major = $${paramCounter++}`);
      values.push(major);
    }
    
    if (year !== undefined) {
      updates.push(`year = $${paramCounter++}`);
      values.push(year);
    }
    
    if (state !== undefined) {
      updates.push(`state = $${paramCounter++}`);
      values.push(state);
    }
    
    if (city !== undefined) {
      updates.push(`city = $${paramCounter++}`);
      values.push(city);
    }
    
    if (bio !== undefined) {
      updates.push(`bio = $${paramCounter++}`);
      values.push(bio);
    }
    
    if (linkedin !== undefined) {
      updates.push(`linkedin = $${paramCounter++}`);
      values.push(linkedin);
    }
    
    if (heritage !== undefined) {
      updates.push(`heritage = $${paramCounter++}`);
      values.push(JSON.stringify(heritage));
    }
    
    if (languages !== undefined) {
      updates.push(`languages = $${paramCounter++}`);
      values.push(JSON.stringify(languages));
    }
    
    if (profileImage !== undefined) {
      updates.push(`profile_image = $${paramCounter++}`);
      values.push(profileImage);
    }
    
    // Add the userId at the end of the values array
    values.push(userId);
    
    if (updates.length === 0) {
      return null; // No updates to make
    }
    
    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCounter} 
      RETURNING id, email, full_name, university, major, year, state, city, bio, linkedin, heritage, languages, profile_image
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }
  
  static async getUserGroups(userId) {
    const result = await pool.query(`
      SELECT g.*
      FROM groups g
      JOIN user_groups ug ON g.id = ug.group_id
      WHERE ug.user_id = $1
    `, [userId]);
    
    return result.rows;
  }
  
  static async getUserEvents(userId) {
    const result = await pool.query(`
      SELECT e.*
      FROM events e
      JOIN event_attendees ea ON e.id = ea.event_id
      WHERE ea.user_id = $1
    `, [userId]);
    
    return result.rows;
  }
}

export default User;
