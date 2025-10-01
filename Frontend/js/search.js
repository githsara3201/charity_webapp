// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM elements
const eventsContainer = document.getElementById('events-container');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const noResultsState = document.getElementById('no-results-state');
const errorMessage = document.getElementById('error-message');
const retryButton = document.getElementById('retry-button');
const searchButton = document.getElementById('search-button');
const resetFiltersButton = document.getElementById('reset-filters');
const loadMoreButton = document.getElementById('load-more-button');
const loadMoreContainer = document.getElementById('load-more-container');
const resultsCount = document.getElementById('results-count');

// Search filters
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const locationFilter = document.getElementById('location-filter');
const dateFilter = document.getElementById('date-filter');
const statusFilter = document.getElementById('status-filter');
const sortFilter = document.getElementById('sort-filter');

// State management
let currentPage = 1;
let currentFilters = {};
let allEvents = [];
let filteredEvents = [];
const eventsPerPage = 9;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('CharityElite Premium Search loaded');
    
    // Load categories and initial events
    Promise.all([fetchCategories(), fetchAllEvents()])
        .then(() => {
            applyFilters();
        })
        .catch(error => {
            console.error('Initialization error:', error);
            showError('Failed to initialize search. Please refresh the page.');
        });
    
    // Event listeners
    searchButton.addEventListener('click', performSearch);
    resetFiltersButton.addEventListener('click', resetFilters);
    loadMoreButton.addEventListener('click', loadMoreEvents);
    retryButton.addEventListener('click', retrySearch);
    
    // Real-time search on input (with debounce)
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (this.value.length >= 3 || this.value.length === 0) {
                performSearch();
            }
        }, 500);
    });
    
    // Filter change listeners
    [categoryFilter, locationFilter, dateFilter, statusFilter, sortFilter].forEach(filter => {
        filter.addEventListener('change', performSearch);
    });
    
    // Enter key support for search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});

// Fetch all categories
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const categories = await response.json();
        populateCategoryFilter(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Populate category filter dropdown
function populateCategoryFilter(categories) {
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}

// Fetch all events for client-side filtering
async function fetchAllEvents() {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);
        
        allEvents = await response.json();
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching events:', error);
        showError(error.message || 'Failed to load events. Please try again.');
    }
}

// Perform search with current filters
function performSearch() {
    currentPage = 1;
    applyFilters();
}

// Apply filters to events
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const location = locationFilter.value.toLowerCase().trim();
    const date = dateFilter.value;
    const status = statusFilter.value;
    const sort = sortFilter.value;

    // Store current filters
    currentFilters = { searchTerm, category, location, date, status, sort };

    // Filter events
    filteredEvents = allEvents.filter(event => {
        const matchesSearch = !searchTerm || 
            event.name.toLowerCase().includes(searchTerm) ||
            (event.description && event.description.toLowerCase().includes(searchTerm)) ||
            (event.organization && event.organization.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !category || event.category === category;
        const matchesLocation = !location || event.location.toLowerCase().includes(location);
        const matchesDate = !date || event.event_date === date;
        const matchesStatus = !status || event.status === status;
        
        return matchesSearch && matchesCategory && matchesLocation && matchesDate && matchesStatus;
    });

    // Sort events
    sortEvents(filteredEvents, sort);

    // Display results
    displayResults();
}

// Sort events based on selected criteria
function sortEvents(events, sortCriteria) {
    switch (sortCriteria) {
        case 'date_asc':
            events.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
            break;
        case 'date_desc':
            events.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
            break;
        case 'name_asc':
            events.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            events.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Default sort by date ascending
            events.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    }
}

// Display search results
function displayResults() {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const eventsToShow = filteredEvents.slice(0, endIndex);
    
    // Update results count
    updateResultsCount(filteredEvents.length, eventsToShow.length);
    
    // Clear existing events
    eventsContainer.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        showNoResults();
        return;
    }
    
    // Hide error and no results states
    hideError();
    hideNoResults();
    
    // Render events
    eventsToShow.forEach(event => {
        const eventCard = createEventCard(event);
        eventsContainer.appendChild(eventCard);
    });
    
    // Show/hide load more button
    if (endIndex < filteredEvents.length) {
        loadMoreContainer.classList.remove('hidden');
    } else {
        loadMoreContainer.classList.add('hidden');
    }
}

// Update results count display
function updateResultsCount(totalResults, showingResults) {
    resultsCount.textContent = `Showing ${showingResults} of ${totalResults} events`;
    
    if (currentFilters.searchTerm || currentFilters.category || currentFilters.location || 
        currentFilters.date || currentFilters.status) {
        resultsCount.textContent += ' (filtered)';
    }
}

// Load more events
function loadMoreEvents() {
    currentPage++;
    displayResults();
    
    // Scroll to newly loaded events
    const newEvents = eventsContainer.querySelectorAll('.event-card');
    if (newEvents.length > 0) {
        newEvents[newEvents.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Reset all filters
function resetFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    locationFilter.value = '';
    dateFilter.value = '';
    statusFilter.value = '';
    sortFilter.value = 'date_asc';
    
    currentPage = 1;
    applyFilters();
}

// Retry search after error
function retrySearch() {
    hideError();
    fetchAllEvents().then(() => {
        applyFilters();
    });
}

// Create event card with search highlighting
function createEventCard(event) {
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Highlight search term in event name and description
    const highlightedName = highlightSearchTerm(event.name, currentFilters.searchTerm);
    const highlightedDescription = event.description ? 
        highlightSearchTerm(event.description.substring(0, 150) + '...', currentFilters.searchTerm) : 
        'An exclusive charity event for a noble cause.';

    // Progress data (you can replace with real data from your API)
    const progressPercentage = Math.floor(Math.random() * 100);
    const currentAmount = Math.floor(Math.random() * 100000);
    const targetAmount = Math.floor(currentAmount / (progressPercentage / 100));

    const card = document.createElement('div');
    card.className = 'card-gradient rounded-xl p-6 event-card';
    card.innerHTML = `
        <div class="relative mb-6">
            <div class="w-full h-48 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                ${event.image_url 
                    ? `<img src="${event.image_url}" alt="${event.name}" class="w-full h-full object-cover">`
                    : `<i class="fas fa-image text-4xl text-gray-600"></i>`
                }
            </div>
            <div class="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                <i class="fas fa-map-marker-alt mr-1 gold-accent"></i> ${event.location}
            </div>
            ${event.status !== 'upcoming' ? `
                <div class="absolute top-4 left-4 bg-${event.status === 'ongoing' ? 'green' : 'gray'}-600 text-white px-3 py-1 rounded-full text-sm capitalize">
                    ${event.status}
                </div>
            ` : ''}
        </div>
        <h3 class="text-xl font-bold mb-2">${highlightedName}</h3>
        <div class="flex items-center text-gray-400 text-sm mb-4">
            <i class="far fa-calendar gold-accent mr-2"></i>
            <span>${formattedDate}</span>
            <span class="mx-2">•</span>
            <i class="fas fa-tag gold-accent mr-2"></i>
            <span>${event.category}</span>
        </div>
        <p class="text-gray-400 mb-6">${highlightedDescription}</p>
        <div class="mb-6">
            <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-400">Progress</span>
                <span class="gold-accent font-medium">$${currentAmount.toLocaleString()} / $${targetAmount.toLocaleString()}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
        </div>
        <a href="/event?id=${event.event_id}" class="btn-gold font-semibold py-3 rounded-lg w-full text-center block">
            View Details
        </a>
    `;
    
    return card;
}

// Highlight search term in text
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight px-1 rounded">$1</mark>');
}

// Escape special characters for regex
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// UI state management functions
function showLoading() {
    loadingState.classList.remove('hidden');
    eventsContainer.classList.add('hidden');
    hideError();
    hideNoResults();
}

function hideLoading() {
    loadingState.classList.add('hidden');
    eventsContainer.classList.remove('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
    eventsContainer.classList.add('hidden');
    hideLoading();
    hideNoResults();
}

function hideError() {
    errorState.classList.add('hidden');
}

function showNoResults() {
    noResultsState.classList.remove('hidden');
    eventsContainer.classList.add('hidden');
    hideLoading();
    hideError();
    loadMoreContainer.classList.add('hidden');
}

function hideNoResults() {
    noResultsState.classList.add('hidden');
    eventsContainer.classList.remove('hidden');
}