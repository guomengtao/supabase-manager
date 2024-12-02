// Wait for Supabase to be available
function waitForSupabase(maxAttempts = 10) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const check = () => {
            attempts++;
            if (window.supabase) {
                resolve(window.supabase);
            } else if (attempts >= maxAttempts) {
                reject(new Error('Supabase failed to load'));
            } else {
                setTimeout(check, 100);
            }
        };
        
        check();
    });
}

// Supabase configuration
const CONFIG = {
    supabaseUrl: 'https://tkcrnfgnspvtzwbbvyfv.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8'
};

// Initialize Supabase client
let supabaseClient = null;

async function initializeSupabase() {
    if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
        throw new Error('Supabase configuration is missing. Please check config.js');
    }

    try {
        const supabaseLib = await waitForSupabase();
        supabaseClient = supabaseLib.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
        console.log('Supabase client initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = 'Failed to connect to database. Please refresh the page.';
            errorElement.classList.remove('d-none');
        }
        throw error;
    }
}

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
    if (!supabaseClient) {
        supabaseClient = await initializeSupabase();
    }

    try {
        for (const [tableName, createSQL] of Object.entries(REQUIRED_TABLES)) {
            try {
                const { error } = await supabaseClient.rpc('create_table_if_not_exists', {
                    table_sql: createSQL
                });
                
                if (error) {
                    if (error.message.includes('already exists')) {
                        console.log(`Table ${tableName} already exists`);
                    } else {
                        console.error(`Error creating table ${tableName}:`, error);
                        const errorElement = document.getElementById('errorMessage');
                        if (errorElement) {
                            errorElement.textContent = `Error creating table ${tableName}. Some features may not work.`;
                            errorElement.classList.remove('d-none');
                        }
                    }
                }
            } catch (tableError) {
                console.error(`Failed to create table ${tableName}:`, tableError);
            }
        }
    } catch (err) {
        console.error('Error initializing tables:', err);
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = 'Error setting up database tables. Some features may not work.';
            errorElement.classList.remove('d-none');
        }
    }
}

// Initialize Supabase when the module loads
const supabase = await initializeSupabase();

// Export configuration and utilities
export { CONFIG, supabase, initializeTables, REQUIRED_TABLES };
