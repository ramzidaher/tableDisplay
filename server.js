const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage for notes (in production, use a database)
let notes = [
  {
    id: 1,
    message: "Welcome to your vertical table display!",
    timestamp: new Date().toISOString(),
    priority: "normal"
  }
];

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

// API Routes
// Get all notes
app.get('/api/notes', (req, res) => {
  res.json(notes);
});

// Get a specific note by ID
app.get('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const note = notes.find(n => n.id === noteId);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  res.json(note);
});

// Create a new note
app.post('/api/notes', (req, res) => {
  const { message, priority = 'normal' } = req.body;
  
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Find the lowest available ID
  const existingIds = notes.map(n => n.id).sort((a, b) => a - b);
  let newId = 1;
  for (const id of existingIds) {
    if (id === newId) {
      newId++;
    } else {
      break;
    }
  }
  
  const newNote = {
    id: newId,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    priority: priority || 'normal'
  };
  
  notes.push(newNote);
  res.status(201).json(newNote);
});

// Update a note
app.put('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const { message, priority } = req.body;
  
  const noteIndex = notes.findIndex(n => n.id === noteId);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  if (message !== undefined) {
    notes[noteIndex].message = message.trim();
  }
  if (priority !== undefined) {
    notes[noteIndex].priority = priority;
  }
  notes[noteIndex].timestamp = new Date().toISOString();
  
  res.json(notes[noteIndex]);
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const noteIndex = notes.findIndex(n => n.id === noteId);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  notes.splice(noteIndex, 1);
  res.json({ message: 'Note deleted successfully' });
});

// Clear all notes
app.delete('/api/notes', (req, res) => {
  notes = [];
  res.json({ message: 'All notes cleared' });
});

// Working Hours API Routes
// Get all working hours
app.get('/api/working-hours', (req, res) => {
  res.json(workingHours);
});

// Update working hours for a person
app.put('/api/working-hours/:person', (req, res) => {
  const person = req.params.person.toLowerCase();
  const { schedule } = req.body;
  
  if (!workingHours[person]) {
    return res.status(404).json({ error: 'Person not found' });
  }
  
  if (schedule) {
    workingHours[person].schedule = schedule;
  }
  
  res.json(workingHours[person]);
});

// Update specific day for a person
app.put('/api/working-hours/:person/:day', (req, res) => {
  const person = req.params.person.toLowerCase();
  const day = req.params.day.toLowerCase();
  const { location, hours } = req.body;
  
  if (!workingHours[person]) {
    return res.status(404).json({ error: 'Person not found' });
  }
  
  if (!workingHours[person].schedule[day]) {
    return res.status(404).json({ error: 'Day not found' });
  }
  
  if (location !== undefined) {
    workingHours[person].schedule[day].location = location;
  }
  if (hours !== undefined) {
    workingHours[person].schedule[day].hours = hours;
  }
  
  res.json(workingHours[person].schedule[day]);
});

// Serve the main admin page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the display page for showing notes
app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Routes:');
  console.log('  GET    /              - Admin interface');
  console.log('  GET    /display       - Display screen for notes');
  console.log('API endpoints:');
  console.log('  GET    /api/notes     - Get all notes');
  console.log('  POST   /api/notes     - Create new note');
  console.log('  PUT    /api/notes/:id - Update note');
  console.log('  DELETE /api/notes/:id - Delete note');
  console.log('  DELETE /api/notes    - Clear all notes');
  console.log('  GET    /api/working-hours - Get working hours');
  console.log('  PUT    /api/working-hours/:person - Update person schedule');
  console.log('  PUT    /api/working-hours/:person/:day - Update specific day');
});
