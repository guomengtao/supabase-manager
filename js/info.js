import { supabase } from './config.js';

class ProjectInfo {
    constructor() {
        if (!supabase) {
            console.error('Supabase client not initialized');
            this.showError('Database connection failed. Please refresh the page.');
            return;
        }

        this.supabase = supabase;
        this.loadProjectInfo();
        this.loadTableInfo();
        this.setupRefreshButton();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.textContent = message;
        document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.row'));
    }

    async loadProjectInfo() {
        const projectUrl = document.getElementById('projectUrl');
        const apiKey = document.getElementById('apiKey');
        
        if (projectUrl) projectUrl.value = this.supabase.supabaseUrl;
        if (apiKey) apiKey.value = this.supabase.supabaseKey;
    }

    async loadTableInfo() {
        try {
            const tablesInfo = document.getElementById('tablesInfo');
            const dbStats = document.getElementById('dbStats');

            // Get tables information
            const { data: tables, error } = await this.supabase
                .from('information_schema.tables')
                .select('table_name, table_schema')
                .eq('table_schema', 'public');

            if (error) throw error;

            // Get row counts for each table
            const tableStats = await Promise.all(
                tables.map(async (table) => {
                    const { count, error: countError } = await this.supabase
                        .from(table.table_name)
                        .select('*', { count: 'exact', head: true });
                    
                    return {
                        name: table.table_name,
                        count: countError ? '?' : count
                    };
                })
            );

            // Display database statistics
            if (dbStats) {
                dbStats.innerHTML = `
                    <div class="list-group">
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between">
                                <span>Total Tables:</span>
                                <strong>${tables.length}</strong>
                            </div>
                        </div>
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between">
                                <span>Total Records:</span>
                                <strong>${tableStats.reduce((sum, table) => sum + (typeof table.count === 'number' ? table.count : 0), 0)}</strong>
                            </div>
                        </div>
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between">
                                <span>Status:</span>
                                <strong class="text-success">Connected</strong>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Display tables information
            if (tablesInfo) {
                tablesInfo.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Table Name</th>
                                <th>Record Count</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableStats.map(table => `
                                <tr>
                                    <td>${this.escapeHtml(table.name)}</td>
                                    <td>${table.count}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" onclick="projectInfo.viewTable('${table.name}')">
                                            View Data
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }

        } catch (error) {
            console.error('Error loading table information:', error);
            if (tablesInfo) tablesInfo.innerHTML = 'Error loading table information.';
            if (dbStats) dbStats.innerHTML = 'Error loading database statistics.';
        }
    }

    setupRefreshButton() {
        const refreshButton = document.createElement('button');
        refreshButton.className = 'btn btn-outline-primary float-end';
        refreshButton.innerHTML = '🔄 Refresh';
        refreshButton.onclick = () => this.loadTableInfo();
        
        const h1 = document.querySelector('h1');
        if (h1) h1.parentNode.insertBefore(refreshButton, h1.nextSibling);
    }

    async viewTable(tableName) {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select('*')
                .limit(5);

            if (error) throw error;

            // Create modal to show data
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${this.escapeHtml(tableName)} Preview</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            ${Object.keys(data[0] || {}).map(key => 
                                                `<th>${this.escapeHtml(key)}</th>`
                                            ).join('')}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.map(row => `
                                            <tr>
                                                ${Object.values(row).map(value => 
                                                    `<td>${this.escapeHtml(String(value))}</td>`
                                                ).join('')}
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div class="text-muted">Showing first 5 records</div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();

            // Clean up when modal is hidden
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });

        } catch (error) {
            console.error('Error viewing table:', error);
            alert('Error loading table data');
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

// Utility functions
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    
    const button = element.nextElementSibling;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

function togglePassword(elementId) {
    const input = document.getElementById(elementId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'Hide';
    } else {
        input.type = 'password';
        button.textContent = 'Show';
    }
}

// Initialize when DOM is loaded and make it globally available
let projectInfo;
document.addEventListener('DOMContentLoaded', () => {
    projectInfo = new ProjectInfo();
    window.projectInfo = projectInfo;
});
