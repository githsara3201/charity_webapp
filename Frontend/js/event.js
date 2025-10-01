const container = document.getElementById('event-details');


const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

async function fetchEvent() {
    try {
        const res = await fetch(`http://localhost:5000/api/events/${eventId}`);
        if (!res.ok) throw new Error('Event not found');
        const event = await res.json();

        container.innerHTML = `
            <div class="bg-white">
                <img class="w-full h-64 md:h-80 object-cover" src="${event.image_url}" alt="${event.name}">
                <div class="p-8">
                    <h2 class="text-3xl font-bold text-gray-900 mb-6">${event.name}</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-gray-600 mb-1">Category</p>
                            <p class="font-semibold text-gray-900">${event.category}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-gray-600 mb-1">Organization</p>
                            <p class="font-semibold text-gray-900">${event.organization}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-gray-600 mb-1">Location</p>
                            <p class="font-semibold text-gray-900">${event.location}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-gray-600 mb-1">Date</p>
                            <p class="font-semibold text-gray-900">${event.event_date}</p>
                        </div>
                    </div>
                    
                    <div class="mb-8">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Funding Progress</h3>
                        <div class="bg-gray-200 rounded-full h-4 mb-2">
                            <div class="bg-black h-4 rounded-full" style="width: ${(event.progress_amount / event.goal_amount) * 100}%"></div>
                        </div>
                        <div class="flex justify-between text-sm text-gray-700">
                            <span>Raised: $${event.progress_amount}</span>
                            <span>Goal: $${event.goal_amount}</span>
                        </div>
                    </div>
                    
                    <div class="mb-8">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                        <p class="text-gray-700 leading-relaxed">${event.description}</p>
                    </div>
                    
                    <button 
                        onclick="alert('This feature is currently under construction')" 
                        class="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        Register for Event
                    </button>
                </div>
            </div>
        `;
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="text-red-500 text-center py-8">Failed to load event details.</p>';
    }
}

fetchEvent();