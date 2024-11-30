class FileManager {
    constructor() {
        this.supabase = supabase;
        this.uploadQueue = [];
        this.setupEventListeners();
        this.loadFiles();
        this.loadStorageStats();
    }

    setupEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const searchInput = document.getElementById('searchInput');
        const refreshButton = document.getElementById('refreshFiles');

        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            this.handleFileSelection(files);
        });

        // Click to upload
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFileSelection(files);
        });

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            this.filterFiles(e.target.value);
        });

        // Refresh button
        refreshButton.addEventListener('click', () => {
            this.loadFiles();
            this.loadStorageStats();
        });
    }

    async handleFileSelection(files) {
        // Validate file sizes
        const invalidFiles = files.filter(file => file.size > 50 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            this.showError(`Some files exceed the 50MB limit: ${invalidFiles.map(f => f.name).join(', ')}`);
            return;
        }

        // Add files to upload queue
        files.forEach(file => {
            this.uploadQueue.push({
                file,
                status: 'pending',
                progress: 0
            });
        });

        this.updateQueueDisplay();
        this.processQueue();
    }

    updateQueueDisplay() {
        const queueElement = document.getElementById('uploadQueue');
        queueElement.innerHTML = this.uploadQueue.map((item, index) => `
            <div class="upload-queue-item mb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="upload-info">
                        <span class="upload-filename">${item.file.name}</span>
                        <span class="upload-size text-muted">(${this.formatFileSize(item.file.size)})</span>
                    </div>
                    <div class="upload-status">
                        ${item.status === 'pending' ? 'Pending...' :
                          item.status === 'uploading' ? `${Math.round(item.progress)}%` :
                          item.status === 'completed' ? '<span class="text-success">Completed</span>' :
                          '<span class="text-danger">Failed</span>'}
                    </div>
                </div>
                ${item.status === 'uploading' ? `
                    <div class="progress mt-1" style="height: 2px;">
                        <div class="progress-bar" role="progressbar" style="width: ${item.progress}%"></div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    async processQueue() {
        const pendingUploads = this.uploadQueue.filter(item => item.status === 'pending');
        
        for (const item of pendingUploads) {
            item.status = 'uploading';
            this.updateQueueDisplay();

            try {
                // Generate unique file name
                const fileName = `${Date.now()}-${item.file.name}`;

                // Upload to Supabase Storage
                const { data, error } = await this.supabase.storage
                    .from('files')
                    .upload(fileName, item.file, {
                        cacheControl: '3600',
                        upsert: false,
                        onUploadProgress: (progress) => {
                            item.progress = (progress.loaded / progress.total) * 100;
                            this.updateQueueDisplay();
                        }
                    });

                if (error) throw error;

                item.status = 'completed';
                this.updateQueueDisplay();

                // Refresh file list and storage stats
                this.loadFiles();
                this.loadStorageStats();

            } catch (error) {
                console.error('Error uploading file:', error);
                item.status = 'failed';
                this.updateQueueDisplay();
                this.showError(`Failed to upload ${item.file.name}`);
            }
        }

        // Clear completed and failed uploads after 5 seconds
        setTimeout(() => {
            this.uploadQueue = this.uploadQueue.filter(item => item.status === 'pending' || item.status === 'uploading');
            this.updateQueueDisplay();
        }, 5000);
    }

    async loadFiles() {
        try {
            const { data, error } = await this.supabase.storage
                .from('files')
                .list('', {
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) throw error;

            const filesList = document.getElementById('filesList');
            
            if (!data || data.length === 0) {
                filesList.innerHTML = '<p class="text-muted text-center">No files found</p>';
                return;
            }

            filesList.innerHTML = data.map(file => {
                const { publicUrl } = this.supabase.storage
                    .from('files')
                    .getPublicUrl(file.name);

                return `
                    <div class="file-item" data-name="${file.name.toLowerCase()}">
                        <div class="file-icon">
                            <i class="bi bi-file-earmark"></i>
                        </div>
                        <div class="file-info">
                            <p class="file-name">${file.name}</p>
                            <p class="file-size">${this.formatFileSize(file.metadata.size)}</p>
                        </div>
                        <div class="file-actions">
                            <button class="btn btn-sm btn-primary" onclick="fileManager.showLinkModal('${publicUrl}', '${file.name}')">
                                Get Link
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="fileManager.deleteFile('${file.name}')">
                                Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading files:', error);
            this.showError('Failed to load files');
        }
    }

    async loadStorageStats() {
        try {
            // Get bucket size limit (example: 100GB)
            const bucketLimit = 100 * 1024 * 1024 * 1024;

            // Get current usage
            const { data, error } = await this.supabase.storage
                .from('files')
                .list('');

            if (error) throw error;

            const currentUsage = data.reduce((total, file) => total + file.metadata.size, 0);
            const usagePercent = (currentUsage / bucketLimit) * 100;

            const statsElement = document.getElementById('storageStats');
            statsElement.innerHTML = `
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${usagePercent}%"></div>
                </div>
                <p class="text-muted mt-2 mb-0">
                    Used ${this.formatFileSize(currentUsage)} of ${this.formatFileSize(bucketLimit)}
                </p>
            `;

        } catch (error) {
            console.error('Error loading storage stats:', error);
            this.showError('Failed to load storage statistics');
        }
    }

    filterFiles(searchTerm) {
        const files = document.querySelectorAll('.file-item');
        const term = searchTerm.toLowerCase();

        files.forEach(file => {
            const name = file.dataset.name;
            file.style.display = name.includes(term) ? '' : 'none';
        });
    }

    async deleteFile(fileName) {
        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            const { error } = await this.supabase.storage
                .from('files')
                .remove([fileName]);

            if (error) throw error;

            this.showSuccess('File deleted successfully');
            this.loadFiles();
            this.loadStorageStats();

        } catch (error) {
            console.error('Error deleting file:', error);
            this.showError('Failed to delete file');
        }
    }

    showLinkModal(url, fileName) {
        document.getElementById('directLink').value = url;
        document.getElementById('markdownLink').value = `[${fileName}](${url})`;

        const modal = new bootstrap.Modal(document.getElementById('fileLinkModal'));
        modal.show();
    }

    copyLink(elementId) {
        const element = document.getElementById(elementId);
        element.select();
        document.execCommand('copy');
        
        const button = element.nextElementSibling;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => button.textContent = originalText, 2000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
let fileManager;
document.addEventListener('DOMContentLoaded', () => {
    fileManager = new FileManager();
});
