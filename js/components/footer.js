import { VERSION } from '../version.js';

export class Footer {
    constructor() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const footer = document.createElement('footer');
        footer.className = 'bg-dark text-light py-4 mt-5';
        footer.innerHTML = `
            <div class="container">
                <div class="row">
                    <div class="col-md-4">
                        <h5>Version Information</h5>
                        <p class="mb-1">Version: ${VERSION.number}</p>
                        <p class="mb-1">Last Updated: ${VERSION.lastUpdate}</p>
                        <p class="mb-0">
                            <button class="btn btn-link text-light p-0" data-bs-toggle="modal" data-bs-target="#changelogModal">
                                View Changelog
                            </button>
                        </p>
                    </div>
                    <div class="col-md-4">
                        <h5>Quick Links</h5>
                        <div class="row">
                            <div class="col-6">
                                <ul class="list-unstyled">
                                    ${VERSION.pages.slice(0, Math.ceil(VERSION.pages.length / 2)).map(page => `
                                        <li><a href="${page.path}" class="text-light">${page.name}</a></li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div class="col-6">
                                <ul class="list-unstyled">
                                    ${VERSION.pages.slice(Math.ceil(VERSION.pages.length / 2)).map(page => `
                                        <li><a href="${page.path}" class="text-light">${page.name}</a></li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <h5>About</h5>
                        <p>Supabase Manager is a comprehensive web application for managing Supabase projects with integrated features for database management and realtime updates.</p>
                        <p class="mb-0">
                            <a href="https://github.com/guomengtao/supabase-manager" class="text-light" target="_blank">
                                View on GitHub
                            </a>
                        </p>
                    </div>
                </div>
                <hr class="my-4">
                <div class="text-center">
                    <p class="mb-0">&copy; 2024 Supabase Manager. All rights reserved.</p>
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
                                <li>Added footer component</li>
                                <li>Enhanced Project Info page</li>
                                <li>Improved error handling</li>
                                <li>Added table preview functionality</li>
                            </ul>
                            <h6>Previous Versions</h6>
                            <p class="text-muted">History will be added in future updates.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(footer);
    }

    setupEventListeners() {
        // Add any footer-specific event listeners here
    }
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Footer();
});
