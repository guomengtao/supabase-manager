// Supabase configuration
const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

// Initialize Supabase client with retries and error handling
let supabase;
try {
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Show error message to user
    document.getElementById('errorMessage')?.textContent = 'Failed to connect to database. Please try again later.';
}

// Export the initialized client
export { supabase, SUPABASE_URL, SUPABASE_KEY };

// Storage bucket names
const STORAGE_BUCKETS = {
    IMAGES: 'images',
    FILES: 'files'
};

// Export storage configuration
export { STORAGE_BUCKETS };

// File upload configurations
const UPLOAD_CONFIG = {
    IMAGE: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },
    FILE: {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['application/pdf', 'text/plain', 'application/msword', 
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    }
};

// Table names
const TABLES = {
    ARTICLES: 'articles'
};

// Error handling configuration
const ERROR_MESSAGES = {
    CONNECTION_ERROR: 'Unable to connect to the database. Please check your internet connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    RATE_LIMIT: 'Too many requests. Please try again later.',
    DEFAULT: 'An unexpected error occurred. Please try again.'
};

// Export configurations
const CONFIG = {
    STORAGE_BUCKETS,
    UPLOAD_CONFIG,
    TABLES,
    ERROR_MESSAGES
};

// Export the configuration and Supabase client
export { CONFIG };
