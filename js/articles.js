import { supabase } from './config.js';

class ArticlesManager {
    constructor() {
        this.supabase = supabase;
        this.loadArticles();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Reset form when modal is closed
        document.getElementById('addArticleModal')?.addEventListener('hidden.bs.modal', () => {
            document.getElementById('articleForm').reset();
        });

        document.getElementById('editArticleModal')?.addEventListener('hidden.bs.modal', () => {
            document.getElementById('editArticleForm').reset();
        });
    }

    async loadArticles() {
        try {
            const { data: articles, error } = await this.supabase
                .from('articles')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.updateArticlesTable(articles);
        } catch (error) {
            console.error('Error loading articles:', error);
            document.getElementById('errorMessage').textContent = 'Error loading articles. Please try again later.';
        }
    }

    updateArticlesTable(articles) {
        const tableBody = document.getElementById('articlesTableBody');
        
        if (!articles || articles.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No articles found</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = articles.map(article => `
            <tr>
                <td>${this.escapeHtml(article.title)}</td>
                <td>${this.formatTags(article.tags)}</td>
                <td>
                    ${article.url ? 
                        `<a href="${this.escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">
                            ${this.escapeHtml(article.url)}
                         </a>` : 
                        '-'}
                </td>
                <td>${new Date(article.created_at).toLocaleString()}</td>
                <td>${new Date(article.updated_at || article.created_at).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-2" onclick="articlesManager.editArticle('${article.id}')">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="articlesManager.deleteArticle('${article.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatTags(tags) {
        if (!tags || tags.length === 0) return '-';
        return tags.map(tag => `
            <span class="badge bg-secondary me-1">${this.escapeHtml(tag)}</span>
        `).join('');
    }

    async addArticle() {
        try {
            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;
            const url = document.getElementById('url').value;
            const tags = document.getElementById('tags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);

            if (!title || !content) {
                document.getElementById('errorMessage').textContent = 'Title and content are required';
                return;
            }

            const { data, error } = await this.supabase
                .from('articles')
                .insert([
                    {
                        title,
                        content,
                        url: url || null,
                        tags,
                        is_deleted: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;

            // Close modal and reload articles
            const modal = bootstrap.Modal.getInstance(document.getElementById('addArticleModal'));
            modal.hide();
            this.loadArticles();
            document.getElementById('successMessage').textContent = 'Article added successfully';

        } catch (error) {
            console.error('Error adding article:', error);
            document.getElementById('errorMessage').textContent = 'Failed to add article';
        }
    }

    async editArticle(id) {
        try {
            const { data: article, error } = await this.supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Populate form
            document.getElementById('editArticleId').value = article.id;
            document.getElementById('editTitle').value = article.title;
            document.getElementById('editContent').value = article.content;
            document.getElementById('editUrl').value = article.url || '';
            document.getElementById('editTags').value = article.tags ? article.tags.join(', ') : '';

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('editArticleModal'));
            modal.show();

        } catch (error) {
            console.error('Error loading article for edit:', error);
            document.getElementById('errorMessage').textContent = 'Failed to load article';
        }
    }

    async updateArticle() {
        try {
            const id = document.getElementById('editArticleId').value;
            const title = document.getElementById('editTitle').value;
            const content = document.getElementById('editContent').value;
            const url = document.getElementById('editUrl').value;
            const tags = document.getElementById('editTags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);

            if (!title || !content) {
                document.getElementById('errorMessage').textContent = 'Title and content are required';
                return;
            }

            const { data, error } = await this.supabase
                .from('articles')
                .update({
                    title,
                    content,
                    url: url || null,
                    tags,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            // Close modal and reload articles
            const modal = bootstrap.Modal.getInstance(document.getElementById('editArticleModal'));
            modal.hide();
            this.loadArticles();
            document.getElementById('successMessage').textContent = 'Article updated successfully';

        } catch (error) {
            console.error('Error updating article:', error);
            document.getElementById('errorMessage').textContent = 'Failed to update article';
        }
    }

    async deleteArticle(id) {
        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }

        try {
            const { error } = await this.supabase
                .from('articles')
                .update({ is_deleted: true })
                .eq('id', id);

            if (error) throw error;

            this.loadArticles();
            document.getElementById('successMessage').textContent = 'Article deleted successfully';

        } catch (error) {
            console.error('Error deleting article:', error);
            document.getElementById('errorMessage').textContent = 'Failed to delete article';
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
