const { Handler } = require('@netlify/functions');
const { 
  initializeDatabase,
  getAllWorkingHours,
  updatePersonSchedule,
  updatePersonDay,
  getPersonSchedule
} = require('./db');

const handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  const pathSegments = path.split('/').filter(Boolean);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    // Initialize database on first request
    await initializeDatabase();
    
    const person = pathSegments[2];
    const day = pathSegments[3];
    
    switch (httpMethod) {
      case 'GET':
        const workingHours = await getAllWorkingHours();
        return { statusCode: 200, headers, body: JSON.stringify(workingHours) };
        
      case 'PUT':
        if (person && day) {
          const { location, hours } = JSON.parse(body);
          const result = await updatePersonDay(person, day, location, hours);
          return { statusCode: 200, headers, body: JSON.stringify(result) };
        } else if (person) {
          const { schedule } = JSON.parse(body);
          const result = await updatePersonSchedule(person, schedule);
          return { statusCode: 200, headers, body: JSON.stringify(result) };
        }
        break;
    }
    
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
    
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

module.exports = { handler };
