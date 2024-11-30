export class RealtimeManager {
    constructor(supabaseClient = supabase) {
        this.supabase = supabaseClient;
        this.subscription = null;
        this.connected = false;
        this.setupEventListeners();
        this.loadTables();
        this.connect();
    }

    setupEventListeners() {
        document.getElementById('toggleConnection').addEventListener('click', () => {
            if (this.connected) {
                this.disconnect();
            } else {
                this.connect();
            }
        });

        document.getElementById('subscribeBtn').addEventListener('click', () => {
            this.subscribeToTable();
        });

        document.getElementById('clearEvents').addEventListener('click', () => {
            this.clearEvents();
        });
    }

    async loadTables() {
        try {
            const { data: tables, error } = await this.supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');

            if (error) throw error;

            const tableSelect = document.getElementById('tableSelect');
            tableSelect.innerHTML = tables
                .map(table => `<option value="${table.table_name}">${table.table_name}</option>`)
                .join('');

        } catch (error) {
            console.error('Error loading tables:', error);
            this.showError('Failed to load tables');
        }
    }

    async connect() {
        try {
            await this.supabase.channel('any').subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    this.connected = true;
                    this.updateConnectionStatus('Connected', 'success');
                    document.getElementById('toggleConnection').textContent = 'Disconnect';
                }
            });
        } catch (error) {
            console.error('Error connecting:', error);
            this.showError('Failed to connect');
            this.updateConnectionStatus('Connection failed', 'danger');
        }
    }

    disconnect() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        this.connected = false;
        this.updateConnectionStatus('Disconnected', 'warning');
        document.getElementById('toggleConnection').textContent = 'Connect';
    }

    async subscribeToTable() {
        const tableSelect = document.getElementById('tableSelect');
        const tableName = tableSelect.value;

        if (!tableName) {
            this.showError('Please select a table');
            return;
        }

        // Get selected events
        const events = ['insertEvent', 'updateEvent', 'deleteEvent']
            .filter(id => document.getElementById(id).checked)
            .map(id => document.getElementById(id).value);

        if (events.length === 0) {
            this.showError('Please select at least one event type');
            return;
        }

        // Unsubscribe from previous subscription if exists
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        try {
            this.subscription = this.supabase
                .channel('table-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: tableName
                }, (payload) => {
                    this.logEvent(payload);
                })
                .subscribe();

            this.showSuccess(`Subscribed to ${tableName} table changes`);
            this.logEvent({
                type: 'subscription',
                table: tableName,
                events: events
            });

        } catch (error) {
            console.error('Error subscribing to table:', error);
            this.showError('Failed to subscribe to table changes');
        }
    }

    updateConnectionStatus(message, type) {
        const statusElement = document.getElementById('connectionStatus');
        statusElement.className = `alert alert-${type}`;
        statusElement.textContent = message;
    }

    logEvent(payload) {
        const eventsLog = document.getElementById('eventsLog');
        const eventDiv = document.createElement('div');
        eventDiv.className = 'mb-2 p-2 border rounded';

        let eventContent = '';
        if (payload.type === 'subscription') {
            eventDiv.className += ' bg-info bg-opacity-10';
            eventContent = `
                <strong>Subscribed to table:</strong> ${payload.table}<br>
                <strong>Events:</strong> ${payload.events.join(', ')}
            `;
        } else {
            switch (payload.eventType) {
                case 'INSERT':
                    eventDiv.className += ' bg-success bg-opacity-10';
                    break;
                case 'UPDATE':
                    eventDiv.className += ' bg-warning bg-opacity-10';
                    break;
                case 'DELETE':
                    eventDiv.className += ' bg-danger bg-opacity-10';
                    break;
            }
            eventContent = `
                <strong>Event:</strong> ${payload.eventType}<br>
                <strong>Table:</strong> ${payload.table}<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                <strong>Data:</strong> <pre class="mb-0 mt-1">${JSON.stringify(payload.new || payload.old, null, 2)}</pre>
            `;
        }

        eventDiv.innerHTML = eventContent;
        eventsLog.insertBefore(eventDiv, eventsLog.firstChild);
    }

    clearEvents() {
        const eventsLog = document.getElementById('eventsLog');
        eventsLog.innerHTML = '<div class="text-muted">Waiting for events...</div>';
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

        toast.addEventListener('hidden.bs.toast', () => {
            container.remove();
        });
    }
}

// Initialize when DOM is loaded
let realtimeManager;
document.addEventListener('DOMContentLoaded', () => {
    realtimeManager = new RealtimeManager();
});
