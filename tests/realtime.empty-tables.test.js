/**
 * @jest-environment jsdom
 */

describe('RealtimeManager Empty Tables Test', () => {
    let realtimeManager;
    let mockSupabase;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="tableSelect"></div>
            <div id="errorMessage"></div>
        `;

        // Mock Supabase client
        mockSupabase = {
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                })
            }),
            channel: jest.fn().mockReturnValue({
                subscribe: jest.fn()
            })
        };

        // Initialize RealtimeManager with mock
        realtimeManager = new RealtimeManager(mockSupabase);
    });

    test('should handle empty tables response', async () => {
        // Call loadTables
        await realtimeManager.loadTables();

        // Verify Supabase query was called
        expect(mockSupabase.from).toHaveBeenCalledWith('information_schema.tables');

        // Verify table select is empty but initialized
        const tableSelect = document.getElementById('tableSelect');
        expect(tableSelect.innerHTML).toBe('');
        
        // Verify error message is shown
        const errorMessage = document.getElementById('errorMessage');
        expect(errorMessage.textContent).toBe('No tables found in the database.');
    });

    test('should handle database connection error', async () => {
        // Mock error response
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockRejectedValue(new Error('Connection failed'))
            })
        });

        // Call loadTables
        await realtimeManager.loadTables();

        // Verify error message is shown
        const errorMessage = document.getElementById('errorMessage');
        expect(errorMessage.textContent).toBe('Failed to load tables. Please try again later.');
    });
});
