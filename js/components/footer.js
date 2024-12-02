import { VERSION } from '../version.js';

export class Footer {
    constructor() {
        this.render();
        this.setupEventListeners();
        this.loadGitHubInfo();
    }

    render() {
        const footer = document.createElement('footer');
        footer.className = 'bg-dark text-light py-4 mt-5';
        footer.innerHTML = `
            <div class="container">
                <div class="row">
                    <div class="col-md-3">
                        <h5>Version Information</h5>
                        <p class="mb-1">Version: ${VERSION.number}</p>
                        <p class="mb-1">Last Updated: ${VERSION.lastUpdate}</p>
                        <p class="mb-0">
                            <button class="btn btn-link text-light p-0" data-bs-toggle="modal" data-bs-target="#changelogModal">
                                View Changelog
                            </button>
                        </p>
                        <div id="githubInfo" class="mt-2">
                            <small class="text-muted">Loading GitHub info...</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <h5>Main Pages</h5>
                        <ul class="list-unstyled">
                            ${VERSION.pages.filter(p => !p.category || p.category === 'main').map(page => `
                                <li>
                                    <a href="${page.path}" class="text-light d-flex align-items-center mb-1">
                                        <span>${page.name}</span>
                                        ${page.path === window.location.pathname.split('/').pop() ? 
                                            '<span class="badge bg-primary ms-2">Current</span>' : ''}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="col-md-3">
                        <h5>Tools & Features</h5>
                        <ul class="list-unstyled">
                            ${VERSION.pages.filter(p => p.category === 'tools').map(page => `
                                <li>
                                    <a href="${page.path}" class="text-light d-flex align-items-center mb-1">
                                        <span>${page.name}</span>
                                        ${page.path === window.location.pathname.split('/').pop() ? 
                                            '<span class="badge bg-primary ms-2">Current</span>' : ''}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="col-md-3">
                        <h5>Project Stats</h5>
                        <ul class="list-unstyled" id="projectStats">
                            <li class="mb-1">Total Pages: ${VERSION.pages.length}</li>
                            <li class="mb-1">Main Pages: ${VERSION.pages.filter(p => !p.category || p.category === 'main').length}</li>
                            <li class="mb-1">Tools: ${VERSION.pages.filter(p => p.category === 'tools').length}</li>
                            <li>
                                <button class="btn btn-link text-light p-0" data-bs-toggle="modal" data-bs-target="#statsModal">
                                    View Details
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <hr class="my-4">
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-0">&copy; 2024 Supabase Manager. All rights reserved.</p>
                    </div>
                    <div class="col-md-6 text-end">
                        <a href="https://github.com/guomengtao/supabase-manager" class="text-light me-3" target="_blank">
                            GitHub
                        </a>
                        <a href="https://supabase.com/docs" class="text-light me-3" target="_blank">
                            Supabase Docs
                        </a>
                        <a href="#" class="text-light" data-bs-toggle="modal" data-bs-target="#supportModal">
                            Support
                        </a>
                    </div>
                </div>
            </div>

            <!-- Changelog Modal -->
            <div class="modal fade" id="changelogModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title text-dark">Changelog</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-dark">
                            <h6>Version ${VERSION.number} (${VERSION.lastUpdate})</h6>
                            <ul>
                                <li>Enhanced footer with more information</li>
                                <li>Added GitHub repository information</li>
                                <li>Improved page categorization</li>
                                <li>Added project statistics</li>
                            </ul>
                            <h6>Previous Versions</h6>
                            <ul>
                                <li>v1.0.0 (Initial Release)</li>
                                <ul>
                                    <li>Basic project setup</li>
                                    <li>Supabase integration</li>
                                    <li>Core features implementation</li>
                                </ul>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Modal -->
            <div class="modal fade" id="statsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title text-dark">Project Statistics</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-dark">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Pages by Category</h6>
                                    <ul>
                                        <li>Main Pages: ${VERSION.pages.filter(p => !p.category || p.category === 'main').length}</li>
                                        <li>Tools: ${VERSION.pages.filter(p => p.category === 'tools').length}</li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h6>Features</h6>
                                    <ul>
                                        <li>Real-time Updates</li>
                                        <li>File Management</li>
                                        <li>User Management</li>
                                        <li>Database Tools</li>
                                    </ul>
                                </div>
                            </div>
                            <hr>
                            <h6>Recent Updates</h6>
                            <ul id="recentUpdates">
                                <li>Added footer to all pages</li>
                                <li>Enhanced project information</li>
                                <li>Improved error handling</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Support Modal -->
            <div class="modal fade" id="supportModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title text-dark">Support</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-dark">
                            <h6>Documentation</h6>
                            <ul>
                                <li><a href="https://supabase.com/docs" target="_blank">Supabase Documentation</a></li>
                                <li><a href="https://github.com/guomengtao/supabase-manager" target="_blank">Project Repository</a></li>
                            </ul>
                            <h6>Common Issues</h6>
                            <ul>
                                <li>Check the console for error messages</li>
                                <li>Verify Supabase connection settings</li>
                                <li>Ensure proper API key usage</li>
                            </ul>
                            <h6>Contact</h6>
                            <p>For issues and feature requests, please use our <a href="https://github.com/guomengtao/supabase-manager/issues" target="_blank">GitHub Issues</a> page.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(footer);
    }

    async loadGitHubInfo() {
        const CACHE_KEY = 'github_stats';
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        try {
            // Check cache first
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    this.updateGitHubStats(data);
                    return;
                }
            }

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const response = await fetch('https://api.github.com/repos/guomengtao/supabase-manager', {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.status === 403) {
                throw new Error('GitHub API rate limit exceeded');
            }

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the response
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));

            this.updateGitHubStats(data);
        } catch (error) {
            console.warn('GitHub info loading:', error.message);
            this.showGitHubError();
        }
    }

    updateGitHubStats(data) {
        const githubInfo = document.getElementById('githubInfo');
        if (githubInfo && data) {
            githubInfo.innerHTML = `
                <small class="d-block text-muted">GitHub Stats:</small>
                <small class="d-block">⭐ ${data.stargazers_count} stars</small>
                <small class="d-block">🔄 ${data.forks_count} forks</small>
                <small class="d-block">👁️ ${data.watchers_count} watchers</small>
                <small class="d-block text-muted mt-2">Last updated: ${new Date().toLocaleString()}</small>
            `;
        }
    }

    showGitHubError() {
        const githubInfo = document.getElementById('githubInfo');
        if (githubInfo) {
            githubInfo.innerHTML = `
                <small class="text-muted">
                    GitHub stats temporarily unavailable<br>
                    <a href="https://github.com/guomengtao/supabase-manager" 
                       target="_blank" class="text-muted">View on GitHub</a>
                </small>
            `;
        }
    }

    showError(message, context = '') {
        console.warn(`${context}: ${message}`);
        // Optionally show user-friendly error message
    }

    handleTableError(error, tableName) {
        // Suppress 404 errors for missing tables
        if (error.status === 404) {
            this.showError(`Table '${tableName}' not found`, 'Table Access');
            return;
        }
        console.error(`Error accessing table ${tableName}:`, error);
    }

    setupEventListeners() {
        // Add any footer-specific event listeners here
    }
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Footer();
});
