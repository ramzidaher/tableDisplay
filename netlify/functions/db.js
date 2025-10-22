const { Pool } = require('pg');

// Database connection configuration
// Netlify DB provides NETLIFY_DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    console.log('NETLIFY_DATABASE_URL exists:', !!process.env.NETLIFY_DATABASE_URL);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Test connection first
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    // Create notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY,
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

    // Create presets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS presets (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'normal',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

    // Insert default presets if table is empty
    const presetCountResult = await pool.query('SELECT COUNT(*) FROM presets');
    if (parseInt(presetCountResult.rows[0].count) === 0) {
      const defaultPresets = [
        { text: 'System Maintenance in Progress', priority: 'high' },
        { text: 'On lunch break back in an hour', priority: 'normal' },
        { text: 'Come in', priority: 'normal' },
        { text: 'in a meeting', priority: 'normal' },
        { text: 'Focus time', priority: 'low' }
      ];

      for (const preset of defaultPresets) {
        await pool.query(
          'INSERT INTO presets (text, priority) VALUES ($1, $2)',
          [preset.text, preset.priority]
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
  // Find the lowest available ID
  const existingIdsResult = await pool.query('SELECT id FROM notes ORDER BY id');
  const existingIds = existingIdsResult.rows.map(row => row.id);
  
  let newId = 1;
  for (const id of existingIds) {
    if (id === newId) {
      newId++;
    } else {
      break;
    }
  }
  
  const result = await pool.query(
    'INSERT INTO notes (id, message, priority) VALUES ($1, $2, $3) RETURNING *',
    [newId, message, priority]
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

// Presets functions
async function getAllPresets() {
  const result = await pool.query('SELECT * FROM presets ORDER BY created_at DESC');
  return result.rows;
}

async function getPresetById(id) {
  const result = await pool.query('SELECT * FROM presets WHERE id = $1', [id]);
  return result.rows[0];
}

async function createPreset(text, priority = 'normal') {
  const result = await pool.query(
    'INSERT INTO presets (text, priority) VALUES ($1, $2) RETURNING *',
    [text, priority]
  );
  return result.rows[0];
}

async function updatePreset(id, text, priority) {
  const result = await pool.query(
    'UPDATE presets SET text = $1, priority = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [text, priority, id]
  );
  return result.rows[0];
}

async function deletePreset(id) {
  const result = await pool.query('DELETE FROM presets WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
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
  getPersonSchedule,
  // Presets functions
  getAllPresets,
  getPresetById,
  createPreset,
  updatePreset,
  deletePreset
};
