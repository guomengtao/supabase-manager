// Supabase configuration
const CONFIG = {
    supabaseUrl: 'https://tkcrnfgnspvtzwbbvyfv.supabase.co',
    supabaseKey: 'your-anon-key'  // Replace with your actual anon key
};

// Initialize Supabase client using the global supabase object from CDN
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

// Call this when the app starts
window.addEventListener('load', initializeTables)
