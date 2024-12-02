class Tutorial {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add any additional event listeners here
    }

    copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(element.value);
                this.showToast('Copied to clipboard!');
            } else {
                // Fallback for older browsers
                element.select();
                document.execCommand('copy');
                this.showToast('Copied to clipboard!');
            }
        } catch (error) {
            console.warn('Copy failed:', error);
            this.showToast('Copy failed. Please try again.', 'error');
        }
    }

    togglePassword(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const type = element.type === 'password' ? 'text' : 'password';
        element.type = type;

        // Update button icon and text
        const button = element.nextElementSibling;
        if (button) {
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = `bi bi-eye${type === 'password' ? '' : '-slash'}`;
            }
            button.textContent = `${type === 'password' ? 'Show' : 'Hide'}`;
        }
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            // Create toast container if it doesn't exist
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1050;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// Initialize tutorial
window.tutorial = new Tutorial();
