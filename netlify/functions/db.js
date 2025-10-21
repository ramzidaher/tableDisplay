const { Pool } = require('pg');

// Database connection configuration
// Netlify DB will automatically provide DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        priority VARCHAR(20) DEFAULT 'normal'
      )
    `);

    // Create working_hours table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS working_hours (
        id SERIAL PRIMARY KEY,
        person VARCHAR(50) NOT NULL,
        day VARCHAR(20) NOT NULL,
        location VARCHAR(100),
        hours VARCHAR(50),
        UNIQUE(person, day)
      )
    `);

    // Insert default working hours if table is empty
    const countResult = await pool.query('SELECT COUNT(*) FROM working_hours');
    if (parseInt(countResult.rows[0].count) === 0) {
      const defaultHours = [
        { person: 'tim', day: 'monday', location: 'Office', hours: '9:00 AM - 5:00 PM' },
        { person: 'tim', day: 'tuesday', location: 'Office', hours: '9:00 AM - 5:00 PM' },
        { person: 'tim', day: 'wednesday', location: 'Office', hours: '9:00 AM - 5:00 PM' },
        { person: 'tim', day: 'thursday', location: 'Office', hours: '9:00 AM - 5:00 PM' },
        { person: 'tim', day: 'friday', location: 'Work from Home', hours: '9:00 AM - 5:00 PM' },
        { person: 'ramzi', day: 'monday', location: 'Office', hours: '9:00 AM - 5:00 PM' },
        { person: 'ramzi', day: 'tuesday', location: 'Office', hours: '9:00 AM - 5:00 PM' },
        { person: 'ramzi', day: 'wednesday', location: 'Office', hours: '9:00 AM - 5:00 PM' },
        { person: 'ramzi', day: 'thursday', location: 'Office', hours: '9:00 AM - 5:00 PM' },
        { person: 'ramzi', day: 'friday', location: 'Work from Home', hours: '9:00 AM - 5:00 PM' }
      ];

      for (const hour of defaultHours) {
        await pool.query(
          'INSERT INTO working_hours (person, day, location, hours) VALUES ($1, $2, $3, $4)',
          [hour.person, hour.day, hour.location, hour.hours]
        );
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Notes functions
async function getAllNotes() {
  const result = await pool.query('SELECT * FROM notes ORDER BY timestamp DESC');
  return result.rows;
}

async function getNoteById(id) {
  const result = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
  return result.rows[0];
}

async function createNote(message, priority = 'normal') {
  const result = await pool.query(
    'INSERT INTO notes (message, priority) VALUES ($1, $2) RETURNING *',
    [message, priority]
  );
  return result.rows[0];
}

async function updateNote(id, message, priority) {
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (message !== undefined) {
    updates.push(`message = $${paramCount}`);
    values.push(message);
    paramCount++;
  }
  if (priority !== undefined) {
    updates.push(`priority = $${paramCount}`);
    values.push(priority);
    paramCount++;
  }

  if (updates.length === 0) {
    return await getNoteById(id);
  }

  updates.push(`timestamp = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE notes SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
}

async function deleteNote(id) {
  const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

async function clearAllNotes() {
  await pool.query('DELETE FROM notes');
  return { message: 'All notes cleared' };
}

// Working hours functions
async function getAllWorkingHours() {
  const result = await pool.query(`
    SELECT person, day, location, hours 
    FROM working_hours 
    ORDER BY person, 
    CASE day 
      WHEN 'monday' THEN 1 
      WHEN 'tuesday' THEN 2 
      WHEN 'wednesday' THEN 3 
      WHEN 'thursday' THEN 4 
      WHEN 'friday' THEN 5 
      ELSE 6 
    END
  `);
  
  // Transform to the expected format
  const workingHours = {};
  result.rows.forEach(row => {
    if (!workingHours[row.person]) {
      workingHours[row.person] = {
        name: row.person.charAt(0).toUpperCase() + row.person.slice(1),
        schedule: {}
      };
    }
    workingHours[row.person].schedule[row.day] = {
      location: row.location,
      hours: row.hours
    };
  });
  
  return workingHours;
}

async function updatePersonSchedule(person, schedule) {
  // Delete existing schedule for this person
  await pool.query('DELETE FROM working_hours WHERE person = $1', [person]);
  
  // Insert new schedule
  for (const [day, data] of Object.entries(schedule)) {
    await pool.query(
      'INSERT INTO working_hours (person, day, location, hours) VALUES ($1, $2, $3, $4)',
      [person, day, data.location, data.hours]
    );
  }
  
  return await getPersonSchedule(person);
}

async function updatePersonDay(person, day, location, hours) {
  const result = await pool.query(`
    INSERT INTO working_hours (person, day, location, hours) 
    VALUES ($1, $2, $3, $4) 
    ON CONFLICT (person, day) 
    DO UPDATE SET location = $3, hours = $4 
    RETURNING *
  `, [person, day, location, hours]);
  
  return result.rows[0];
}

async function getPersonSchedule(person) {
  const result = await pool.query(
    'SELECT day, location, hours FROM working_hours WHERE person = $1 ORDER BY day',
    [person]
  );
  
  const schedule = {};
  result.rows.forEach(row => {
    schedule[row.day] = {
      location: row.location,
      hours: row.hours
    };
  });
  
  return {
    name: person.charAt(0).toUpperCase() + person.slice(1),
    schedule
  };
}

module.exports = {
  pool,
  initializeDatabase,
  // Notes functions
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  clearAllNotes,
  // Working hours functions
  getAllWorkingHours,
  updatePersonSchedule,
  updatePersonDay,
  getPersonSchedule
};
