import { ArticlesManager } from '../articles.js';
import { showToast } from '../utils.js';

// Mock utils.js
jest.mock('../utils.js', () => ({
    showToast: jest.fn()
}));

describe('ArticlesManager', () => {
    let articlesManager;

    beforeEach(() => {
        // Clear mocks
        jest.clearAllMocks();
        document.body.innerHTML = `
            <div id="errorMessage" class="alert alert-danger d-none"></div>
            <div id="articlesList"></div>
            <form id="newArticleForm">
                <input type="text" id="articleTitle" />
                <textarea id="articleContent"></textarea>
            </form>
            <div id="toastContainer"></div>
        `;
        articlesManager = new ArticlesManager();
    });

    describe('initialization', () => {
        it('should initialize without errors', () => {
            expect(articlesManager.articlesListElement).toBeTruthy();
            expect(articlesManager.errorElement).toBeTruthy();
        });
    });

    describe('loadArticles', () => {
        it('should display loading state', async () => {
            await articlesManager.loadArticles();
            expect(articlesManager.articlesListElement.innerHTML).toContain('Loading');
        });

        it('should handle empty articles list', async () => {
            global.supabase.from().then.mockImplementationOnce(cb => 
                cb({ data: [], error: null })
            );
            await articlesManager.loadArticles();
            expect(articlesManager.articlesListElement.innerHTML).toContain('No articles found');
        });

        it('should handle error when loading articles', async () => {
            global.supabase.from().then.mockImplementationOnce(cb => 
                cb({ data: null, error: new Error('Failed to load') })
            );
            await articlesManager.loadArticles();
            expect(articlesManager.errorElement.textContent).toContain('Failed to load articles');
            expect(showToast).toHaveBeenCalledWith('Failed to load articles. Please try again later.', 'error');
        });

        it('should render articles successfully', async () => {
            const mockArticles = [
                { 
                    id: '1', 
                    title: 'Test Article', 
                    content: 'Test Content',
                    created_at: new Date().toISOString()
                }
            ];
            global.supabase.from().then.mockImplementationOnce(cb => 
                cb({ data: mockArticles, error: null })
            );
            await articlesManager.loadArticles();
            expect(articlesManager.articlesListElement.innerHTML).toContain('Test Article');
            expect(articlesManager.articlesListElement.innerHTML).toContain('Test Content');
        });
    });

    describe('createArticle', () => {
        it('should validate required fields', async () => {
            await articlesManager.createArticle();
            expect(showToast).toHaveBeenCalledWith('Please fill in all fields', 'warning');
        });

        it('should handle successful article creation', async () => {
            document.getElementById('articleTitle').value = 'New Article';
            document.getElementById('articleContent').value = 'New Content';
            
            global.supabase.from().then.mockImplementationOnce(cb => 
                cb({ data: null, error: null })
            );
            
            await articlesManager.createArticle();
            expect(showToast).toHaveBeenCalledWith('Article created successfully', 'success');
            expect(document.getElementById('articleTitle').value).toBe('');
            expect(document.getElementById('articleContent').value).toBe('');
        });

        it('should handle error during article creation', async () => {
            document.getElementById('articleTitle').value = 'New Article';
            document.getElementById('articleContent').value = 'New Content';
            
            global.supabase.from().then.mockImplementationOnce(cb => 
                cb({ data: null, error: new Error('Failed to create') })
            );
            
            await articlesManager.createArticle();
            expect(showToast).toHaveBeenCalledWith('Failed to create article', 'error');
        });
    });

    describe('deleteArticle', () => {
        it('should validate article ID', async () => {
            await articlesManager.deleteArticle();
            expect(showToast).toHaveBeenCalledWith('Failed to delete article', 'error');
        });

        it('should handle successful article deletion', async () => {
            global.supabase.from().then.mockImplementationOnce(cb => 
                cb({ data: null, error: null })
            );
            
            await articlesManager.deleteArticle('1');
            expect(showToast).toHaveBeenCalledWith('Article deleted successfully', 'success');
        });

        it('should handle error during article deletion', async () => {
            global.supabase.from().then.mockImplementationOnce(cb => 
                cb({ data: null, error: new Error('Failed to delete') })
            );
            
            await articlesManager.deleteArticle('1');
            expect(showToast).toHaveBeenCalledWith('Failed to delete article', 'error');
        });
    });

    describe('escapeHtml', () => {
        it('should escape HTML characters', () => {
            const unsafe = '<script>alert("xss")</script>';
            const escaped = articlesManager.escapeHtml(unsafe);
            expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        });
    });
});
