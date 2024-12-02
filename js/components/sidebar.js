// Tutorial navigation data
const TUTORIALS = [
    {
        title: 'Getting Started',
        items: [
            { title: 'Introduction', url: '/tutorials/intro.html' },
            { title: 'Project Setup', url: '/tutorials/setup.html' },
            { title: 'Basic Configuration', url: '/tutorials/config.html' }
        ]
    },
    {
        title: 'Database Management',
        items: [
            { title: 'Creating Tables', url: '/tutorials/create-tables.html' },
            { title: 'Managing Data', url: '/tutorials/manage-data.html' },
            { title: 'Database Backups', url: '/tutorials/backups.html' }
        ]
    },
    {
        title: 'Authentication',
        items: [
            { title: 'User Authentication', url: '/tutorials/auth.html' },
            { title: 'Role Management', url: '/tutorials/roles.html' },
            { title: 'Security Best Practices', url: '/tutorials/security.html' }
        ]
    },
    {
        title: 'Advanced Topics',
        items: [
            { title: 'Real-time Data', url: '/tutorials/realtime.html' },
            { title: 'Edge Functions', url: '/tutorials/edge-functions.html' },
            { title: 'Storage Management', url: '/tutorials/storage.html' }
        ]
    }
];

class TutorialSidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        return path.substring(path.lastIndexOf('/') + 1);
    }

    render() {
        const currentPage = this.getCurrentPage();
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                
                .sidebar {
                    background: #f8f9fa;
                    padding: 1rem;
                    border-right: 1px solid #dee2e6;
                    height: 100vh;
                    overflow-y: auto;
                    position: sticky;
                    top: 0;
                }
                
                .section-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: #6c757d;
                    margin: 1.5rem 0 0.5rem;
                }
                
                .section-title:first-child {
                    margin-top: 0;
                }
                
                .nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .nav-item {
                    margin: 0.25rem 0;
                }
                
                .nav-link {
                    display: block;
                    padding: 0.5rem;
                    color: #495057;
                    text-decoration: none;
                    border-radius: 0.25rem;
                    transition: all 0.2s ease-in-out;
                }
                
                .nav-link:hover {
                    background: #e9ecef;
                    color: #000;
                }
                
                .nav-link.active {
                    background: #0d6efd;
                    color: white;
                }
                
                @media (max-width: 768px) {
                    .sidebar {
                        height: auto;
                        position: static;
                        border-right: none;
                        border-bottom: 1px solid #dee2e6;
                    }
                }
            </style>
            
            <nav class="sidebar">
                ${TUTORIALS.map(section => `
                    <h2 class="section-title">${section.title}</h2>
                    <ul class="nav-list">
                        ${section.items.map(item => `
                            <li class="nav-item">
                                <a href="${item.url}" 
                                   class="nav-link ${item.url.includes(currentPage) ? 'active' : ''}">
                                    ${item.title}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                `).join('')}
            </nav>
        `;
    }
}

// Register the custom element
customElements.define('tutorial-sidebar', TutorialSidebar);
