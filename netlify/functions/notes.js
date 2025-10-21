const { Handler } = require('@netlify/functions');

// In-memory storage (in production, use a database)
let notes = [
  {
    id: 1,
    message: "Welcome to your vertical table display!",
    timestamp: new Date().toISOString(),
    priority: "normal"
  }
];

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
    // Notes API
    if (pathSegments[1] === 'notes') {
      const noteId = pathSegments[2];
      
      switch (httpMethod) {
        case 'GET':
          if (noteId) {
            const note = notes.find(n => n.id === parseInt(noteId));
            if (!note) {
              return { statusCode: 404, headers, body: JSON.stringify({ error: 'Note not found' }) };
            }
            return { statusCode: 200, headers, body: JSON.stringify(note) };
          } else {
            return { statusCode: 200, headers, body: JSON.stringify(notes) };
          }
          
        case 'POST':
          const { message, priority = 'normal' } = JSON.parse(body);
          if (!message || message.trim() === '') {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
          }
          const newNote = {
            id: notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1,
            message: message.trim(),
            timestamp: new Date().toISOString(),
            priority: priority || 'normal'
          };
          notes.push(newNote);
          return { statusCode: 201, headers, body: JSON.stringify(newNote) };
          
        case 'PUT':
          if (!noteId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Note ID required' }) };
          }
          const { message: updateMessage, priority: updatePriority } = JSON.parse(body);
          const noteIndex = notes.findIndex(n => n.id === parseInt(noteId));
          if (noteIndex === -1) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Note not found' }) };
          }
          if (updateMessage !== undefined) {
            notes[noteIndex].message = updateMessage.trim();
          }
          if (updatePriority !== undefined) {
            notes[noteIndex].priority = updatePriority;
          }
          notes[noteIndex].timestamp = new Date().toISOString();
          return { statusCode: 200, headers, body: JSON.stringify(notes[noteIndex]) };
          
        case 'DELETE':
          if (noteId) {
            const deleteIndex = notes.findIndex(n => n.id === parseInt(noteId));
            if (deleteIndex === -1) {
              return { statusCode: 404, headers, body: JSON.stringify({ error: 'Note not found' }) };
            }
            notes.splice(deleteIndex, 1);
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Note deleted successfully' }) };
          } else {
            notes = [];
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'All notes cleared' }) };
          }
      }
    }
    
    // Working Hours API
    if (pathSegments[1] === 'working-hours') {
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
      }
    }
    
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
    
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

module.exports = { handler };
