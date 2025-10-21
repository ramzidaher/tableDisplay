# Vertical Table Display - Notes Web Server

A beautiful web server for displaying notes on a vertical table display with a glass effect. Perfect for digital signage or information displays.

## Features

- 🎨 **Beautiful Glass Effect UI** - Modern glassmorphism design
- 📝 **Real-time Notes Management** - Add, edit, delete notes instantly
- 📱 **Responsive Design** - Works on any screen size
- 🔄 **Auto-refresh** - Updates every 30 seconds
- 🎯 **RESTful API** - Full CRUD operations
- ⚡ **Fast & Lightweight** - Built with Node.js and Express

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open Your Browser
Navigate to: `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| DELETE | `/api/notes` | Clear all notes |

### Example API Usage

**Create a new note:**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"message": "Your message here", "priority": "normal"}'
```

**Get all notes:**
```bash
curl http://localhost:3000/api/notes
```

**Update a note:**
```bash
curl -X PUT http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"message": "Updated message"}'
```

**Delete a note:**
```bash
curl -X DELETE http://localhost:3000/api/notes/1
```

## Usage

1. **Adding Notes**: Type your message in the input field and click "Add Note" or press Enter
2. **Editing Notes**: Click the "Edit" button on any note to modify it
3. **Deleting Notes**: Click the "Delete" button to remove a note
4. **Clearing All**: Use the "Clear All" button to remove all notes

## Customization

### Changing the Port
Set the `PORT` environment variable:
```bash
PORT=8080 npm start
```

### Priority Levels
Notes support three priority levels:
- `normal` (default) - Green border
- `high` - Red border and background
- `low` - Blue border and background

## File Structure

```
tableDisplay/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── public/            # Static files
│   ├── index.html     # Main display page
│   ├── styles.css     # Glass effect styling
│   └── script.js      # Frontend JavaScript
└── README.md          # This file
```

## Development

For development with auto-restart:
```bash
npm run dev
```

## Requirements

- Node.js 14+ 
- npm or yarn

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - Feel free to use this project for your digital displays!
