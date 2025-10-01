const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// SPECIFIC ROUTES FIRST - before parameterized routes
router.get('/events/suggest', eventController.getEventSuggestions);  // This should come FIRST
router.get('/events/search', eventController.searchEvents);

// PARAMETERIZED ROUTES LAST
router.get('/events/:id', eventController.getEventById);            // This should come AFTER
router.get('/events', eventController.getAllEvents);          
router.get('/event-ids', eventController.getEventIds);         
router.get('/categories', eventController.getCategories);      

module.exports = router;