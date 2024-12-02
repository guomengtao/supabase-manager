import { getSupabaseClient } from './config.js';

class ImageManager {
    constructor() {
        this.setupEventListeners();
        this.initializeSupabase();
    }

    async initializeSupabase() {
        try {
            this.supabase = await getSupabaseClient();
            await this.loadRecentUploads();
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.showError('Failed to initialize Supabase client');
        }
    }

    setupEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

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
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0]);
            }
        });

        // Click to upload
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0]);
            }
        });

        // Refresh uploads list
        document.getElementById('refreshUploads').addEventListener('click', () => {
            this.loadRecentUploads();
        });
    }

    async handleFileSelection(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('Image size should not exceed 5MB');
            return;
        }

        // Show preview
        this.showImagePreview(file);

        // Upload file
        await this.uploadImage(file);
    }

    showImagePreview(file) {
        const previewArea = document.getElementById('previewArea');
        const reader = new FileReader();

        reader.onload = (e) => {
            previewArea.innerHTML = `
                <img src="${e.target.result}" class="img-fluid preview-image" alt="Preview">
                <p class="mt-2 mb-0 text-muted">
                    ${file.name}<br>
                    ${this.formatFileSize(file.size)}
                </p>
            `;
        };

        reader.readAsDataURL(file);
    }

    async uploadImage(file) {
        try {
            // Show progress bar
            const progressBar = document.getElementById('uploadProgress');
            const progressBarInner = progressBar.querySelector('.progress-bar');
            progressBar.classList.remove('d-none');

            // Generate unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { data, error } = await this.supabase.storage
                .from('images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                    onUploadProgress: (progress) => {
                        const percent = (progress.loaded / progress.total) * 100;
                        progressBarInner.style.width = percent + '%';
                        progressBarInner.textContent = Math.round(percent) + '%';
                    }
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            // Hide progress bar
            setTimeout(() => {
                progressBar.classList.add('d-none');
                progressBarInner.style.width = '0%';
                progressBarInner.textContent = '';
            }, 1000);

            // Show success message
            this.showSuccess('Image uploaded successfully');

            // Refresh uploads list
            this.loadRecentUploads();

            // Show link modal
            this.showLinkModal(publicUrl, file.name);

        } catch (error) {
            console.error('Error uploading image:', error);
            this.showError('Failed to upload image');
        }
    }

    async loadRecentUploads() {
        try {
            const { data, error } = await this.supabase.storage
                .from('images')
                .list('', {
                    limit: 10,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) throw error;

            const uploadsList = document.getElementById('uploadsList');
            
            if (!data || data.length === 0) {
                uploadsList.innerHTML = '<p class="text-muted text-center">No uploads found</p>';
                return;
            }

            uploadsList.innerHTML = data.map(file => {
                const { publicUrl } = this.supabase.storage
                    .from('images')
                    .getPublicUrl(file.name);

                return `
                    <div class="upload-item">
                        <img src="${publicUrl}" class="upload-thumbnail" alt="${file.name}">
                        <div class="upload-info">
                            <p class="upload-name">${file.name}</p>
                            <p class="upload-size">${this.formatFileSize(file.metadata.size)}</p>
                        </div>
                        <div class="upload-actions">
                            <button class="btn btn-sm btn-primary" onclick="imageManager.showLinkModal('${publicUrl}', '${file.name}')">
                                Get Link
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="imageManager.deleteImage('${file.name}')">
                                Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading uploads:', error);
            this.showError('Failed to load uploads');
        }
    }

    async deleteImage(fileName) {
        if (!confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const { error } = await this.supabase.storage
                .from('images')
                .remove([fileName]);

            if (error) throw error;

            this.showSuccess('Image deleted successfully');
            this.loadRecentUploads();

        } catch (error) {
            console.error('Error deleting image:', error);
            this.showError('Failed to delete image');
        }
    }

    showLinkModal(url, fileName) {
        document.getElementById('directLink').value = url;
        document.getElementById('markdownLink').value = `![${fileName}](${url})`;
        document.getElementById('htmlLink').value = `<img src="${url}" alt="${fileName}">`;

        const modal = new bootstrap.Modal(document.getElementById('imageLinkModal'));
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
let imageManager;
document.addEventListener('DOMContentLoaded', async () => {
    imageManager = new ImageManager();
});
