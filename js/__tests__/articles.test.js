import '@testing-library/jest-dom';
import { ArticlesManager } from '../articles';

describe('ArticlesManager', () => {
  let articlesManager;
  
  beforeEach(() => {
    // Setup DOM elements needed for testing
    document.body.innerHTML = `
      <div id="articlesTableBody"></div>
      <form id="articleForm">
        <input id="title" />
        <textarea id="content"></textarea>
        <input id="url" />
        <input id="tags" />
      </form>
    `;
    
    articlesManager = new ArticlesManager();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should initialize with empty articles table', () => {
    const tableBody = document.getElementById('articlesTableBody');
    expect(tableBody.innerHTML).toContain('Loading articles...');
  });

  test('should format tags correctly', () => {
    const tags = ['test', 'javascript', 'supabase'];
    const formatted = articlesManager.formatTags(tags);
    expect(formatted).toContain('badge bg-secondary');
    expect(formatted).toContain('test');
    expect(formatted).toContain('javascript');
    expect(formatted).toContain('supabase');
  });

  test('should handle empty tags', () => {
    expect(articlesManager.formatTags([])).toBe('-');
    expect(articlesManager.formatTags(null)).toBe('-');
  });

  test('should escape HTML in content', () => {
    const unsafe = '<script>alert("xss")</script>';
    const escaped = articlesManager.escapeHtml(unsafe);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
  });
});
