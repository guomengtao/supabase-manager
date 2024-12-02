// Supabase configuration
const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

// Service role key - NEVER use this in client-side code!
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDk4ODAxOCwiZXhwIjoyMDQ2NTY0MDE4fQ.q83fxtFeCVO4uhzYUnZzKjSwSQTkiFo62BFywe4B-ts';

// Wait for Supabase to be available
let supabase = null;

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }
}

// Initialize Supabase client
function initializeSupabase() {
    if (!window.supabase) {
        showError('Supabase library not loaded. Please refresh the page.');
        return null;
    }

    try {
        return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        showError('Failed to connect to database. Please try again later.');
        return null;
    }
}

// Initialize when the script loads
supabase = initializeSupabase();

// Export configurations
export {
    supabase,
    SUPABASE_URL,
    SUPABASE_KEY
};

// Storage bucket names
const STORAGE_BUCKETS = {
    IMAGES: 'images',
    FILES: 'files'
};

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

const CONFIG = {
    supabaseUrl: 'https://tkcrnfgnspvtzwbbvyfv.supabase.co',
    supabaseKey: 'your-anon-key'  // Replace with your actual anon key
};

// Initialize Supabase client
const supabase = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

// Required tables definition
const REQUIRED_TABLES = {
    users: `
        create table if not exists users (
            id uuid not null primary key,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null,
            email text,
            name text
        )
    `,
    files: `
        create table if not exists files (
            id uuid not null primary key,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null,
            name text,
            size bigint,
            type text,
            path text
        )
    `,
    images: `
        create table if not exists images (
            id uuid not null primary key,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null,
            name text,
            url text,
            size bigint,
            type text
        )
    `,
    articles: `
        create table if not exists articles (
            id uuid not null primary key,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null,
            title text,
            content text
        )
    `
};

// Initialize tables function
async function initializeTables() {
    try {
        for (const [tableName, createSQL] of Object.entries(REQUIRED_TABLES)) {
            const { error } = await supabase.rpc('create_table_if_not_exists', {
                table_sql: createSQL
            });
            
            if (error && !error.message.includes('already exists')) {
                console.error(`Error creating table ${tableName}:`, error);
            }
        }
    } catch (err) {
        console.error('Error initializing tables:', err);
    }
}

// Export configuration and utilities
export { CONFIG, supabase, initializeTables, REQUIRED_TABLES };

import { createClient } from '@supabase/supabase-js'

export const supabaseClient = createClient(
    'https://tkcrnfgnspvtzwbbvyfv.supabase.co',
    'your-anon-key'  // Replace with your actual anon key
)

// Call this when the app starts
window.addEventListener('load', initializeTables)
