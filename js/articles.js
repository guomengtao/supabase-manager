import { supabase, initializeTables } from './config.js';
import { showToast } from './utils.js';

export class ArticlesManager {
    constructor() {
        this.articlesListElement = document.getElementById('articlesList');
        this.errorElement = document.getElementById('errorMessage');
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for tables to be initialized
            await initializeTables();
            
            // Load articles
            await this.loadArticles();
        } catch (error) {
            console.error('Failed to initialize ArticlesManager:', error);
            this.showError('Failed to initialize articles. Please refresh the page.');
        }
    }

    showError(message) {
        console.error(message);
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.classList.remove('d-none');
        }
        showToast(message, 'error');
    }

    async loadArticles() {
        if (!this.articlesListElement) return;

        try {
            // Show loading state
            this.articlesListElement.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;

            const { data: articles, error } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.renderArticles(articles || []);
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showError('Failed to load articles. Please try again later.');
            
            if (this.articlesListElement) {
                this.articlesListElement.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        Failed to load articles. Please try again later.
                    </div>
                `;
            }
        }
    }

    renderArticles(articles) {
        if (!this.articlesListElement) return;

        if (!articles || articles.length === 0) {
            this.articlesListElement.innerHTML = `
                <div class="text-center text-muted">
                    <p>No articles found. Create your first article!</p>
                </div>
            `;
            return;
        }

        this.articlesListElement.innerHTML = articles.map(article => `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${this.escapeHtml(article.title)}</h5>
                    <small class="text-muted">
                        ${new Date(article.created_at).toLocaleDateString()}
                    </small>
                </div>
                <p class="mb-1">${this.escapeHtml(article.content)}</p>
                <button 
                    class="btn btn-danger btn-sm mt-2"
                    onclick="window.articlesManager.deleteArticle('${article.id}')"
                >
                    Delete
                </button>
            </div>
        `).join('');
    }

    async createArticle() {
        const titleInput = document.getElementById('articleTitle');
        const contentInput = document.getElementById('articleContent');
        
        if (!titleInput || !contentInput) {
            this.showError('Form elements not found');
            return;
        }
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title || !content) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        try {
            const { error } = await supabase
                .from('articles')
                .insert([{ title, content }]);

            if (error) throw error;

            showToast('Article created successfully', 'success');
            titleInput.value = '';
            contentInput.value = '';
            await this.loadArticles();
        } catch (error) {
            console.error('Error creating article:', error);
            this.showError('Failed to create article');
        }
    }

    async deleteArticle(id) {
        if (!id) {
            this.showError('Invalid article ID');
            return;
        }

        try {
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showToast('Article deleted successfully', 'success');
            await this.loadArticles();
        } catch (error) {
            console.error('Error deleting article:', error);
            this.showError('Failed to delete article');
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize when DOM is loaded
let articlesManager;
document.addEventListener('DOMContentLoaded', () => {
    articlesManager = new ArticlesManager();
});
