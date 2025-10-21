class NotesDisplay {
    constructor() {
        this.notes = [];
        this.workingHours = {};
        this.isConnected = false;
        this.refreshInterval = null;
        this.timeInterval = null;
        this.init();
    }

    init() {
        this.loadNotes();
        this.loadWorkingHours();
        this.startAutoRefresh();
        this.setupConnectionStatus();
    }

    async loadNotes() {
        try {
            const response = await fetch('/api/notes');
            if (response.ok) {
                this.notes = await response.json();
                this.renderNotes();
                this.updateConnectionStatus(true);
                this.updateLastUpdateTime();
            } else {
                this.updateConnectionStatus(false);
                this.showError('Failed to load notes');
            }
        } catch (error) {
            console.error('Error loading notes:', error);
            this.updateConnectionStatus(false);
            this.showError('Connection error');
        }
    }

    async loadWorkingHours() {
        try {
            const response = await fetch('/api/working-hours');
            if (response.ok) {
                this.workingHours = await response.json();
                this.renderWorkingHours();
            } else {
                console.error('Failed to load working hours');
            }
        } catch (error) {
            console.error('Error loading working hours:', error);
        }
    }

    renderNotes() {
        const container = document.getElementById('notesDisplay');
        
        if (this.notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>📝</h2>
                    <h2>No Notes Yet</h2>
                    <p>Notes will appear here when they are added.<br>Use the admin interface to add your first note.</p>
                </div>
            `;
            return;
        }

        // Sort notes by timestamp (newest first)
        const sortedNotes = [...this.notes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        container.innerHTML = sortedNotes.map(note => `
            <div class="note-card ${note.priority}-priority">
                <div class="note-message">${this.escapeHtml(note.message)}</div>
                <div class="note-timestamp">${this.formatTimestamp(note.timestamp)}</div>
            </div>
        `).join('');
    }

    renderWorkingHours() {
        const container = document.getElementById('workingHoursDisplay');
        
        if (!this.workingHours || Object.keys(this.workingHours).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>👥</h2>
                    <h2>No Schedule Available</h2>
                    <p>Working hours will appear here when configured.</p>
                </div>
            `;
            return;
        }

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const people = Object.values(this.workingHours);
        
        // Show only one person at a time, cycling through them
        const currentPersonIndex = Math.floor(Date.now() / 5000) % people.length; // Change every 5 seconds
        const currentPerson = people[currentPersonIndex];

        container.innerHTML = `
            <div class="person-schedule">
                <div class="person-name">${currentPerson.name}</div>
                ${days.map((day, index) => `
                    <div class="day-schedule">
                        <div class="day-name">${dayNames[index]}</div>
                        <div class="day-info">
                            <div class="day-location">${currentPerson.schedule[day].location}</div>
                            <div class="day-hours">${currentPerson.schedule[day].hours}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    startAutoRefresh() {
        // Refresh every 5 seconds for display and working hours flipping
        this.refreshInterval = setInterval(() => {
            this.loadNotes();
            this.loadWorkingHours();
        }, 5000);
    }


    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        this.isConnected = connected;
        
        if (connected) {
            statusElement.textContent = '●';
            statusElement.className = '';
        } else {
            statusElement.textContent = '●';
            statusElement.className = 'disconnected';
        }
    }

    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('lastUpdate');
        lastUpdateElement.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }

    showError(message) {
        const container = document.getElementById('notesDisplay');
        container.innerHTML = `
            <div class="empty-state">
                <h2>⚠️</h2>
                <h2>Connection Error</h2>
                <p>${message}<br>Retrying automatically...</p>
            </div>
        `;
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupConnectionStatus() {
        // Monitor connection status
        window.addEventListener('online', () => {
            this.updateConnectionStatus(true);
            this.loadNotes();
        });

        window.addEventListener('offline', () => {
            this.updateConnectionStatus(false);
        });

        // Check connection periodically
        setInterval(() => {
            if (navigator.onLine !== this.isConnected) {
                this.updateConnectionStatus(navigator.onLine);
                if (navigator.onLine) {
                    this.loadNotes();
                }
            }
        }, 5000);
    }


    // Cleanup on page unload
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Initialize the display when the page loads
let notesDisplay;
document.addEventListener('DOMContentLoaded', () => {
    notesDisplay = new NotesDisplay();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (notesDisplay) {
        notesDisplay.destroy();
    }
});
