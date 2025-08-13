const { pool } = require('../src/db.js');
const { mockEvents } = require('../../data/mockData.js');

async function seedEvents() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert events
    for (const event of mockEvents) {
      await client.query(`
        INSERT INTO events (name, description, is_rsvped, is_favorited, image_url, date, start_time, end_time, location, categories, organizer)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        event.name,
        event.description,
        event.isRSVPed,
        event.isFavorited,
        event.image,
        event.date,
        event.startTime,
        event.endTime,
        event.location,
        event.category,
        event.organizer
      ]);
    }
    
    await client.query('COMMIT');
    console.log('Events seeded successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding events:', err);
  } finally {
    client.release();
  }
}

seedEvents()
  .then(() => pool.end())
  .catch(err => console.error('Error during seeding:', err));
