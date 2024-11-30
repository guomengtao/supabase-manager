// Main application functionality
class SupabaseManager {
    constructor() {
        this.supabase = supabase;
        this.config = window.appConfig;
        this.init();
    }

    async init() {
        // Check if we're on the index page
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
            this.loadDashboard();
        }
    }

    async loadDashboard() {
        try {
            const dbStats = document.getElementById('dbStats');
            const recentActivities = document.getElementById('recentActivities');

            // Load database statistics
            const { data: stats, error: statsError } = await this.supabase
                .from(this.config.tables.activities)
                .select('count');

            if (statsError) throw statsError;

            // Load recent activities
            const { data: activities, error: activitiesError } = await this.supabase
                .from(this.config.tables.activities)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (activitiesError) throw activitiesError;

            // Update UI
            this.updateDashboardUI(stats, activities);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    updateDashboardUI(stats, activities) {
        const dbStats = document.getElementById('dbStats');
        const recentActivities = document.getElementById('recentActivities');

        // Update stats
        dbStats.innerHTML = `
            <p>Total Records: ${stats.length > 0 ? stats[0].count : 0}</p>
        `;

        // Update activities
        if (activities && activities.length > 0) {
            recentActivities.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <strong>${activity.type}</strong>
                    <span>${new Date(activity.created_at).toLocaleString()}</span>
                </div>
            `).join('');
        } else {
            recentActivities.innerHTML = '<p>No recent activities</p>';
        }
    }

    showError(message) {
        // Create error toast
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

        // Add toast to container
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.appendChild(toast);
        document.body.appendChild(container);

        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SupabaseManager();
});
