class NotesDisplay {
    constructor() {
        this.notes = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadNotes();
        this.startAutoRefresh();
    }

    bindEvents() {
        const addBtn = document.getElementById('addNoteBtn');
        const clearBtn = document.getElementById('clearAllBtn');
        const input = document.getElementById('newNoteInput');

        addBtn.addEventListener('click', () => this.addNote());
        clearBtn.addEventListener('click', () => this.clearAllNotes());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNote();
            }
        });
    }

    async loadNotes() {
        try {
            const response = await fetch('/api/notes');
            if (response.ok) {
                this.notes = await response.json();
                this.renderNotes();
                this.updateStatus('Notes loaded successfully');
            } else {
                this.updateStatus('Error loading notes', 'error');
            }
        } catch (error) {
            console.error('Error loading notes:', error);
            this.updateStatus('Connection error', 'error');
        }
    }

    async addNote() {
        const input = document.getElementById('newNoteInput');
        const message = input.value.trim();

        if (!message) {
            this.updateStatus('Please enter a message', 'error');
            return;
        }

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, priority: 'normal' })
            });

            if (response.ok) {
                const newNote = await response.json();
                this.notes.unshift(newNote); // Add to beginning
                this.renderNotes();
                input.value = '';
                this.updateStatus('Note added successfully');
            } else {
                this.updateStatus('Error adding note', 'error');
            }
        } catch (error) {
            console.error('Error adding note:', error);
            this.updateStatus('Connection error', 'error');
        }
    }

    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.notes = this.notes.filter(note => note.id !== noteId);
                this.renderNotes();
                this.updateStatus('Note deleted successfully');
            } else {
                this.updateStatus('Error deleting note', 'error');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            this.updateStatus('Connection error', 'error');
        }
    }

    async clearAllNotes() {
        if (!confirm('Are you sure you want to clear all notes?')) {
            return;
        }

        try {
            const response = await fetch('/api/notes', {
                method: 'DELETE'
            });

            if (response.ok) {
                this.notes = [];
                this.renderNotes();
                this.updateStatus('All notes cleared');
            } else {
                this.updateStatus('Error clearing notes', 'error');
            }
        } catch (error) {
            console.error('Error clearing notes:', error);
            this.updateStatus('Connection error', 'error');
        }
    }

    renderNotes() {
        const container = document.getElementById('notesContainer');
        
        if (this.notes.length === 0) {
            container.innerHTML = `
                <div class="note-item" style="text-align: center; color: #666;">
                    <div class="note-message">No notes yet. Add your first note above!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notes.map(note => `
            <div class="note-item ${note.priority}-priority" data-note-id="${note.id}">
                <div class="note-message">${this.escapeHtml(note.message)}</div>
                <div class="note-meta">
                    <span class="note-timestamp">${this.formatTimestamp(note.timestamp)}</span>
                    <div class="note-actions">
                        <button class="edit-btn" onclick="notesDisplay.editNote(${note.id})">Edit</button>
                        <button class="delete-btn" onclick="notesDisplay.deleteNote(${note.id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        const newMessage = prompt('Edit your message:', note.message);
        if (newMessage === null || newMessage.trim() === '') return;

        this.updateNote(noteId, newMessage.trim());
    }

    async updateNote(noteId, message) {
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            if (response.ok) {
                const updatedNote = await response.json();
                const index = this.notes.findIndex(n => n.id === noteId);
                if (index !== -1) {
                    this.notes[index] = updatedNote;
                    this.renderNotes();
                    this.updateStatus('Note updated successfully');
                }
            } else {
                this.updateStatus('Error updating note', 'error');
            }
        } catch (error) {
            console.error('Error updating note:', error);
            this.updateStatus('Connection error', 'error');
        }
    }

    updateStatus(message, type = 'success') {
        const statusText = document.getElementById('statusText');
        const lastUpdate = document.getElementById('lastUpdate');
        
        statusText.textContent = message;
        statusText.style.color = type === 'error' ? '#f44336' : '#4CAF50';
        
        lastUpdate.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        
        // Clear status after 3 seconds
        setTimeout(() => {
            statusText.textContent = 'Ready';
            statusText.style.color = '#4CAF50';
        }, 3000);
    }

    startAutoRefresh() {
        // Refresh notes every 30 seconds
        setInterval(() => {
            this.loadNotes();
        }, 30000);
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the notes display when the page loads
let notesDisplay;
document.addEventListener('DOMContentLoaded', () => {
    notesDisplay = new NotesDisplay();
});