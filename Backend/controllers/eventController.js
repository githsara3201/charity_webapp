const db = require('../config/event_db');

exports.getAllEvents = async (req, res) => {
    try {
        console.log('🟢 [GET_ALL_EVENTS] Fetching all upcoming events');
        const [rows] = await db.query(
            `SELECT e.event_id, e.name, e.description, e.event_date, e.location, e.status, e.image_url, c.name AS category
             FROM events e
             JOIN categories c ON e.category_id = c.category_id
             WHERE e.status = 'upcoming'
             ORDER BY e.event_date ASC`
        );
        console.log(`🟢 [GET_ALL_EVENTS] Successfully fetched ${rows.length} events`);
        res.json(rows);
    } catch (err) {
        console.error('🔴 [GET_ALL_EVENTS] Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getEventById = async (req, res) => {
    const eventId = req.params.id;
    
    console.log(`🟡 [GET_EVENT_BY_ID] Request for event ID: ${eventId}`);
    
    if (!eventId || !/^\d+$/.test(eventId)) {
        console.log('🔴 [GET_EVENT_BY_ID] Invalid event ID format');
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        console.log(`🟡 [GET_EVENT_BY_ID] Querying database for event ${eventId}`);
        const [rows] = await db.query(
            `SELECT e.*, c.name AS category, o.name AS organization, o.contact_email, o.contact_phone
             FROM events e
             JOIN categories c ON e.category_id = c.category_id
             JOIN organizations o ON e.org_id = o.org_id
             WHERE e.event_id = ?`, [eventId]
        );
        
        if (rows.length === 0) {
            console.log(`🔴 [GET_EVENT_BY_ID] Event ${eventId} not found`);
            return res.status(404).json({ message: 'Event not found' });
        }
        
        console.log(`🟢 [GET_EVENT_BY_ID] Successfully fetched event: ${rows[0].name}`);
        res.json(rows[0]);
    } catch (err) {
        console.error('🔴 [GET_EVENT_BY_ID] Database error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getEventIds = async (req, res) => {
    try {
        console.log('🟢 [GET_EVENT_IDS] Fetching all event IDs');
        const [rows] = await db.query(
            `SELECT event_id, name FROM events WHERE status='upcoming' ORDER BY event_date ASC`
        );
        console.log(`🟢 [GET_EVENT_IDS] Found ${rows.length} event IDs`);
        res.json(rows);
    } catch (err) {
        console.error('🔴 [GET_EVENT_IDS] Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        console.log('🟢 [GET_CATEGORIES] Fetching all categories');
        const [rows] = await db.query(`SELECT * FROM categories`);
        console.log(`🟢 [GET_CATEGORIES] Found ${rows.length} categories`);
        res.json(rows);
    } catch (err) {
        console.error('🔴 [GET_CATEGORIES] Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.searchEvents = async (req, res) => {
    const { date, location, category } = req.query;
    
    console.log('🟡 [SEARCH_EVENTS] Search request received:', {
        date, location, category
    });
    
    let query = `SELECT e.event_id, e.name, e.description, e.event_date, e.location, e.status, c.name AS category
                 FROM events e
                 JOIN categories c ON e.category_id = c.category_id
                 WHERE e.status = 'upcoming'`;
    const params = [];

    if (date) {
        query += ` AND e.event_date = ?`;
        params.push(date);
    }
    if (location) {
        query += ` AND e.location LIKE ?`;
        params.push(`%${location}%`);
    }
    if (category) {
        query += ` AND c.name = ?`;
        params.push(category);
    }

    console.log(`🟡 [SEARCH_EVENTS] Final query: ${query}`);
    console.log(`🟡 [SEARCH_EVENTS] Query params:`, params);

    try {
        const [rows] = await db.query(query, params);
        console.log(`🟢 [SEARCH_EVENTS] Search completed, found ${rows.length} events`);
        res.json(rows);
    } catch (err) {
        console.error('🔴 [SEARCH_EVENTS] Database error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getEventSuggestions = async (req, res) => {
    console.log('='.repeat(60));
    console.log('🔍 [EVENT_SUGGESTIONS] Starting search suggestions');
    console.log(`🔍 [EVENT_SUGGESTIONS] Full URL: ${req.originalUrl}`);
    console.log(`🔍 [EVENT_SUGGESTIONS] Request method: ${req.method}`);
    console.log(`🔍 [EVENT_SUGGESTIONS] Headers:`, req.headers);
    
    const { q } = req.query;
    
    console.log(`🔍 [EVENT_SUGGESTIONS] Raw query parameter "q":`, q);
    console.log(`🔍 [EVENT_SUGGESTIONS] Query parameter type:`, typeof q);
    console.log(`🔍 [EVENT_SUGGESTIONS] All query parameters:`, req.query);

    // Check if query parameter exists
    if (q === undefined || q === null) {
        console.log('🔴 [EVENT_SUGGESTIONS] Query parameter "q" is missing');
        return res.status(400).json({ 
            message: 'Query parameter "q" is required',
            receivedQuery: q,
            allParams: req.query
        });
    }

    // Check if query is empty after trimming
    if (q.trim() === '') {
        console.log('🟡 [EVENT_SUGGESTIONS] Empty query received, returning empty results');
        return res.json([]);
    }

    const sanitizedQuery = q.trim();
    console.log(`🔍 [EVENT_SUGGESTIONS] Sanitized query: "${sanitizedQuery}"`);
    console.log(`🔍 [EVENT_SUGGESTIONS] Sanitized query length: ${sanitizedQuery.length}`);

    try {
        console.log(`🔍 [EVENT_SUGGESTIONS] Building SQL query...`);
        const sqlQuery = `
            SELECT event_id, name 
            FROM events 
            WHERE status='upcoming' AND name LIKE ? 
            ORDER BY event_date ASC 
            LIMIT 10
        `;
        const sqlParams = [`%${sanitizedQuery}%`];
        
        console.log(`🔍 [EVENT_SUGGESTIONS] SQL Query:`, sqlQuery);
        console.log(`🔍 [EVENT_SUGGESTIONS] SQL Parameters:`, sqlParams);
        
        console.log(`🔍 [EVENT_SUGGESTIONS] Executing database query...`);
        const [rows] = await db.query(sqlQuery, sqlParams);
        
        console.log(`🟢 [EVENT_SUGGESTIONS] Database query successful`);
        console.log(`🟢 [EVENT_SUGGESTIONS] Found ${rows.length} results`);
        
        if (rows.length > 0) {
            console.log(`🟢 [EVENT_SUGGESTIONS] Results:`, rows.map(r => ({ id: r.event_id, name: r.name })));
        } else {
            console.log(`🟡 [EVENT_SUGGESTIONS] No events found matching "${sanitizedQuery}"`);
        }
        
        console.log('='.repeat(60));
        res.json(rows);
        
    } catch (err) {
        console.error('🔴 [EVENT_SUGGESTIONS] Database error:');
        console.error('🔴 [EVENT_SUGGESTIONS] Error name:', err.name);
        console.error('🔴 [EVENT_SUGGESTIONS] Error message:', err.message);
        console.error('🔴 [EVENT_SUGGESTIONS] Error code:', err.code);
        console.error('🔴 [EVENT_SUGGESTIONS] Error stack:', err.stack);
        console.error('🔴 [EVENT_SUGGESTIONS] Query that failed:');
        console.error('🔴 [EVENT_SUGGESTIONS] SQL:', `SELECT event_id, name FROM events WHERE status='upcoming' AND name LIKE '%${sanitizedQuery}%'`);
        console.error('🔴 [EVENT_SUGGESTIONS] Original query parameter was:', q);
        
        console.log('='.repeat(60));
        res.status(500).json({ 
            message: 'Server Error',
            error: err.message,
            code: err.code,
            query: q,
            sanitizedQuery: sanitizedQuery
        });
    }
};