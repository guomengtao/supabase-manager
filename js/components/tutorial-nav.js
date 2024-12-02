class TutorialNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.highlightCurrentPage();
    }

    render() {
        const currentPath = window.location.pathname;
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                
                .nav-sidebar {
                    background: #f8f9fa;
                    padding: 1rem;
                    height: 100%;
                    border-right: 1px solid #dee2e6;
                }
                
                .nav-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #0d6efd;
                    color: #212529;
                }
                
                .nav-section {
                    margin-bottom: 1.5rem;
                }
                
                .section-title {
                    font-weight: 600;
                    color: #6c757d;
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .nav-item {
                    margin-bottom: 0.25rem;
                }
                
                .nav-link {
                    display: block;
                    padding: 0.5rem 0.75rem;
                    color: #495057;
                    text-decoration: none;
                    border-radius: 0.25rem;
                    font-size: 0.9375rem;
                    transition: all 0.2s ease-in-out;
                }
                
                .nav-link:hover {
                    background: #e9ecef;
                    color: #0d6efd;
                }
                
                .nav-link.active {
                    background: #0d6efd;
                    color: white;
                }
                
                .nav-link.active:hover {
                    background: #0b5ed7;
                }
                
                @media (max-width: 768px) {
                    .nav-sidebar {
                        padding: 1rem 0.5rem;
                    }
                }
            </style>
            
            <nav class="nav-sidebar">
                <div class="nav-title">Tutorial Guide</div>
                
                <div class="nav-section">
                    <div class="section-title">Getting Started</div>
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="../tutorials/intro.html" class="nav-link">Introduction</a>
                        </li>
                        <li class="nav-item">
                            <a href="../tutorials/setup.html" class="nav-link">Project Setup</a>
                        </li>
                        <li class="nav-item">
                            <a href="../tutorials/quickstart.html" class="nav-link">Quick Start</a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section">
                    <div class="section-title">Core Concepts</div>
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="../tutorials/database.html" class="nav-link">Database Management</a>
                        </li>
                        <li class="nav-item">
                            <a href="../tutorials/auth.html" class="nav-link">Authentication</a>
                        </li>
                        <li class="nav-item">
                            <a href="../tutorials/storage.html" class="nav-link">Storage</a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section">
                    <div class="section-title">Advanced Topics</div>
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="../tutorials/realtime.html" class="nav-link">Real-time Updates</a>
                        </li>
                        <li class="nav-item">
                            <a href="../tutorials/security.html" class="nav-link">Security Best Practices</a>
                        </li>
                        <li class="nav-item">
                            <a href="../tutorials/deployment.html" class="nav-link">Deployment</a>
                        </li>
                    </ul>
                </div>
            </nav>
        `;
    }

    highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const links = this.shadowRoot.querySelectorAll('.nav-link');
        
        links.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (currentPath.endsWith(linkPath) || 
                (currentPath.endsWith('/') && linkPath.endsWith('intro.html'))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

customElements.define('tutorial-nav', TutorialNav);
