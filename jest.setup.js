import '@testing-library/jest-dom';

// Mock Supabase client
global.supabase = {
    createClient: jest.fn(() => ({
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            then: jest.fn().mockImplementation(cb => cb({ data: [], error: null }))
        })),
        rpc: jest.fn().mockResolvedValue({ data: null, error: null })
    }))
};

// Mock DOM elements
document.body.innerHTML = `
    <div id="errorMessage" class="alert alert-danger d-none"></div>
    <div id="articlesList"></div>
    <form id="newArticleForm">
        <input type="text" id="articleTitle" />
        <textarea id="articleContent"></textarea>
    </form>
    <div id="toastContainer"></div>
`;

// Mock window.location
delete window.location;
window.location = {
    pathname: '/tutorials/intro.html',
    href: 'http://localhost:3000/tutorials/intro.html'
};
