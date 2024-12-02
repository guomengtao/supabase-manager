import { supabase } from './js/config.js';

class MyArticlesManager {
    constructor() {
        // Check if Supabase is initialized
        if (!supabase) {
            console.error('Supabase client not initialized');
            this.showError('Database connection failed. Please refresh the page.');
            return;
        }

        this.supabase = supabase;
        this.loadArticles();
        this.setupEventListeners();
        this.setupRealtimeSubscription();
    }

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

    async loadArticles() {
        try {
            const { data, error } = await this.supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.displayArticles(data);
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showError('Failed to load articles. Please try again later.');
        }
    }

    setupRealtimeSubscription() {
        // Subscribe to all changes in the articles table
        this.subscription = this.supabase
            .channel('articles_channel')
            .on('postgres_changes', 
                {
                    event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'articles'
                },
                (payload) => {
                    console.log('Realtime update:', payload);
                    this.handleRealtimeUpdate(payload);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(' Realtime subscription active');
                    // Show realtime indicator
                    this.updateRealtimeStatus(true);
                } else {
                    console.log(' Realtime subscription status:', status);
                    this.updateRealtimeStatus(false);
                }
            });
    }

    updateRealtimeStatus(isActive) {
        // Create or update realtime status indicator
        let statusElement = document.getElementById('realtimeStatus');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'realtimeStatus';
            statusElement.className = 'position-fixed bottom-0 end-0 m-3 p-2 rounded';
            document.body.appendChild(statusElement);
        }

        if (isActive) {
            statusElement.className = 'position-fixed bottom-0 end-0 m-3 p-2 rounded bg-success text-white';
            statusElement.innerHTML = ' Realtime Active';
        } else {
            statusElement.className = 'position-fixed bottom-0 end-0 m-3 p-2 rounded bg-warning text-dark';
            statusElement.innerHTML = ' Realtime Disconnected';
        }
    }

    handleRealtimeUpdate(payload) {
        const { eventType } = payload;
        
        // Show notification
        this.showNotification(eventType, payload.new?.title || payload.old?.title);

        // Reload articles to show latest data
        this.loadArticles();
    }

    showNotification(eventType, articleTitle) {
        const notifications = document.getElementById('notifications') || this.createNotificationsContainer();
        
        const notification = document.createElement('div');
        notification.className = 'toast';
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">Article Update</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${this.getNotificationMessage(eventType, articleTitle)}
            </div>
        `;

        notifications.appendChild(notification);
        const toast = new bootstrap.Toast(notification);
        toast.show();

        // Remove notification after it's hidden
        notification.addEventListener('hidden.bs.toast', () => {
            notification.remove();
        });
    }

    createNotificationsContainer() {
        const container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
        return container;
    }

    getNotificationMessage(eventType, title) {
        switch (eventType) {
            case 'INSERT':
                return `New article added: "${title}"`;
            case 'UPDATE':
                return `Article updated: "${title}"`;
            case 'DELETE':
                return `Article deleted: "${title}"`;
            default:
                return 'Article change detected';
        }
    }

    displayArticles(articles) {
        const container = document.getElementById('articles');
        container.innerHTML = '';

        if (!articles || articles.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-center">No articles found.</p></div>';
            return;
        }

        articles.forEach(article => {
            const articleElement = document.createElement('div');
            articleElement.className = 'col-md-6 col-lg-4 mb-4';
            articleElement.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${this.escapeHtml(article.title)}</h5>
                        <p class="card-text">${this.escapeHtml(article.content)}</p>
                        <small class="text-muted">Last updated: ${new Date(article.created_at).toLocaleString()}</small>
                    </div>
                    <div class="card-footer d-flex justify-content-end gap-2">
                        <button class="btn btn-danger btn-sm" onclick="articleManager.deleteArticle(${article.id})">Delete</button>
                        <button class="btn btn-primary btn-sm" onclick="articleManager.editArticle(${article.id})">Edit</button>
                    </div>
                </div>
            `;
            container.appendChild(articleElement);
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    setupEventListeners() {
        const saveButton = document.getElementById('saveArticle');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveArticle());
        }
    }

    async saveArticle() {
        const titleInput = document.getElementById('title');
        const contentInput = document.getElementById('content');

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            this.showError('Please fill in all fields');
            return;
        }

        try {
            const { error } = await this.supabase
                .from('articles')
                .insert([{ title, content }]);

            if (error) throw error;

            // Clear form and close modal
            titleInput.value = '';
            contentInput.value = '';
            const modal = bootstrap.Modal.getInstance(document.getElementById('addArticleModal'));
            modal.hide();

            // Reload articles
            this.loadArticles();
            this.hideError();
        } catch (error) {
            console.error('Error saving article:', error);
            this.showError('Failed to save article. Please try again.');
        }
    }

    async deleteArticle(id) {
        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }

        try {
            const { error } = await this.supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            this.loadArticles();
        } catch (error) {
            console.error('Error deleting article:', error);
            this.showError('Failed to delete article. Please try again.');
        }
    }

    async editArticle(id) {
        // TODO: Implement edit functionality
        alert('Edit functionality coming soon!');
    }
}

// Create a global instance for button onclick handlers
let articleManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    articleManager = new MyArticlesManager();
    // Make it globally available for button onclick handlers
    window.articleManager = articleManager;
});