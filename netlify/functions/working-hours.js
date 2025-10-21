const { Handler } = require('@netlify/functions');

// Working hours data
let workingHours = {
  tim: {
    name: "Tim",
    schedule: {
      monday: { location: "Office", hours: "9:00 AM - 5:00 PM" },
      tuesday: { location: "Office", hours: "9:00 AM - 5:00 PM" },
      wednesday: { location: "Office", hours: "9:00 AM - 5:00 PM" },
      thursday: { location: "Office", hours: "9:00 AM - 5:00 PM" },
      friday: { location: "Work from Home", hours: "9:00 AM - 5:00 PM" }
    }
  },
  ramzi: {
    name: "Ramzi",
    schedule: {
      monday: { location: "Office", hours: "9:00 AM - 5:00 PM" },
      tuesday: { location: "Office", hours: "9:00 AM - 5:00 PM" },
      wednesday: { location: "Office", hours: "9:00 AM - 5:00 PM" },
      thursday: { location: "Office", hours: "9:00 AM - 5:00 PM" },
      friday: { location: "Work from Home", hours: "9:00 AM - 5:00 PM" }
    }
  }
};

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
    const person = pathSegments[2];
    const day = pathSegments[3];
    
    switch (httpMethod) {
      case 'GET':
        return { statusCode: 200, headers, body: JSON.stringify(workingHours) };
        
      case 'PUT':
        if (person && day) {
          const { location, hours } = JSON.parse(body);
          if (!workingHours[person]) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Person not found' }) };
          }
          if (!workingHours[person].schedule[day]) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Day not found' }) };
          }
          if (location !== undefined) {
            workingHours[person].schedule[day].location = location;
          }
          if (hours !== undefined) {
            workingHours[person].schedule[day].hours = hours;
          }
          return { statusCode: 200, headers, body: JSON.stringify(workingHours[person].schedule[day]) };
        } else if (person) {
          const { schedule } = JSON.parse(body);
          if (!workingHours[person]) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Person not found' }) };
          }
          if (schedule) {
            workingHours[person].schedule = schedule;
          }
          return { statusCode: 200, headers, body: JSON.stringify(workingHours[person]) };
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
