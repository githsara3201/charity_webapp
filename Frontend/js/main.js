const eventsContainer = document.getElementById('events-container');

async function fetchEvents() {
    try {
        const res = await fetch('http://localhost:5000/api/events');
        const events = await res.json();

        eventsContainer.innerHTML = '';

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = "bg-white shadow-xl rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1";
            card.innerHTML = `
                <img class="w-full h-48 object-cover" src="${event.image_url}" alt="${event.name}">
                <div class="p-6 flex flex-col justify-between flex-grow">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${event.name}</h3>
                        <div class="flex items-center text-sm text-gray-600 mb-2">
                            <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-md mr-2">${event.category}</span>
                            <span class="mr-2">•</span>
                            <span>${event.location}</span>
                        </div>
                        <p class="text-gray-700 mb-4">${event.event_date}</p>
                    </div>
                    <a href="event.html?id=${event.event_id}">
                        <button class="mt-2 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors w-full font-medium">View Details</button>
                    </a>
                </div>
            `;
            eventsContainer.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        eventsContainer.innerHTML = '<p class="text-red-500 text-center py-8">Failed to load events.</p>';
    }
}

fetchEvents();