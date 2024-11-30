class ProjectInfo {
    constructor() {
        this.supabase = supabase;
        this.loadProjectInfo();
        this.loadTableInfo();
    }

    async loadProjectInfo() {
        const projectUrl = document.getElementById('projectUrl');
        const apiKey = document.getElementById('apiKey');
        
        projectUrl.value = SUPABASE_URL;
        apiKey.value = SUPABASE_ANON_KEY;
    }

    async loadTableInfo() {
        try {
            const tablesInfo = document.getElementById('tablesInfo');
            const dbStats = document.getElementById('dbStats');

            // Get tables information using Supabase's built-in schema query
            const { data: tables, error } = await this.supabase
                .from('information_schema.tables')
                .select('*')
                .eq('table_schema', 'public');

            if (error) throw error;

            // Get columns information for each table
            const tableDetails = await Promise.all(tables.map(async (table) => {
                const { data: columns, error: columnError } = await this.supabase
                    .from('information_schema.columns')
                    .select('*')
                    .eq('table_schema', 'public')
                    .eq('table_name', table.table_name);

                if (columnError) throw columnError;
                return { table, columns };
            }));

            // Update UI with tables information
            this.updateTablesUI(tableDetails);
            this.updateStatsUI(tableDetails);

        } catch (error) {
            console.error('Error loading table information:', error);
            this.showError('Failed to load table information');
        }
    }

    updateTablesUI(tableDetails) {
        const tablesInfo = document.getElementById('tablesInfo');
        
        let html = '<div class="accordion" id="tablesAccordion">';
        
        tableDetails.forEach((detail, index) => {
            html += `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" 
                                data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                            ${detail.table.table_name}
                        </button>
                    </h2>
                    <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                         data-bs-parent="#tablesAccordion">
                        <div class="accordion-body">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Column Name</th>
                                        <th>Data Type</th>
                                        <th>Nullable</th>
                                        <th>Default Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${detail.columns.map(column => `
                                        <tr>
                                            <td>${column.column_name}</td>
                                            <td>${column.data_type}</td>
                                            <td>${column.is_nullable}</td>
                                            <td>${column.column_default || '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        tablesInfo.innerHTML = html;
    }

    updateStatsUI(tableDetails) {
        const dbStats = document.getElementById('dbStats');
        
        const stats = {
            totalTables: tableDetails.length,
            totalColumns: tableDetails.reduce((acc, detail) => acc + detail.columns.length, 0),
        };

        dbStats.innerHTML = `
            <ul class="list-unstyled">
                <li>Total Tables: ${stats.totalTables}</li>
                <li>Total Columns: ${stats.totalColumns}</li>
            </ul>
        `;
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-danger border-0';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
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
    }
}

// Utility functions
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    
    // Show feedback
    const button = element.nextElementSibling;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => button.textContent = originalText, 2000);
}

function togglePassword(elementId) {
    const element = document.getElementById(elementId);
    const button = element.nextElementSibling;
    
    if (element.type === 'password') {
        element.type = 'text';
        button.textContent = 'Hide';
    } else {
        element.type = 'password';
        button.textContent = 'Show';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProjectInfo();
});
