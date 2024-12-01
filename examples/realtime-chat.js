// Supabase configuration
const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDk4ODAxOCwiZXhwIjoyMDQ2NTY0MDE4fQ.q83fxtFeCVO4uhzYUnZzKjSwSQTkiFo62BFywe4B-ts';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Get DOM elements
const chatMessages = document.getElementById('chatMessages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

// Subscribe to new messages
supabase
    .channel('public:messages')
    .on('INSERT', payload => {
        addMessageToChat(payload.new);
    })
    .subscribe();

// Load existing messages
async function loadMessages() {
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading messages:', error);
        return;
    }

    messages.forEach(message => addMessageToChat(message));
}

// Add a message to the chat
function addMessageToChat(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.user_id === 'example_user' ? 'message-sent' : 'message-received'}`;
    messageDiv.textContent = message.text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle form submission
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    try {
        const { error } = await supabase
            .from('messages')
            .insert([{ text, user_id: 'example_user' }]);

        if (error) throw error;
        messageInput.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    }
});

// Load messages when page loads
loadMessages();
