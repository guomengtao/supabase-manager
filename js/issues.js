class IssuesManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.setupEventListeners();
        this.loadIssues();
    }

    setupEventListeners() {
        // Filter event listeners
        document.getElementById('statusFilter').addEventListener('change', () => this.loadIssues());
        document.getElementById('severityFilter').addEventListener('change', () => this.loadIssues());
        document.getElementById('searchInput').addEventListener('input', this.debounce(() => this.loadIssues(), 300));

        // Update issue status
        document.getElementById('updateIssueBtn').addEventListener('click', () => this.updateIssueStatus());
    }

    async loadIssues() {
        try {
            this.showLoading(true);

            // Get filter values
            const status = document.getElementById('statusFilter').value;
            const severity = document.getElementById('severityFilter').value;
            const search = document.getElementById('searchInput').value.toLowerCase();

            // Build query
            let query = this.supabase
                .from('issues')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }
            if (severity) {
                query = query.eq('severity', severity);
            }
            if (search) {
                query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }

            const { data: issues, error } = await query;

            if (error) throw error;

            this.renderIssues(issues);
        } catch (error) {
            console.error('Error loading issues:', error);
            this.showError('Failed to load issues');
        } finally {
            this.showLoading(false);
        }
    }

    renderIssues(issues) {
        const tbody = document.getElementById('issuesTableBody');
        tbody.innerHTML = '';

        issues.forEach(issue => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="fw-bold">${this.escapeHtml(issue.title)}</div>
                    <small class="text-muted">${this.escapeHtml(issue.file_path || '')}</small>
                </td>
                <td><span class="badge bg-${this.getStatusBadgeColor(issue.status)}">${this.escapeHtml(issue.status)}</span></td>
                <td><span class="badge bg-${this.getSeverityBadgeColor(issue.severity)}">${this.escapeHtml(issue.severity)}</span></td>
                <td>${this.escapeHtml(issue.test_name || '')}</td>
                <td>${new Date(issue.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="issuesManager.showIssueDetails('${issue.id}')">
                        Details
                    </button>
                    ${issue.github_action_url ? `
                        <a href="${this.escapeHtml(issue.github_action_url)}" target="_blank" class="btn btn-sm btn-secondary">
                            View Run
                        </a>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async showIssueDetails(issueId) {
        try {
            const { data: issue, error } = await this.supabase
                .from('issues')
                .select('*')
                .eq('id', issueId)
                .single();

            if (error) throw error;

            const detailsHtml = `
                <h4>${this.escapeHtml(issue.title)}</h4>
                <div class="mb-3">
                    <strong>Status:</strong> 
                    <select id="issueStatus" class="form-select form-select-sm d-inline-block w-auto ms-2">
                        <option value="open" ${issue.status === 'open' ? 'selected' : ''}>Open</option>
                        <option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="closed" ${issue.status === 'closed' ? 'selected' : ''}>Closed</option>
                    </select>
                </div>
                <div class="mb-3">
                    <strong>Severity:</strong> 
                    <span class="badge bg-${this.getSeverityBadgeColor(issue.severity)}">${this.escapeHtml(issue.severity)}</span>
                </div>
                ${issue.description ? `
                    <div class="mb-3">
                        <strong>Description:</strong>
                        <pre class="mt-2 bg-light p-3 rounded">${this.escapeHtml(issue.description)}</pre>
                    </div>
                ` : ''}
                ${issue.error_message ? `
                    <div class="mb-3">
                        <strong>Error Message:</strong>
                        <pre class="mt-2 bg-light p-3 rounded text-danger">${this.escapeHtml(issue.error_message)}</pre>
                    </div>
                ` : ''}
                <div class="mb-3">
                    <strong>File:</strong> ${this.escapeHtml(issue.file_path || 'N/A')}
                    ${issue.line_number ? `(Line: ${issue.line_number})` : ''}
                </div>
                <div class="mb-3">
                    <strong>Test:</strong> ${this.escapeHtml(issue.test_name || 'N/A')}
                </div>
                <div class="mb-3">
                    <strong>Created:</strong> ${new Date(issue.created_at).toLocaleString()}
                </div>
                ${issue.resolved_at ? `
                    <div class="mb-3">
                        <strong>Resolved:</strong> ${new Date(issue.resolved_at).toLocaleString()}
                    </div>
                ` : ''}
            `;

            document.getElementById('issueDetails').innerHTML = detailsHtml;
            document.getElementById('updateIssueBtn').dataset.issueId = issueId;

            const modal = new bootstrap.Modal(document.getElementById('issueModal'));
            modal.show();
        } catch (error) {
            console.error('Error loading issue details:', error);
            this.showError('Failed to load issue details');
        }
    }

    async updateIssueStatus() {
        const issueId = document.getElementById('updateIssueBtn').dataset.issueId;
        const newStatus = document.getElementById('issueStatus').value;

        try {
            const updates = {
                status: newStatus,
                resolved_at: newStatus === 'closed' ? new Date().toISOString() : null
            };

            const { error } = await this.supabase
                .from('issues')
                .update(updates)
                .eq('id', issueId);

            if (error) throw error;

            this.showSuccess('Issue updated successfully');
            this.loadIssues();

            const modal = bootstrap.Modal.getInstance(document.getElementById('issueModal'));
            modal.hide();
        } catch (error) {
            console.error('Error updating issue:', error);
            this.showError('Failed to update issue');
        }
    }

    getStatusBadgeColor(status) {
        const colors = {
            open: 'danger',
            in_progress: 'warning',
            closed: 'success'
        };
        return colors[status] || 'secondary';
    }

    getSeverityBadgeColor(severity) {
        const colors = {
            low: 'info',
            medium: 'warning',
            high: 'danger',
            critical: 'dark'
        };
        return colors[severity] || 'secondary';
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.classList.toggle('d-none', !show);
    }

    showError(message) {
        this.showToast(message, 'danger');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${this.escapeHtml(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        const container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.appendChild(toast);
        document.body.appendChild(container);

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            container.remove();
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    escapeHtml(unsafe) {
        if (unsafe == null) return '';
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize when DOM is loaded
let issuesManager;
document.addEventListener('DOMContentLoaded', () => {
    issuesManager = new IssuesManager();
    // Make it globally accessible for inline event handlers
    window.issuesManager = issuesManager;
});
