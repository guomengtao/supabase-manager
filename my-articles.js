// Replace with your Supabase URL and Key
const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDk4ODAxOCwiZXhwIjoyMDQ2NTY0MDE4fQ.q83fxtFeCVO4uhzYUnZzKjSwSQTkiFo62BFywe4B-ts';

// Create Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to load articles
async function loadArticles() {
    try {
        // Get articles from Supabase
        const { data: articles, error } = await supabase
            .from('articles')
            .select('*');

        if (error) throw error;

        // Show articles on the page
        const articleDiv = document.getElementById('articles');
        articleDiv.innerHTML = articles
            .map(article => `
                <div style="margin: 20px 0; padding: 10px; border: 1px solid #ddd;">
                    <h2>${article.title}</h2>
                    <p>${article.content}</p>
                </div>
            `)
            .join('');

    } catch (error) {
        console.error('Error:', error);
    }
}

// Load articles when page loads
loadArticles();