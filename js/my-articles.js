import { supabase, initializeTables } from './config.js';

class ArticlesManager {
    constructor() {
        this.articlesContainer = document.getElementById('articles');
        this.errorMessage = document.getElementById('errorMessage');
        this.saveButton = document.getElementById('saveArticle');
        this.articleForm = document.getElementById('articleForm');
        this.modal = new bootstrap.Modal(document.getElementById('addArticleModal'));

        this.setupEventListeners();
        this.initialize();
    }

    async initialize() {
        try {
            await initializeTables();
            await this.loadArticles();
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showError('Failed to initialize the application. Please try again later.');
        }
    }

    setupEventListeners() {
        this.saveButton.addEventListener('click', () => this.saveArticle());
    }

    async loadArticles() {
        try {
            const { data: articles, error } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.displayArticles(articles);
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showError('Failed to load articles. Please try again later.');
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
            const { error } = await supabase
                .from('articles')
                .insert([{ title, content }]);

            if (error) throw error;

            // Reset form and close modal
            titleInput.value = '';
            contentInput.value = '';
            this.modal.hide();

            // Reload articles
            await this.loadArticles();
        } catch (error) {
            console.error('Error saving article:', error);
            this.showError('Failed to save article. Please try again.');
        }
    }

    displayArticles(articles) {
        if (!articles || articles.length === 0) {
            this.articlesContainer.innerHTML = '<div class="col-12"><p class="text-center">No articles found. Create your first article!</p></div>';
            return;
        }

        this.articlesContainer.innerHTML = articles.map(article => `
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${this.escapeHtml(article.title)}</h5>
                        <p class="card-text">${this.escapeHtml(article.content)}</p>
                        <p class="card-text"><small class="text-muted">Created: ${new Date(article.created_at).toLocaleString()}</small></p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('d-none');
        setTimeout(() => {
            this.errorMessage.classList.add('d-none');
        }, 5000);
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

// Initialize the application
new ArticlesManager();
