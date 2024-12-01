// Supabase configuration
const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDk4ODAxOCwiZXhwIjoyMDQ2NTY0MDE4fQ.q83fxtFeCVO4uhzYUnZzKjSwSQTkiFo62BFywe4B-ts';

// Initialize Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTests() {
    console.log('Starting API Tests...\n');

    // Test 1: Insert Article
    try {
        console.log('Test 1: Insert Article');
        const { data: insertData, error: insertError } = await supabase
            .from('articles')
            .insert([{
                title: 'Test Article',
                content: 'This is a test article',
                tags: ['test', 'api']
            }]);

        if (insertError) throw insertError;
        console.log('✅ Insert successful:', insertData);
    } catch (error) {
        console.error('❌ Insert failed:', error.message);
    }

    // Test 2: Query Articles
    try {
        console.log('\nTest 2: Query Articles');
        const { data: articles, error: queryError } = await supabase
            .from('articles')
            .select('*')
            .limit(5);

        if (queryError) throw queryError;
        console.log('✅ Query successful. Found', articles.length, 'articles');
    } catch (error) {
        console.error('❌ Query failed:', error.message);
    }

    // Test 3: Update Article
    try {
        console.log('\nTest 3: Update Article');
        const { data: updateData, error: updateError } = await supabase
            .from('articles')
            .update({ content: 'Updated test content' })
            .eq('title', 'Test Article');

        if (updateError) throw updateError;
        console.log('✅ Update successful:', updateData);
    } catch (error) {
        console.error('❌ Update failed:', error.message);
    }

    // Test 4: Delete Article
    try {
        console.log('\nTest 4: Delete Article');
        const { data: deleteData, error: deleteError } = await supabase
            .from('articles')
            .delete()
            .eq('title', 'Test Article');

        if (deleteError) throw deleteError;
        console.log('✅ Delete successful');
    } catch (error) {
        console.error('❌ Delete failed:', error.message);
    }

    // Test 5: Realtime Subscription
    try {
        console.log('\nTest 5: Testing Realtime Subscription');
        const subscription = supabase
            .channel('public:articles')
            .on('INSERT', payload => {
                console.log('✅ Realtime insert event received:', payload);
            })
            .subscribe();

        // Insert a test article after subscription
        await supabase
            .from('articles')
            .insert([{
                title: 'Realtime Test Article',
                content: 'Testing realtime functionality',
                tags: ['realtime', 'test']
            }]);

        console.log('Waiting for realtime events...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        subscription.unsubscribe();
    } catch (error) {
        console.error('❌ Realtime test failed:', error.message);
    }

    console.log('\nTests completed!');
    process.exit(0);
}

runTests();
