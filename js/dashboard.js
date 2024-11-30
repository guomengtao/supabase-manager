import { supabase, ERROR_MESSAGES } from './config.js';

class DashboardManager {
    constructor() {
        this.initializeEventListeners();
        this.loadDashboardData();
    }

    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadDashboardData();
        });
    }

    async loadDashboardData() {
        try {
            const errorMessageElement = document.getElementById('errorMessage');
            const loadingElement = document.getElementById('loadingMessage');
            
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
            if (errorMessageElement) {
                errorMessageElement.style.display = 'none';
            }

            // Test connection
            const { data: connectionTest, error: connectionError } = await supabase
                .from('articles')
                .select('count', { count: 'exact' });

            if (connectionError) {
                throw new Error('Connection test failed');
            }

            // Load statistics
            const { data: stats, error: statsError } = await supabase
                .from('articles')
                .select('*');

            if (statsError) {
                throw statsError;
            }

            // Update UI with statistics
            this.updateStatistics(stats);

            // Load recent activities
            const { data: activities, error: activitiesError } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (activitiesError) {
                throw activitiesError;
            }

            // Update UI with activities
            this.updateActivities(activities);

            if (loadingElement) {
                loadingElement.style.display = 'none';
            }

        } catch (error) {
            console.error('Dashboard data loading error:', error);
            
            if (errorMessageElement) {
                errorMessageElement.style.display = 'block';
                errorMessageElement.textContent = this.getErrorMessage(error);
            }
            
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }
    }

    updateStatistics(stats) {
        const totalArticles = stats.length;
        const totalSize = stats.reduce((acc, curr) => acc + (curr.size || 0), 0);
        const activeArticles = stats.filter(article => !article.deleted_at).length;

        document.getElementById('totalArticles')?.textContent = totalArticles;
        document.getElementById('totalSize')?.textContent = this.formatSize(totalSize);
        document.getElementById('activeArticles')?.textContent = activeArticles;
    }

    updateActivities(activities) {
        const activitiesContainer = document.getElementById('recentActivities');
        if (!activitiesContainer) return;

        activitiesContainer.innerHTML = activities.length ? activities.map(activity => `
            <div class="activity-item">
                <div class="activity-title">${this.escapeHtml(activity.title)}</div>
                <div class="activity-time">${this.formatDate(activity.created_at)}</div>
            </div>
        `).join('') : '<p>No recent activities</p>';
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    getErrorMessage(error) {
        if (error.message?.includes('JWT')) {
            return ERROR_MESSAGES.UNAUTHORIZED;
        }
        if (error.message?.includes('rate limit')) {
            return ERROR_MESSAGES.RATE_LIMIT;
        }
        if (error.message?.includes('network') || error.message?.includes('connection')) {
            return ERROR_MESSAGES.CONNECTION_ERROR;
        }
        return ERROR_MESSAGES.DEFAULT;
    }
}

// Initialize dashboard
new DashboardManager();
