/**
 * @jest-environment jsdom
 */

import { RealtimeManager } from '../js/realtime';

// Mock Supabase client
const mockSupabase = {
    from: jest.fn(),
    channel: jest.fn()
};

// Mock DOM elements
const setupDOM = () => {
    document.body.innerHTML = `
        <div id="connectionStatus"></div>
        <button id="toggleConnection">Connect</button>
        <select id="tableSelect"></select>
        <button id="subscribeBtn">Subscribe</button>
        <button id="clearEvents">Clear</button>
        <div id="eventsLog"></div>
        <div id="insertEvent"></div>
        <div id="updateEvent"></div>
        <div id="deleteEvent"></div>
    `;
};

describe('RealtimeManager', () => {
    let realtimeManager;

    beforeEach(() => {
        // Setup DOM
        setupDOM();
        
        // Reset mocks
        mockSupabase.from.mockReset();
        mockSupabase.channel.mockReset();

        // Mock Supabase query response
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { table_name: 'users' },
                        { table_name: 'posts' }
                    ],
                    error: null
                })
            })
        });

        // Mock Supabase channel
        mockSupabase.channel.mockReturnValue({
            subscribe: jest.fn().mockImplementation(callback => {
                callback('SUBSCRIBED');
                return {
                    on: jest.fn().mockReturnThis(),
                    unsubscribe: jest.fn()
                };
            })
        });

        // Initialize RealtimeManager
        realtimeManager = new RealtimeManager(mockSupabase);
    });

    describe('loadTables', () => {
        it('should load tables successfully', async () => {
            // Call loadTables
            await realtimeManager.loadTables();

            // Verify Supabase query was called correctly
            expect(mockSupabase.from).toHaveBeenCalledWith('information_schema.tables');
            
            // Verify table select was populated
            const tableSelect = document.getElementById('tableSelect');
            expect(tableSelect.innerHTML).toContain('<option value="users">users</option>');
            expect(tableSelect.innerHTML).toContain('<option value="posts">posts</option>');
        });

        it('should handle empty tables response', async () => {
            // Mock empty tables response
            mockSupabase.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                })
            });

            // Call loadTables
            await realtimeManager.loadTables();

            // Verify table select is empty
            const tableSelect = document.getElementById('tableSelect');
            expect(tableSelect.innerHTML).toBe('');
        });

        it('should handle error when loading tables', async () => {
            // Mock error response
            mockSupabase.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: new Error('Failed to load tables')
                    })
                })
            });

            // Spy on console.error
            const consoleSpy = jest.spyOn(console, 'error');

            // Call loadTables
            await realtimeManager.loadTables();

            // Verify error was logged
            expect(consoleSpy).toHaveBeenCalledWith('Error loading tables:', expect.any(Error));

            // Verify table select is empty
            const tableSelect = document.getElementById('tableSelect');
            expect(tableSelect.innerHTML).toBe('');

            // Restore console.error
            consoleSpy.mockRestore();
        });
    });
});
