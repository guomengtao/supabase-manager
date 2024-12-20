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
let supabase = null;

async function initializeSupabase() {
    if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
        throw new Error('Supabase configuration is missing. Please check config.js');
    }

    try {
        const supabaseLib = await waitForSupabase();
        return supabaseLib.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
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

// Initialize and export Supabase client
async function getSupabaseClient() {
    if (!supabase) {
        supabase = await initializeSupabase();
    }
    return supabase;
}

// Required tables definition
const REQUIRED_TABLES = {
    users: {
        name: 'users',
        columns: [
            { name: 'id', type: 'uuid', primary: true, default: 'gen_random_uuid()' },
            { name: 'created_at', type: 'timestamp with time zone', default: "timezone('utc'::text, now())" },
            { name: 'email', type: 'text' },
            { name: 'name', type: 'text' }
        ]
    },
    files: {
        name: 'files',
        columns: [
            { name: 'id', type: 'uuid', primary: true, default: 'gen_random_uuid()' },
            { name: 'created_at', type: 'timestamp with time zone', default: "timezone('utc'::text, now())" },
            { name: 'name', type: 'text' },
            { name: 'size', type: 'bigint' },
            { name: 'type', type: 'text' },
            { name: 'path', type: 'text' }
        ]
    },
    images: {
        name: 'images',
        columns: [
            { name: 'id', type: 'uuid', primary: true, default: 'gen_random_uuid()' },
            { name: 'created_at', type: 'timestamp with time zone', default: "timezone('utc'::text, now())" },
            { name: 'name', type: 'text' },
            { name: 'url', type: 'text' },
            { name: 'size', type: 'bigint' },
            { name: 'type', type: 'text' }
        ]
    },
    articles: {
        name: 'articles',
        columns: [
            { name: 'id', type: 'uuid', primary: true, default: 'gen_random_uuid()' },
            { name: 'created_at', type: 'timestamp with time zone', default: "timezone('utc'::text, now())" },
            { name: 'title', type: 'text' },
            { name: 'content', type: 'text' }
        ]
    }
};

// Initialize tables function
async function initializeTables() {
    const supabaseClient = await getSupabaseClient();

    console.log('Starting table initialization...');

    try {
        for (const [tableName, tableInfo] of Object.entries(REQUIRED_TABLES)) {
            console.log(`Processing table: ${tableName}`);
            
            try {
                // Check if table exists
                const { data: existingTable, error: checkError } = await supabaseClient
                    .from(tableInfo.name)
                    .select('id')
                    .limit(1);

                if (checkError && checkError.code === '42P01') {
                    console.log(`Table ${tableName} does not exist, creating...`);
                    
                    // Table doesn't exist, create it
                    const columns = tableInfo.columns.map(col => {
                        let colDef = `${col.name} ${col.type}`;
                        if (col.primary) colDef += ' primary key';
                        if (col.default) colDef += ` default ${col.default}`;
                        if (!col.nullable) colDef += ' not null';
                        return colDef;
                    }).join(', ');

                    const createTableSQL = `
                        create table if not exists ${tableInfo.name} (
                            ${columns}
                        );
                    `;

                    console.log('Executing SQL:', createTableSQL);

                    const { error: createError } = await supabaseClient.rpc('exec_sql', { sql: createTableSQL });
                    if (createError) {
                        console.error(`Error creating table ${tableName}:`, createError);
                        const errorElement = document.getElementById('errorMessage');
                        if (errorElement) {
                            errorElement.textContent = `Error creating table ${tableName}. Some features may not work.`;
                            errorElement.classList.remove('d-none');
                        }
                    } else {
                        console.log(`Table ${tableName} created successfully`);
                    }
                } else {
                    console.log(`Table ${tableName} already exists`);
                }
            } catch (tableError) {
                console.error(`Failed to check/create table ${tableName}:`, tableError);
                const errorElement = document.getElementById('errorMessage');
                if (errorElement) {
                    errorElement.textContent = `Failed to initialize table ${tableName}. Some features may not work.`;
                    errorElement.classList.remove('d-none');
                }
            }
        }
        console.log('Table initialization completed');
    } catch (err) {
        console.error('Error initializing tables:', err);
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = 'Error setting up database tables. Some features may not work.';
            errorElement.classList.remove('d-none');
        }
    }
}

// Export configuration and utilities
export { CONFIG, getSupabaseClient, initializeTables, REQUIRED_TABLES };
