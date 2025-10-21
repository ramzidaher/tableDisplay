const { Handler } = require('@netlify/functions');
const { 
  initializeDatabase,
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  clearAllNotes
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
    
    // Notes API
    if (pathSegments[1] === 'notes') {
      const noteId = pathSegments[2];
      
      switch (httpMethod) {
        case 'GET':
          if (noteId) {
            const note = await getNoteById(parseInt(noteId));
            if (!note) {
              return { statusCode: 404, headers, body: JSON.stringify({ error: 'Note not found' }) };
            }
            return { statusCode: 200, headers, body: JSON.stringify(note) };
          } else {
            const notes = await getAllNotes();
            return { statusCode: 200, headers, body: JSON.stringify(notes) };
          }
          
        case 'POST':
          const { message, priority = 'normal' } = JSON.parse(body);
          if (!message || message.trim() === '') {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
          }
          const newNote = await createNote(message.trim(), priority);
          return { statusCode: 201, headers, body: JSON.stringify(newNote) };
          
        case 'PUT':
          if (!noteId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Note ID required' }) };
          }
          const { message: updateMessage, priority: updatePriority } = JSON.parse(body);
          const updatedNote = await updateNote(parseInt(noteId), updateMessage, updatePriority);
          if (!updatedNote) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Note not found' }) };
          }
          return { statusCode: 200, headers, body: JSON.stringify(updatedNote) };
          
        case 'DELETE':
          if (noteId) {
            const deletedNote = await deleteNote(parseInt(noteId));
            if (!deletedNote) {
              return { statusCode: 404, headers, body: JSON.stringify({ error: 'Note not found' }) };
            }
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Note deleted successfully' }) };
          } else {
            await clearAllNotes();
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'All notes cleared' }) };
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
