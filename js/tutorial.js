class Tutorial {
    constructor() {
        this.initializeDemos();
        this.setupEventListeners();
    }

    initializeDemos() {
        // Initialize the live demo section with a mini version of the info page
        const demoSection = document.getElementById('liveDemoSection');
        if (demoSection) {
            demoSection.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Project Details Demo</h5>
                        <div class="mb-3">
                            <label class="fw-bold">Project URL:</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="demoProjectUrl" value="https://example.supabase.co" readonly>
                                <button class="btn btn-outline-secondary" onclick="tutorial.copyToClipboard('demoProjectUrl')">Copy</button>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="fw-bold">API Key:</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="demoApiKey" value="demo-api-key-123" readonly>
                                <button class="btn btn-outline-secondary" onclick="tutorial.togglePassword('demoApiKey')">Show</button>
                                <button class="btn btn-outline-secondary" onclick="tutorial.copyToClipboard('demoApiKey')">Copy</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Make tutorial instance available globally for demo buttons
        window.tutorial = this;
    }

    copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        element.select();
        document.execCommand('copy');
        
        const button = element.nextElementSibling;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => button.textContent = originalText, 2000);
    }

    togglePassword(elementId) {
        const element = document.getElementById(elementId);
        if (element.type === 'password') {
            element.type = 'text';
            element.nextElementSibling.textContent = 'Hide';
        } else {
            element.type = 'password';
            element.nextElementSibling.textContent = 'Show';
        }
    }

    showLiveDemo(stepId) {
        const demoDiv = document.getElementById(`${stepId}Demo`);
        if (demoDiv) {
            demoDiv.style.display = demoDiv.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// Initialize tutorial when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Tutorial();
});
