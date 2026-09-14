// Random Joke Generator using External API

class JokeGenerator {
    constructor() {
        this.currentJoke = null;
        this.jokeCount = 0;
        this.errorCount = 0;
        this.jokeHistory = this.loadHistory();
        this.selectedType = 'any';
        this.initElements();
        this.attachEventListeners();
        this.loadJoke(); // Load initial joke
    }

    // Initialize DOM elements
    initElements() {
        this.getJokeBtn = document.getElementById('getJokeBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.jokeText = document.getElementById('jokeText');
        this.jokeType = document.getElementById('jokeType');
        this.loading = document.getElementById('loading');
        this.notification = document.getElementById('notification');
        this.jokeCount = document.getElementById('jokeCount');
        this.errorCount = document.getElementById('errorCount');
        this.jokeTypeFilter = document.getElementById('jokeTypeFilter');
        this.historyList = document.getElementById('historyList');
        this.jokeCountDisplay = 0;
        this.errorCountDisplay = 0;
    }

    // Attach event listeners
    attachEventListeners() {
        this.getJokeBtn.addEventListener('click', () => this.loadJoke());
        this.shareBtn.addEventListener('click', () => this.shareJoke());
        this.copyBtn.addEventListener('click', () => this.copyJoke());
        this.jokeTypeFilter.addEventListener('change', (e) => {
            this.selectedType = e.target.value;
        });
    }

    // Load joke from API
    async loadJoke() {
        this.getJokeBtn.disabled = true;
        this.showLoading(true);

        try {
            const url = this.buildApiUrl();
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.currentJoke = this.formatJoke(data);
            this.displayJoke();
            this.jokeCountDisplay++;
            this.updateStats();
            this.addToHistory(this.currentJoke);
            this.showNotification('Joke loaded successfully! 😂');
        } catch (error) {
            console.error('Error fetching joke:', error);
            this.errorCountDisplay++;
            this.updateStats();
            this.showNotification('Failed to load joke. Try again!', 'error');
        } finally {
            this.showLoading(false);
            this.getJokeBtn.disabled = false;
        }
    }

    // Build API URL based on selected type
    buildApiUrl() {
        const baseUrl = 'https://official-joke-api.appspot.com';

        switch (this.selectedType) {
            case 'general':
                return `${baseUrl}/jokes/general/random`;
            case 'programming':
                return `${baseUrl}/jokes/programming/random`;
            case 'knock-knock':
                return `${baseUrl}/jokes/knock-knock/random`;
            default:
                return `${baseUrl}/random_joke`;
        }
    }

    // Format joke data from API
    formatJoke(data) {
        if (data.setup && data.punchline) {
            return {
                text: `${data.setup}\n\n${data.punchline}`,
                type: data.type || 'General',
                full: true
            };
        } else if (data.joke) {
            return {
                text: data.joke,
                type: data.type || 'General',
                full: false
            };
        }
        return {
            text: 'Could not format joke',
            type: 'Unknown',
            full: false
        };
    }

    // Display joke on screen
    displayJoke() {
        if (this.currentJoke) {
            this.jokeText.textContent = this.currentJoke.text;
            this.jokeType.textContent = `📌 ${this.currentJoke.type.toUpperCase()}`;
            this.jokeText.style.animation = 'none';
            setTimeout(() => {
                this.jokeText.style.animation = 'fadeIn 0.5s ease-out';
            }, 10);
        }
    }

    // Show/hide loading state
    showLoading(show) {
        if (show) {
            this.loading.classList.remove('hidden');
            this.jokeText.style.opacity = '0.5';
        } else {
            this.loading.classList.add('hidden');
            this.jokeText.style.opacity = '1';
        }
    }

    // Share joke on social media
    shareJoke() {
        if (!this.currentJoke) {
            this.showNotification('No joke to share!', 'error');
            return;
        }

        const text = encodeURIComponent(this.currentJoke.text);
        const url = encodeURIComponent(window.location.href);

        // Create share options
        const shareOptions = {
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            whatsapp: `https://wa.me/?text=${text}`,
            email: `mailto:?subject=Funny Joke&body=${text}`
        };

        // Show share menu (simple implementation)
        const shareText = `Check out this joke: "${this.currentJoke.text.slice(0, 50)}..."\n\nShare it with friends!`;
        
        if (navigator.share) {
            navigator.share({
                title: '😂 Funny Joke',
                text: this.currentJoke.text,
                url: window.location.href
            }).catch(err => console.log('Share cancelled'));
        } else {
            // Fallback: copy to clipboard
            this.copyToClipboard(this.currentJoke.text);
            this.showNotification('Joke copied! Share it manually 📤');
        }
    }

    // Copy joke to clipboard
    copyJoke() {
        if (!this.currentJoke) {
            this.showNotification('No joke to copy!', 'error');
            return;
        }

        this.copyToClipboard(this.currentJoke.text);
        this.showNotification('Joke copied to clipboard! 📋');
    }

    // Copy text to clipboard
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(err => {
                console.error('Copy failed:', err);
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }

    // Add joke to history
    addToHistory(joke) {
        if (this.jokeHistory.length >= 10) {
            this.jokeHistory.pop();
        }
        this.jokeHistory.unshift({
            text: joke.text.slice(0, 50) + '...',
            timestamp: new Date().toLocaleTimeString()
        });
        this.saveHistory();
        this.renderHistory();
    }

    // Render joke history
    renderHistory() {
        if (this.jokeHistory.length === 0) {
            this.historyList.innerHTML = '<div class="empty-history">No history yet</div>';
            return;
        }

        this.historyList.innerHTML = this.jokeHistory
            .map((item, index) => `
                <div class="history-item" title="${item.text}">
                    <strong>#${index + 1}</strong> - ${item.text}
                    <br><small>${item.timestamp}</small>
                </div>
            `)
            .join('');
    }

    // Save history to localStorage
    saveHistory() {
        localStorage.setItem('jokeHistory', JSON.stringify(this.jokeHistory));
    }

    // Load history from localStorage
    loadHistory() {
        try {
            const stored = localStorage.getItem('jokeHistory');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    // Update statistics
    updateStats() {
        document.getElementById('jokeCount').textContent = `Jokes loaded: ${this.jokeCountDisplay}`;
        document.getElementById('errorCount').textContent = `Errors: ${this.errorCountDisplay}`;
    }

    // Show notification
    showNotification(message, type = 'success') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type === 'error' ? 'error' : ''}`;

        setTimeout(() => {
            this.notification.classList.add('hidden');
        }, 3000);
    }
}

// Initialize app when DOM is ready
let jokeApp;
document.addEventListener('DOMContentLoaded', () => {
    jokeApp = new JokeGenerator();
});