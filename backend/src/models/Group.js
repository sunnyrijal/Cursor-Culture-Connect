import pool from '../db.js';

class Group {
  static async create({
    name,
    description,
    category,
    location,
    isPublic = true,
    universityOnly = false,
    allowedUniversity,
    presidentId,
    meetings = []
  }) {
    // First, create the group
    const groupResult = await pool.query(
      `INSERT INTO groups 
      (name, description, category, location, is_public, university_only, allowed_university, president_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, description, category, location, is_public, university_only, allowed_university, president_id, member_count, created_at`,
      [
        name, 
        description, 
        category, 
        location, 
        isPublic, 
        universityOnly, 
        allowedUniversity,
        presidentId
      ]
    );
    
    const group = groupResult.rows[0];
    
    // Add meetings if provided
    if (meetings && meetings.length > 0) {
      for (const meeting of meetings) {
        await pool.query(
          `INSERT INTO group_meetings (group_id, date, time, location)
          VALUES ($1, $2, $3, $4)`,
          [group.id, meeting.date, meeting.time, meeting.location]
        );
      }
    }
    
    return group;
  }
  
  static async findById(id) {
    const groupResult = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
    
    if (groupResult.rows.length === 0) {
      return null;
    }
    
    const group = groupResult.rows[0];
    
    // Get meetings for this group
    const meetingsResult = await pool.query('SELECT * FROM group_meetings WHERE group_id = $1', [id]);
    group.meetings = meetingsResult.rows;
    
    return group;
  }
  
  static async findAll() {
    const result = await pool.query('SELECT * FROM groups ORDER BY created_at DESC');
    const groups = result.rows;
    
    // Fetch meetings for all groups
    for (const group of groups) {
      const meetingsResult = await pool.query('SELECT * FROM group_meetings WHERE group_id = $1', [group.id]);
      group.meetings = meetingsResult.rows;
    }
    
    return groups;
  }
}

export default Group; 