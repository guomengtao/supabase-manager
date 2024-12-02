import { supabase } from './config.js';
import { showToast } from './utils.js';

export class ArticlesManager {
    constructor() {
        this.articlesList = document.getElementById('articlesList');
    }

    async loadArticles() {
        try {
            const { data: articles, error } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (articles.length === 0) {
                this.articlesList.innerHTML = '<div class="list-group-item">No articles found</div>';
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
            showToast('Error loading articles', 'danger');
            this.articlesList.innerHTML = '<div class="list-group-item text-danger">Error loading articles</div>';
        }
    }

    async createArticle() {
        const titleInput = document.getElementById('articleTitle');
        const contentInput = document.getElementById('articleContent');
        
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

            showToast('Article created successfully');
            titleInput.value = '';
            contentInput.value = '';
            await this.loadArticles();

        } catch (error) {
            console.error('Error creating article:', error);
            showToast('Error creating article', 'danger');
        }
    }

    async deleteArticle(id) {
        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showToast('Article deleted successfully');
            await this.loadArticles();

        } catch (error) {
            console.error('Error deleting article:', error);
            showToast('Error deleting article', 'danger');
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
