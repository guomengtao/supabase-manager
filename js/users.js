// Step 1: Import Supabase client
import { supabase } from './config.js';

class UserManager {
    constructor() {
        // Step 2: Check Supabase connection
        if (!supabase) {
            console.error('Supabase client not initialized');
            this.showError('Database connection failed. Please refresh the page.');
            return;
        }

        // Step 3: Initialize
        this.loadUsers();
    }

    // Step 4: Error handling functions
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        }
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.classList.add('d-none');
        }
    }

    // Step 5: Load data from Supabase
    async loadUsers() {
        try {
            // Show loading state
            document.getElementById('usersList').innerHTML = 'Loading users...';

            // Make Supabase query
            const { data: users, error } = await supabase
                .from('users')           // table name
                .select('*')             // select all columns
                .order('created_at', { ascending: false });

            // Handle error
            if (error) throw error;

            // Display data
            this.displayUsers(users);
            this.hideError();

        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users. Please try again later.');
            document.getElementById('usersList').innerHTML = '';
        }
    }

    // Step 6: Display data
    displayUsers(users) {
        const container = document.getElementById('usersList');
        
        if (!users || users.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-center">No users found.</p></div>';
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${this.escapeHtml(user.name || 'Unnamed User')}</h5>
                        <p class="card-text">
                            <small class="text-muted">Email: ${this.escapeHtml(user.email || 'No email')}</small>
                        </p>
                        <p class="card-text">
                            <small class="text-muted">Created: ${new Date(user.created_at).toLocaleString()}</small>
                        </p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Step 7: Helper functions
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Step 8: Public methods
    refreshUsers() {
        this.loadUsers();
    }
}

// Step 9: Initialize and make available globally
let userManager;
document.addEventListener('DOMContentLoaded', () => {
    userManager = new UserManager();
    window.userManager = userManager;
});
