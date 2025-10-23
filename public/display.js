class NotesDisplay {
    constructor() {
        this.notes = [];
        this.workingHours = {};
        this.isConnected = false;
        this.refreshInterval = null;
        this.timeInterval = null;
        this.cameraStream = null;
        this.hiddenCamera = null;
        this.socket = null;
        this.peerConnection = null;
        this.isStreaming = false;
        this.init();
    }

    init() {
        this.loadNotes();
        this.loadWorkingHours();
        this.startAutoRefresh();
        this.setupConnectionStatus();
        this.initializeAbly();
        this.initializeCamera();
        this.setupMessageModal();
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
                // Set default working hours if API fails
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
                this.renderWorkingHours();
            }
        } catch (error) {
            console.error('Error loading working hours:', error);
            // Set default working hours if API fails
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
            this.renderWorkingHours();
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

        // Add fade-in animation for new notes
        const notesHtml = sortedNotes.map(note => `
            <div class="note-card ${note.priority}-priority fade-in">
                <div class="note-message">${this.escapeHtml(note.message)}</div>
                <div class="note-timestamp">${this.formatTimestamp(note.timestamp)}</div>
            </div>
        `).join('');

        container.innerHTML = notesHtml;
        
        // Trigger animation for new notes
        setTimeout(() => {
            const noteCards = container.querySelectorAll('.note-card');
            noteCards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
        }, 50);
    }

    renderWorkingHours() {
        const container = document.getElementById('workingHoursDisplay');
        
        console.log('Working hours data:', this.workingHours); // Debug log
        
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
        
        // Handle different data structures
        let people = [];
        
        if (Array.isArray(this.workingHours)) {
            // If it's an array of people
            people = this.workingHours;
        } else {
            // If it's an object with people as keys
            people = Object.keys(this.workingHours).map(key => {
                const personData = this.workingHours[key];
                return {
                    name: personData.name || key.charAt(0).toUpperCase() + key.slice(1),
                    schedule: personData.schedule || personData
                };
            });
        }
        
        if (people.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>👥</h2>
                    <h2>No Schedule Available</h2>
                    <p>Working hours will appear here when configured.</p>
                </div>
            `;
            return;
        }
        
        // Show only one person at a time, cycling through them
        const currentPersonIndex = Math.floor(Date.now() / 5000) % people.length; // Change every 5 seconds
        const currentPerson = people[currentPersonIndex];

        console.log('Current person:', currentPerson); // Debug log

        // Add fade transition
        const existingSchedule = container.querySelector('.person-schedule');
        if (existingSchedule) {
            existingSchedule.classList.add('fade-out');
        }

        setTimeout(() => {
            container.innerHTML = `
                <div class="person-schedule fade-in">
                    <div class="person-name">${currentPerson.name}</div>
                    ${days.map((day, index) => {
                        const dayData = currentPerson.schedule[day];
                        if (!dayData) {
                            return `
                                <div class="day-schedule">
                                    <div class="day-name">${dayNames[index]}</div>
                                    <div class="day-info">
                                        <div class="day-location">Not set</div>
                                        <div class="day-hours">Not set</div>
                                    </div>
                                </div>
                            `;
                        }
                        return `
                            <div class="day-schedule">
                                <div class="day-name">${dayNames[index]}</div>
                                <div class="day-info">
                                    <div class="day-location">${dayData.location || 'Not set'}</div>
                                    <div class="day-hours">${dayData.hours || 'Not set'}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }, existingSchedule ? 150 : 0);
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


    // Ably initialization
    async initializeAbly() {
        try {
            // Check if Ably is available
            if (!window.Ably) {
                console.log('Ably not available, using fallback mode');
                this.ably = null;
                return;
            }

            // Create Ably connection with token authentication
            this.ably = new Ably.Realtime({
                authUrl: '/.netlify/functions/ably-token-request',
                clientId: 'display-' + Date.now()
            });

            this.ably.connection.on('connected', () => {
                console.log('Connected to Ably');
                this.setupAblyChannels();
            });

            this.ably.connection.on('disconnected', () => {
                console.log('Disconnected from Ably');
            });

        } catch (error) {
            console.log('Ably initialization failed, using fallback mode:', error);
            this.ably = null;
        }
    }

    setupAblyChannels() {
        if (!this.ably) return;

        // WebRTC signaling channel
        this.webrtcChannel = this.ably.channels.get('webrtc-signaling');
        this.webrtcChannel.subscribe('offer', async (message) => {
            await this.handleOffer(message.data);
        });
        this.webrtcChannel.subscribe('answer', async (message) => {
            await this.handleAnswer(message.data);
        });
        this.webrtcChannel.subscribe('ice-candidate', async (message) => {
            await this.handleIceCandidate(message.data);
        });

        // Display messages channel
        this.messageChannel = this.ably.channels.get('display-messages');
        this.messageChannel.subscribe('display-message', (message) => {
            console.log('Display message received:', message.data);
            this.showMessageModal(message.data);
        });
    }

    // Initialize camera access and WebRTC streaming
    async initializeCamera() {
        try {
            this.hiddenCamera = document.getElementById('hiddenCamera');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.log('Camera access not supported in this browser');
                return;
            }
            
            const constraints = {
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 24, max: 30 },
                    facingMode: 'user'
                },
                audio: false
            };

            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.hiddenCamera.srcObject = this.cameraStream;
            
            // Wait for video to load
            await new Promise((resolve, reject) => {
                this.hiddenCamera.onloadedmetadata = resolve;
                this.hiddenCamera.onerror = reject;
                setTimeout(() => reject(new Error('Camera load timeout')), 5000);
            });
            
            console.log('Camera initialized successfully');
            
            // Open video page in new tab/window
            this.openVideoPage();
            
        } catch (error) {
            console.error('Camera initialization failed:', error);
            // Don't show error to user as camera is optional for display
        }
    }

    // Open video page in new tab
    openVideoPage() {
        try {
            // Open video page in new tab
            const videoUrl = window.location.origin + '/video';
            const videoWindow = window.open(videoUrl, '_blank', 'width=800,height=600,scrollbars=no,resizable=yes');
            
            // Wait a bit for the video page to load, then start WebRTC
            setTimeout(() => {
                this.startWebRTCStreaming();
            }, 2000);
            
        } catch (error) {
            console.error('Failed to open video page:', error);
        }
    }

    // Start WebRTC streaming
    async startWebRTCStreaming() {
        if (!this.cameraStream) {
            console.error('No camera stream available');
            return;
        }

        try {
            // Create peer connection
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // Add camera stream to peer connection
            this.cameraStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.cameraStream);
            });

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.emit('ice-candidate', event.candidate);
                }
            };

            // Create and send offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.socket.emit('offer', offer);

            this.isStreaming = true;
            console.log('WebRTC streaming started');

        } catch (error) {
            console.error('WebRTC streaming failed:', error);
        }
    }

    // Handle incoming offer
    async handleOffer(data) {
        // This is typically handled by the receiver (video page)
        // Display page is the sender, so we don't handle offers here
    }

    // Handle incoming answer
    async handleAnswer(data) {
        if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(data);
        }
    }

    // Handle incoming ICE candidate
    async handleIceCandidate(data) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(data);
        }
    }

    // Message Modal Setup
    setupMessageModal() {
        // Create modal HTML if it doesn't exist
        if (!document.getElementById('messageModal')) {
            const modalHTML = `
                <div id="messageModal" class="message-modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>📢 Important Message</h2>
                            <button class="modal-close" onclick="notesDisplay.closeMessageModal()">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="message-text" id="modalMessageText"></div>
                            <div class="message-timer" id="modalTimer">10</div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    showMessageModal(messageData) {
        const modal = document.getElementById('messageModal');
        const messageText = document.getElementById('modalMessageText');
        const timer = document.getElementById('modalTimer');
        
        if (!modal || !messageText || !timer) return;

        // Set message content
        messageText.textContent = messageData.text;
        
        // Add priority styling
        modal.className = `message-modal ${messageData.priority}-priority`;
        
        // Show modal
        modal.style.display = 'flex';
        
        // Start 10-second countdown
        let timeLeft = 10;
        timer.textContent = timeLeft;
        
        const countdown = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                this.closeMessageModal();
            }
        }, 1000);
        
        // Store countdown ID for manual close
        modal.dataset.countdownId = countdown;
    }

    closeMessageModal() {
        const modal = document.getElementById('messageModal');
        if (!modal) return;
        
        // Clear countdown if exists
        if (modal.dataset.countdownId) {
            clearInterval(modal.dataset.countdownId);
        }
        
        // Hide modal
        modal.style.display = 'none';
    }

    // Cleanup on page unload
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Close WebRTC connection
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        
        // Stop camera stream
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
        
        // Close socket connection
        if (this.socket) {
            this.socket.disconnect();
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
