const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
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

// Presets API Routes
// In-memory storage for presets (in production, use database)
let presets = [
  { id: 1, text: 'System Maintenance in Progress', priority: 'high', created_at: new Date().toISOString() },
  { id: 2, text: 'On lunch break back in an hour', priority: 'normal', created_at: new Date().toISOString() },
  { id: 3, text: 'Come in', priority: 'normal', created_at: new Date().toISOString() },
  { id: 4, text: 'in a meeting', priority: 'normal', created_at: new Date().toISOString() },
  { id: 5, text: 'Focus time', priority: 'low', created_at: new Date().toISOString() }
];

// Get all presets
app.get('/api/presets', (req, res) => {
  res.json(presets);
});

// Get a specific preset by ID
app.get('/api/presets/:id', (req, res) => {
  const presetId = parseInt(req.params.id);
  const preset = presets.find(p => p.id === presetId);
  
  if (!preset) {
    return res.status(404).json({ error: 'Preset not found' });
  }
  
  res.json(preset);
});

// Create a new preset
app.post('/api/presets', (req, res) => {
  const { text, priority = 'normal' } = req.body;
  
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  // Find the lowest available ID
  const existingIds = presets.map(p => p.id).sort((a, b) => a - b);
  let newId = 1;
  for (const id of existingIds) {
    if (id === newId) {
      newId++;
    } else {
      break;
    }
  }
  
  const newPreset = {
    id: newId,
    text: text.trim(),
    priority: priority || 'normal',
    created_at: new Date().toISOString()
  };
  
  presets.push(newPreset);
  res.status(201).json(newPreset);
});

// Update a preset
app.put('/api/presets/:id', (req, res) => {
  const presetId = parseInt(req.params.id);
  const { text, priority } = req.body;
  
  const presetIndex = presets.findIndex(p => p.id === presetId);
  
  if (presetIndex === -1) {
    return res.status(404).json({ error: 'Preset not found' });
  }
  
  if (text !== undefined) {
    presets[presetIndex].text = text.trim();
  }
  if (priority !== undefined) {
    presets[presetIndex].priority = priority;
  }
  
  res.json(presets[presetIndex]);
});

// Delete a preset
app.delete('/api/presets/:id', (req, res) => {
  const presetId = parseInt(req.params.id);
  const presetIndex = presets.findIndex(p => p.id === presetId);
  
  if (presetIndex === -1) {
    return res.status(404).json({ error: 'Preset not found' });
  }
  
  presets.splice(presetIndex, 1);
  res.json({ message: 'Preset deleted successfully' });
});

// Serve the main admin page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the display page for showing notes
app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

// Serve the video page for camera feed
app.get('/video', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'video.html'));
});

// WebSocket handling for WebRTC signaling and messaging
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle WebRTC signaling
  socket.on('offer', (data) => {
    socket.broadcast.emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.broadcast.emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.broadcast.emit('ice-candidate', data);
  });

  // Handle display messages
  socket.on('display-message', (data) => {
    console.log('Display message received:', data);
    socket.broadcast.emit('display-message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Routes:');
  console.log('  GET    /              - Admin interface');
  console.log('  GET    /display       - Display screen for notes');
  console.log('  GET    /video         - Camera feed display');
  console.log('API endpoints:');
  console.log('  GET    /api/notes     - Get all notes');
  console.log('  POST   /api/notes     - Create new note');
  console.log('  PUT    /api/notes/:id - Update note');
  console.log('  DELETE /api/notes/:id - Delete note');
  console.log('  DELETE /api/notes    - Clear all notes');
  console.log('  GET    /api/working-hours - Get working hours');
  console.log('  PUT    /api/working-hours/:person - Update person schedule');
  console.log('  PUT    /api/working-hours/:person/:day - Update specific day');
  console.log('  GET    /api/presets - Get all presets');
  console.log('  POST   /api/presets - Create new preset');
  console.log('  PUT    /api/presets/:id - Update preset');
  console.log('  DELETE /api/presets/:id - Delete preset');
});
