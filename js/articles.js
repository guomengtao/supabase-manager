import { supabase } from './config.js';
import { showToast } from './utils.js';

export class ArticlesManager {
    constructor() {
        this.articlesList = document.getElementById('articlesList');
        if (!this.articlesList) {
            console.error('Articles list element not found');
            return;
        }

        if (!supabase) {
            console.error('Supabase client not initialized');
            this.showError('Database connection failed. Please refresh the page.');
            return;
        }
    }

    showError(message) {
        if (this.articlesList) {
            this.articlesList.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    ${this.escapeHtml(message)}
                </div>
            `;
        }
        showToast(message, 'danger');
    }

    async loadArticles() {
        if (!this.articlesList) return;
        
        try {
            this.articlesList.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

            if (!supabase) {
                throw new Error('Database connection not available');
            }

            const { data: articles, error } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!articles || articles.length === 0) {
                this.articlesList.innerHTML = `
                    <div class="alert alert-info" role="alert">
                        No articles found. Create your first article!
                    </div>
                `;
                return;
            }

            this.articlesList.innerHTML = articles.map(article => `
                <div class="list-group-item">
                    <h5 class="mb-1">${this.escapeHtml(article.title)}</h5>
                    <p class="mb-1">${this.escapeHtml(article.content)}</p>
                    <small class="text-muted">Created: ${new Date(article.created_at).toLocaleString()}</small>
                    <button class="btn btn-danger btn-sm float-end" onclick="window.articlesManager.deleteArticle('${article.id}')">
                        Delete
                    </button>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading articles:', error);
            this.showError(error.message || 'Error loading articles');
        }
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
            if (!supabase) {
                throw new Error('Database connection not available');
            }

            const { error } = await supabase
                .from('articles')
                .insert([{ title, content }]);

            if (error) throw error;

            showToast('Article created successfully');
            titleInput.value = '';
            contentInput.value = '';
            await this.loadArticles();

        } catch (error) {
            console.error('Error creating article:', error);
            this.showError(error.message || 'Error creating article');
        }
    }

    async deleteArticle(id) {
        if (!id) {
            this.showError('Invalid article ID');
            return;
        }

        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }

        try {
            if (!supabase) {
                throw new Error('Database connection not available');
            }

            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showToast('Article deleted successfully');
            await this.loadArticles();

        } catch (error) {
            console.error('Error deleting article:', error);
            this.showError(error.message || 'Error deleting article');
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
    articlesManager.loadArticles();
});
