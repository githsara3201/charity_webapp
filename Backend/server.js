const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const eventRoutes = require('./routes/eventRoutes');
const db = require('./config/event_db'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix CORS configuration
app.use(cors({
    origin: ['http://34.70.88.199', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

(async () => {
    try {
        const connection = await db.getConnection(); 
        console.log('✅ Database connected successfully');
        connection.release(); 
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
})();

app.use('/api', eventRoutes);

app.get('/', (req, res) => {
    res.send('Charity Events API is running');
});

// Add health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

app.listen(PORT, '0.0.0.0', () => {  // Listen on all interfaces
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Accessible via: http://34.70.88.199:${PORT}`);
});