class AdminDashboard {
    constructor() {
        this.notes = [];
        this.workingHours = {};
        this.socket = null;
        this.cameraStream = null;
        this.hiddenCamera = null;
        this.peerConnection = null;
        this.isStreaming = false;
        this.currentTab = 'notes';
        this.presets = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadNotes();
        this.loadWorkingHours();
        this.loadPresets();
        this.initializeSocket();
        this.startAutoRefresh();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Header controls
        document.getElementById('openDisplayBtn').addEventListener('click', () => this.openDisplay());
        document.getElementById('openVideoBtn').addEventListener('click', () => this.openVideo());
        document.getElementById('startCameraBtn').addEventListener('click', () => this.startCameraStream());

        // Notes controls
        document.getElementById('addNoteBtn').addEventListener('click', () => this.addNote());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllNotes());
        document.getElementById('newNoteInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNote();
        });

        // Camera controls
        document.getElementById('initCameraBtn').addEventListener('click', () => this.initializeCamera());
        document.getElementById('startStreamBtn').addEventListener('click', () => this.startWebRTCStreaming());
        document.getElementById('stopStreamBtn').addEventListener('click', () => this.stopStreaming());
    }

    // Tab Management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Load content for specific tabs
        if (tabName === 'schedule') {
            this.renderSchedule();
        }
    }

    // Socket.IO initialization
    initializeSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to signaling server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from signaling server');
        });

        // Handle WebRTC signaling
        this.socket.on('offer', async (data) => {
            await this.handleOffer(data);
        });

        this.socket.on('answer', async (data) => {
            await this.handleAnswer(data);
        });

        this.socket.on('ice-candidate', async (data) => {
            await this.handleIceCandidate(data);
        });
    }

    // Notes Management
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
        const prioritySelect = document.getElementById('prioritySelect');
        const message = input.value.trim();
        const priority = prioritySelect.value;

        if (!message) {
            this.updateStatus('Please enter a message', 'error');
            return;
        }

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, priority })
            });

            if (response.ok) {
                const newNote = await response.json();
                this.notes.unshift(newNote);
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
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
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
        if (!confirm('Are you sure you want to clear all notes?')) return;

        try {
            const response = await fetch('/api/notes', { method: 'DELETE' });
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
                headers: { 'Content-Type': 'application/json' },
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
                        <button class="edit-btn" onclick="adminDashboard.editNote(${note.id})">Edit</button>
                        <button class="delete-btn" onclick="adminDashboard.deleteNote(${note.id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Presets Management
    async loadPresets() {
        try {
            const response = await fetch('/api/presets');
            if (response.ok) {
                this.presets = await response.json();
                this.renderPresets();
                this.updateStatus('Presets loaded successfully');
            } else {
                this.updateStatus('Error loading presets', 'error');
            }
        } catch (error) {
            console.error('Error loading presets:', error);
            this.updateStatus('Connection error', 'error');
        }
    }

    renderPresets() {
        const container = document.getElementById('presetsContainer');
        container.innerHTML = `
            <div class="presets-header">
                <h3>Quick Preset Notes</h3>
                <button class="control-btn" onclick="adminDashboard.addNewPreset()">➕ Add New Preset</button>
            </div>
            <div class="presets-grid">
                ${this.presets.map((preset, index) => `
                    <div class="preset-item ${preset.priority}-priority">
                        <div class="preset-content" onclick="adminDashboard.addPresetNote(${preset.id})">
                            <div class="preset-text">${preset.text}</div>
                            <div class="preset-priority">${preset.priority.toUpperCase()}</div>
                        </div>
                        <div class="preset-actions">
                            <button class="edit-preset-btn" onclick="adminDashboard.editPreset(${preset.id})" title="Edit Preset">✏️</button>
                            <button class="delete-preset-btn" onclick="adminDashboard.deletePreset(${preset.id})" title="Delete Preset">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async addPresetNote(presetId) {
        const preset = this.presets.find(p => p.id === presetId);
        if (!preset) {
            this.updateStatus('Preset not found', 'error');
            return;
        }
        
        // Show options dialog
        const choice = confirm(`Choose how to use this preset:\n\nOK = Add as Note\nCancel = Send as Message`);
        
        if (choice) {
            // Add as note
            try {
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: preset.text, priority: preset.priority })
                });

                if (response.ok) {
                    const newNote = await response.json();
                    this.notes.unshift(newNote);
                    this.renderNotes();
                    this.updateStatus('Preset note added successfully');
                } else {
                    this.updateStatus('Error adding preset note', 'error');
                }
            } catch (error) {
                console.error('Error adding preset note:', error);
                this.updateStatus('Connection error', 'error');
            }
        } else {
            // Send as message
            this.sendMessage(preset.text, preset.priority);
        }
    }

    sendMessage(text, priority) {
        if (this.socket) {
            const message = {
                text: text,
                priority: priority,
                timestamp: new Date().toISOString(),
                type: 'popup'
            };
            
            this.socket.emit('display-message', message);
            this.updateStatus('Message sent to display');
        } else {
            this.updateStatus('Connection not available', 'error');
        }
    }

    async addNewPreset() {
        const text = prompt('Enter preset text:');
        if (!text || text.trim() === '') return;

        const priority = prompt('Enter priority (normal/high/low):', 'normal');
        if (!['normal', 'high', 'low'].includes(priority)) {
            this.updateStatus('Invalid priority. Use normal, high, or low', 'error');
            return;
        }

        try {
            const response = await fetch('/api/presets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim(), priority })
            });

            if (response.ok) {
                await this.loadPresets();
                this.updateStatus('New preset added successfully');
            } else {
                this.updateStatus('Error adding preset', 'error');
            }
        } catch (error) {
            console.error('Error adding preset:', error);
            this.updateStatus('Connection error', 'error');
        }
    }

    async editPreset(presetId) {
        const preset = this.presets.find(p => p.id === presetId);
        if (!preset) {
            this.updateStatus('Preset not found', 'error');
            return;
        }

        const newText = prompt('Edit preset text:', preset.text);
        if (newText === null || newText.trim() === '') return;

        const newPriority = prompt('Edit priority (normal/high/low):', preset.priority);
        if (!['normal', 'high', 'low'].includes(newPriority)) {
            this.updateStatus('Invalid priority. Use normal, high, or low', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/presets/${presetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newText.trim(), priority: newPriority })
            });

            if (response.ok) {
                await this.loadPresets();
                this.updateStatus('Preset updated successfully');
            } else {
                this.updateStatus('Error updating preset', 'error');
            }
        } catch (error) {
            console.error('Error updating preset:', error);
            this.updateStatus('Connection error', 'error');
        }
    }

    async deletePreset(presetId) {
        if (!confirm('Are you sure you want to delete this preset?')) return;

        try {
            const response = await fetch(`/api/presets/${presetId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadPresets();
                this.updateStatus('Preset deleted successfully');
            } else {
                this.updateStatus('Error deleting preset', 'error');
            }
        } catch (error) {
            console.error('Error deleting preset:', error);
            this.updateStatus('Connection error', 'error');
        }
    }

    // Working Hours Management
    async loadWorkingHours() {
        try {
            const response = await fetch('/api/working-hours');
            if (response.ok) {
                this.workingHours = await response.json();
                console.log('Loaded working hours:', this.workingHours);
            } else {
                console.error('Failed to load working hours');
                this.setDefaultWorkingHours();
            }
        } catch (error) {
            console.error('Error loading working hours:', error);
            this.setDefaultWorkingHours();
        }
    }

    setDefaultWorkingHours() {
        this.workingHours = {
            tim: {
                name: 'Tim',
                schedule: {
                    monday: { location: 'Office', hours: '9:00 AM - 5:00 PM' },
                    tuesday: { location: 'Office', hours: '9:00 AM - 5:00 PM' },
                    wednesday: { location: 'Office', hours: '9:00 AM - 5:00 PM' },
                    thursday: { location: 'Office', hours: '9:00 AM - 5:00 PM' },
                    friday: { location: 'Work from Home', hours: '9:00 AM - 5:00 PM' }
                }
            },
            ramzi: {
                name: 'Ramzi',
                schedule: {
                    monday: { location: 'Office', hours: '9:00 AM - 5:00 PM' },
                    tuesday: { location: 'Office', hours: '9:00 AM - 5:00 PM' },
                    wednesday: { location: 'Office', hours: '9:00 AM - 5:00 PM' },
                    thursday: { location: 'Office', hours: '9:00 AM - 5:00 PM' },
                    friday: { location: 'Work from Home', hours: '9:00 AM - 5:00 PM' }
                }
            }
        };
    }

    renderSchedule() {
        const container = document.getElementById('scheduleContainer');
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        if (!this.workingHours || Object.keys(this.workingHours).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No schedule data available</h3>
                    <p>Working hours will appear here when configured.</p>
                </div>
            `;
            return;
        }

        const people = Object.keys(this.workingHours).map(key => {
            const personData = this.workingHours[key];
            return {
                key: key,
                name: personData.name || key.charAt(0).toUpperCase() + key.slice(1),
                schedule: personData.schedule || personData
            };
        });

        container.innerHTML = people.map(person => `
            <div class="person-schedule">
                <h3>${person.name}</h3>
                <div class="schedule-grid">
                    ${days.map((day, index) => {
                        const dayData = person.schedule[day];
                        return `
                            <div class="day-schedule">
                                <div class="day-name">${dayNames[index]}</div>
                                <div class="day-info">
                                    <input type="text" placeholder="Location" 
                                           value="${dayData?.location || ''}" 
                                           onchange="adminDashboard.updateSchedule('${person.key}', '${day}', 'location', this.value)">
                                    <input type="text" placeholder="Hours" 
                                           value="${dayData?.hours || ''}" 
                                           onchange="adminDashboard.updateSchedule('${person.key}', '${day}', 'hours', this.value)">
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }

    async updateSchedule(person, day, field, value) {
        try {
            const response = await fetch(`/api/working-hours/${person}/${day}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            });

            if (response.ok) {
                this.updateStatus('Schedule updated successfully');
            } else {
                this.updateStatus('Error updating schedule', 'error');
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            this.updateStatus('Connection error', 'error');
        }
    }

    // Camera Management
    async initializeCamera() {
        try {
            this.hiddenCamera = document.getElementById('hiddenCamera');
            
            const constraints = {
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 },
                    facingMode: 'user'
                },
                audio: false
            };

            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.hiddenCamera.srcObject = this.cameraStream;
            
            this.updateCameraStatus('Camera initialized', true);
            document.getElementById('startStreamBtn').disabled = false;
            this.updateStatus('Camera initialized successfully');
            
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.updateCameraStatus('Camera failed', false);
            this.updateStatus('Camera initialization failed', 'error');
        }
    }

    async startWebRTCStreaming() {
        if (!this.cameraStream) {
            this.updateStatus('Please initialize camera first', 'error');
            return;
        }

        try {
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            this.cameraStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.cameraStream);
            });

            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.emit('ice-candidate', event.candidate);
                }
            };

            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.socket.emit('offer', offer);

            this.isStreaming = true;
            this.updateCameraStatus('Streaming active', true);
            document.getElementById('startStreamBtn').disabled = true;
            document.getElementById('stopStreamBtn').disabled = false;
            this.updateStatus('WebRTC streaming started');

        } catch (error) {
            console.error('WebRTC streaming failed:', error);
            this.updateStatus('WebRTC streaming failed', 'error');
        }
    }

    stopStreaming() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        this.isStreaming = false;
        this.updateCameraStatus('Streaming stopped', false);
        document.getElementById('startStreamBtn').disabled = false;
        document.getElementById('stopStreamBtn').disabled = true;
        this.updateStatus('Streaming stopped');
    }

    async handleOffer(data) {
        // This is typically handled by the receiver (video page)
    }

    async handleAnswer(data) {
        if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(data);
        }
    }

    async handleIceCandidate(data) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(data);
        }
    }

    updateCameraStatus(text, connected) {
        const statusDot = document.getElementById('cameraStatusDot');
        const statusText = document.getElementById('cameraStatusText');
        
        statusText.textContent = text;
        statusDot.className = connected ? 'status-dot connected' : 'status-dot';
    }

    // Navigation
    openDisplay() {
        const displayUrl = window.location.origin + '/display';
        window.open(displayUrl, '_blank', 'width=1200,height=800,scrollbars=no,resizable=yes');
    }

    openVideo() {
        const videoUrl = window.location.origin + '/video';
        window.open(videoUrl, '_blank', 'width=800,height=600,scrollbars=no,resizable=yes');
    }

    startCameraStream() {
        this.initializeCamera();
        setTimeout(() => {
            this.startWebRTCStreaming();
        }, 2000);
    }

    // Utility Methods
    updateStatus(message, type = 'success') {
        const statusText = document.getElementById('statusText');
        const lastUpdate = document.getElementById('lastUpdate');
        
        statusText.textContent = message;
        statusText.style.color = type === 'error' ? '#f44336' : '#4CAF50';
        
        lastUpdate.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        
        setTimeout(() => {
            statusText.textContent = 'Ready';
            statusText.style.color = '#4CAF50';
        }, 3000);
    }

    startAutoRefresh() {
        setInterval(() => {
            this.loadNotes();
            this.loadWorkingHours();
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

    // Cleanup
    destroy() {
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Initialize the admin dashboard when the page loads
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (adminDashboard) {
        adminDashboard.destroy();
    }
});