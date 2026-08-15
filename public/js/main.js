// ========================================
// MAIN INITIALIZATION - this will run when the page loads
// ========================================
document.addEventListener('DOMContentLoaded', function() {

    // Check if the user is on the Student Dashboard page (has the date display)
    if (document.getElementById('currentDate')) {
        displayCurrentDate();
        loadWelcomeName();
        loadDashboardStats();
        loadUpcomingEvents();
        loadRecentActivity();
        loadSuggestedEvents();
    }

    // Check if this is the homepage (has the stats box)
    if (document.getElementById('statsEventsPosted')) {
        loadHomeStats();
    }

    // Check if the user is on the My Registrations page
    if (document.getElementById('registrationsList')) {
        loadRegistrationsData('all');
        setupFilterTabs();
    }

    // Check if the user is on the Event Details page
    if (document.getElementById('eventRegisterBtn')) {
        setupRegisterButton();
        loadEventDetails();
    }

    // Check if the user is on the Events list page
    if (document.getElementById('eventCardsContainer')) {
        loadEventsList();
        setupEventsFilters();
    }

    // Check if the user is on the Create Event page (admin)
    if (document.getElementById('createEventForm')) {
        setupCreateEventForm();
    }

    // Check if the user is on the Manage Events page (admin)
    if (document.getElementById('eventsTableBody')) {
        loadManageEventsTable();
    }

    // Check if the user is on the Admin Dashboard page
    if (document.getElementById('totalEventsStat')) {
        loadAdminDashboardStats();
    }

    // Check if the user is on the View Registrations page
    if (document.getElementById('eventPicker')) {
        loadEventPicker('eventPicker', loadRegistrationsForPickedEvent);
    }

    // Check if the user is on the Attendance page
    if (document.getElementById('attendanceEventPicker')) {
        loadEventPicker('attendanceEventPicker', loadAttendanceTable);
    }

    // Check if the user is on the Statistics page
    if (document.getElementById('statisticsTableBody')) {
        loadStatisticsTable();
    }

});


// ========================================
// STUDENT-DASHBOARD FUNCTIONS
// ========================================

// Show today's date in the dashboard header
function displayCurrentDate() {
    var dateDisplay = document.getElementById('currentDate');
    if (!dateDisplay) return;

    var now = new Date();
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

// swaps "Welcome back, User!" for the actual logged in student's first name
async function loadWelcomeName() {
    var nameEl = document.getElementById('welcomeUserName');
    if (!nameEl) return;

    try {
        var response = await fetch('/api/auth/me', { cache: 'no-store' }); // AuthRoute 
        if (!response.ok) return;

        var data = await response.json();
        var firstName = data.user.full_name.split(' ')[0]; // just the first name
        nameEl.textContent = firstName;
    } catch (err) {
        console.error('Load welcome name error:', err);
    }
}

// fills in the stats box on the homepage
async function loadHomeStats() {
    try {
        var response = await fetch('/api/events/site-stats', { cache: 'no-store' });
        if (!response.ok) return;

        var stats = await response.json();

        var eventsEle = document.getElementById('statsEventsPosted');
        var regEle = document.getElementById('statsRegistrations');
        var clubsEle = document.getElementById('statsClubs');
        var categoriesEle = document.getElementById('statsCategories');

        if (eventsEle) eventsEle.textContent = stats.eventsPosted;
        if (regEle) regEle.textContent = stats.registrations;
        if (clubsEle) clubsEle.textContent = stats.clubsAndOrganizations;
        if (categoriesEle) categoriesEle.textContent = stats.categories;

    } catch (err) {
        console.error('Load home stats error:', err);
    }
}

// Update the 4 stat card categories
async function loadDashboardStats() {
    var totalElement = document.getElementById('totalRegistered');
    var upcomingElement = document.getElementById('upcomingEvents');
    var attendedElement = document.getElementById('attendedEvents');
    var cancelledElement = document.getElementById('cancelledEvents');

    try {
        var response = await fetch('/api/registrations/dashboard-stats', { cache: 'no-store' });
        if (!response.ok) return;

        var data = await response.json();

        if (totalElement) totalElement.textContent = data.totalRegistered;
        if (upcomingElement) upcomingElement.textContent = data.upcomingEvents;
        if (attendedElement) attendedElement.textContent = data.attendedEvents;
        if (cancelledElement) cancelledElement.textContent = data.cancelledEvents;
    } catch (err) {
        console.error('Dashboard stats error:', err);
    }
}

// "Upcoming Events" cards on the dashboard
async function loadUpcomingEvents() {
    var grid = document.getElementById('upcomingEventsGrid');
    if (!grid) return;

    try {
        var response = await fetch('/api/registrations', { cache: 'no-store' });
        if (!response.ok) return;

        var data = await response.json();
        var allRegistrations = data.registrations;

        var todayStr = getTodayString();
        var upcoming = [];
        for (var i = 0; i < allRegistrations.length; i++) {
            var reg = allRegistrations[i];
            if (reg.status === 'Registered' && getDateOnly(reg.event_date) >= todayStr) {
                upcoming.push(reg);
            }
        }

        if (upcoming.length === 0) {
            grid.innerHTML = '<p style="color: grey;">No upcoming events yet. <a href="events.html" style="color: lightcoral;">Browse events</a>.</p>';
            return;
        }

        var html = '';
        for (var j = 0; j < upcoming.length; j++) {
            var event = upcoming[j];
            html = html + `
            <div class="cards">
                <h4 class="event-title">${event.title}</h4>
                <p class="event-meta">📅 ${formatDate(event.event_date)}</p>
                <p class="event-meta">🕐 ${event.start_time}</p>
                <p class="event-meta">📍 ${event.location}</p>
                <span class="event-status status-upcoming">Upcoming</span>
                <a href="event-details.html?id=${event.event_id}" style="display:block; margin-top:12px; color:lightcoral; font-weight:500;"> View Details → </a>
            </div>
            `;
        }
        grid.innerHTML = html;

    } catch (err) {
        console.error('Upcoming events error:', err);
    }
}

function getDateOnly(dateValue) {
    return String(dateValue).substring(0, 10);
}

// today's date as YYYY-MM-DD using the browser's LOCAL time
function getTodayString() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

// Small helper to format a database date (YYYY-MM-DD) into something readable
function formatDate(dateInput) {
    var dateOnly = getDateOnly(dateInput);
    var parts = dateOnly.split('-');
    var localDate = new Date(parts[0], parts[1] - 1, parts[2]);
    var options = { month: 'short', day: 'numeric', year: 'numeric' };
    return localDate.toLocaleDateString('en-US', options);
}

// "Recent Activity" list on the dashboard
async function loadRecentActivity() {
    var list = document.getElementById('recentActivity');
    if (!list) return;

    try {
        var response = await fetch('/api/registrations/recent-activity', { cache: 'no-store' });
        if (!response.ok) return;

        var data = await response.json();
        var activity = data.activity;

        if (activity.length === 0) {
            list.innerHTML = '<li><p class="activity-title" style="color: grey;">Nothing here yet. Register for something to get started.</p></li>';
            return;
        }

        var html = '';
        for (var i = 0; i < activity.length; i++) {
            var item = activity[i];
            var actionText = '';
            var dot = 'green';

            if (item.status === 'Cancelled') {
                actionText = 'Cancelled registration for "' + item.title + '"';
                dot = 'orange';
            } else if (item.status === 'Attended') {
                actionText = 'Attended "' + item.title + '"';
                dot = 'blue';
            } else {
                actionText = 'Registered for "' + item.title + '"';
                dot = 'green';
            }

            html = html + `
            <li>
                <span class="activity-dot dot-${dot}"></span>
                <div>
                    <p class="activity-title">${actionText}</p>
                    <p class="activity-time">${timeAgo(item.registration_date)}</p>
                </div>
            </li>
            `;
        }
        list.innerHTML = html;

    } catch (err) {
        console.error('Recent activity error:', err);
    }
}

function timeAgo(dateString) {
    var then = new Date(dateString);
    var secondsAgo = Math.floor((new Date() - then) / 1000);

    if (secondsAgo < 60) return 'just now';

    var minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) return minutesAgo + (minutesAgo === 1 ? ' minute ago' : ' minutes ago');

    var hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return hoursAgo + (hoursAgo === 1 ? ' hour ago' : ' hours ago');

    var daysAgo = Math.floor(hoursAgo / 24);
    return daysAgo + (daysAgo === 1 ? ' day ago' : ' days ago');
}

// "Suggested For You" list on the dashboard based on whatever category the student registers for the most
async function loadSuggestedEvents() {
    var container = document.getElementById('suggestedEvents');
    if (!container) return;

    try {
        var response = await fetch('/api/registrations/suggested', { cache: 'no-store' });
        if (!response.ok) return;

        var data = await response.json();
        var suggestions = data.suggestions;

        if (suggestions.length === 0) {
            container.innerHTML = '<p style="color: grey;">No suggestions right now, check back later.</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < suggestions.length; i++) {
            var s = suggestions[i];
            html = html + `
            <div class="suggestion-item">
                <div class="suggestion-info">
                    <p class="suggestion-title">${s.title}</p>
                    <p class="suggestion-meta">📅 ${formatDate(s.event_date)} • 📍 ${s.location}</p>
                </div>
                <a href="event-details.html?id=${s.event_id}" class="suggestion-link">View →</a>
            </div>
            `;
        }
        container.innerHTML = html;

    } catch (err) {
        console.error('Suggested events error:', err);
    }
}


// ========================================
// MY-REGISTRATION FUNCTIONS
// ========================================

// Load registrations from the real backend and apply the selected filter
async function loadRegistrationsData(filter) {
    var list = document.getElementById('registrationsList');
    var countDisplay = document.getElementById('registrationCount');
    if (!list) return;

    var allRegistrations = [];

    try {
        var response = await fetch('/api/registrations', { cache: 'no-store' });
        if (!response.ok) {
            list.innerHTML = '<div class="empty-state"><p>Please log in to see your registrations.</p></div>';
            return;
        }
        var data = await response.json();
        allRegistrations = data.registrations;
    } catch (err) {
        console.error('Load registrations error:', err);
        list.innerHTML = '<div class="empty-state"><p>Could not load registrations. Please try again.</p></div>';
        return;
    }

    var todayStr = getTodayString();
    var normalized = [];
    for (var i = 0; i < allRegistrations.length; i++) {
        var reg = allRegistrations[i];
        var eventDateOnly = getDateOnly(reg.event_date);
        var simpleStatus = '';
        var statusLabel = '';

        if (reg.status === 'Cancelled') {
            simpleStatus = 'cancelled';
            statusLabel = 'Cancelled';
        } else if (reg.status === 'Attended') {
            simpleStatus = 'past';
            statusLabel = 'Attended';
        } else if (reg.status === 'Registered' && eventDateOnly < todayStr) {
            simpleStatus = 'past';
            statusLabel = 'Past';
        } else {
            simpleStatus = 'upcoming';
            statusLabel = 'Upcoming';
        }

        normalized.push({
            id: reg.registration_id,
            eventId: reg.event_id,
            title: reg.title,
            date: formatDate(reg.event_date),
            location: reg.location,
            registeredOn: formatDate(reg.registration_date),
            status: simpleStatus,
            statusLabel: statusLabel
        });
    }

    // Filter the data based on which tab was clicked
    var filtered = [];
    if (filter === 'all') {
        filtered = normalized;
    } else {
        for (var j = 0; j < normalized.length; j++) {
            if (normalized[j].status === filter) {
                filtered.push(normalized[j]);
            }
        }
    }

    if (countDisplay) {
        countDisplay.textContent = filtered.length + ' registrations';
    }

    if (filtered.length === 0) {
        list.innerHTML = `
        <div class="empty-state">
            <p>No registrations found</p>
            <p style="color: #999; margin-top: 8px;"> Browse events and register to get started!</p>
            <a href="events.html" class="btn" style="display:inline-block; margin-top:16px; width:auto; padding:10px 24px;"> Browse Events
            </a>
        </div>
        `;
    } else {
        var html = '';
        for (var k = 0; k < filtered.length; k++) {
            var item = filtered[k];

            var actions = '';
            if (item.status === 'upcoming') {
                actions = `
                <a href="event-details.html?id=${item.eventId}"class="btn" style="width:auto; height:auto; padding:6px 16px;">View</a>
                <button class="btn" style="width:auto; height:auto; padding:6px 16px; background:#c0392b; color:white;" onclick="cancelRegistration(${item.id})">Cancel</button>
                `;
            } else {
                actions = `
                <a href="event-details.html?id=${item.eventId}"class="btn"style="width:auto; height:auto; padding:6px 16px;">View</a>
                `;
            }

            html = html + `
            <div class="registration-card">
                <div class="registration-info">
                    <h4 class="registration-title">${item.title}</h4>
                    <p class="registration-details">
                    <span>📅 ${item.date}</span>
                    <span>📍 ${item.location}</span>
                    <span>📌 Registered: ${item.registeredOn}</span>
                    </p>
                    <span class="event-status status-${item.status}">
                    ${item.statusLabel}
                    </span>
                </div>
                <div class="registration-actions">${actions}</div>
            </div>
            `;
        }
        list.innerHTML = html;
    }
}

// Set up the filter tabs so that clicking them will filter the list
function setupFilterTabs() {
    var tabs = document.querySelectorAll('.filter-tab');

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function() {
            var allTabs = document.querySelectorAll('.filter-tab');
            for (var j = 0; j < allTabs.length; j++) {
                allTabs[j].classList.remove('active');
            }
            this.classList.add('active');

            var filter = this.getAttribute('data-filter');
            loadRegistrationsData(filter);
        });
    }
}


// ========================================
// USER ACTION FUNCTIONS
// ========================================

// Cancel registration
async function cancelRegistration(registrationId) {
    var confirmCancel = confirm(
        'Are you sure you want to cancel this registration?\n' +
        'This action cannot be undone.'
    );

    if (!confirmCancel) return;

    try {
        var response = await fetch(`/api/registrations/${registrationId}/cancel`, {
            method: 'POST'
        });

        var data = await response.json();

        if (response.ok) {
            alert('Registration cancelled successfully!');
            var activeTab = document.querySelector('.filter-tab.active');
            var filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
            loadRegistrationsData(filter);
        } else {
            alert(data.error || 'Could not cancel registration.');
        }
    } catch (err) {
        console.error('Cancel registration error:', err);
        alert('Could not reach the server.');
    }
}

// Go to the event details page
function viewEventDetails(eventId) {
    window.location.href = 'event-details.html?id=' + eventId;
}


// ========================================
// EVENT DETAILS — REGISTER BUTTON
// ========================================

// Register button on event-details.html.
function setupRegisterButton() {
    var registerBtn = document.getElementById('eventRegisterBtn');
    if (!registerBtn) return;

    registerBtn.addEventListener('click', async function() {
        var urlParams = new URLSearchParams(window.location.search);
        var eventId = urlParams.get('id');

        if (!eventId) {
            alert('This event page was not opened with a specific event ID, so registration cannot be completed yet.');
            return;
        }

        try {
            var response = await fetch(`/api/registrations/${eventId}`, {
                method: 'POST'
            });

            var data = await response.json();

            if (response.ok) {
                alert('You are registered for this event!');
                window.location.href = 'my-registration.html';
            } else {
                alert(data.error || 'Could not register for this event.');
            }
        } catch (err) {
            console.error('Register for event error:', err);
            alert('Could not reach the server.');
        }
    });
}


// ========================================
// EVENTS LIST PAGE (events.html)
// ========================================

// pulls real events from the db and builds the cards
async function loadEventsList(filters) {
    var container = document.getElementById('eventCardsContainer');
    if (!container) return;

    filters = filters || {};
    var url = '/api/events';
    var params = [];
    if (filters.category) params.push('category=' + encodeURIComponent(filters.category));
    if (filters.search) params.push('search=' + encodeURIComponent(filters.search));
    if (params.length > 0) url += '?' + params.join('&');

    try {
        var response = await fetch(url, { cache: 'no-store' });
        var data = await response.json();
        var events = data.events || [];

        if (events.length === 0) {
            container.innerHTML = '<p style="color: grey;">No events match your search.</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < events.length; i++) {
            var ev = events[i];

            html = html + `
            <a href="event-details.html?id=${ev.event_id}"><div class="cards">
                <h4>${ev.title}</h4>
                <p class="p">${ev.description ? ev.description.substring(0, 80) : ''}...</p>
            </div></a>
            `;
        }
        container.innerHTML = html;

    } catch (err) {
        console.error('Load events error:', err);
        container.innerHTML = '<p style="color: grey;">Could not load events right now.</p>';
    }
}

// search box + category dropdown
function setupEventsFilters() {
    var searchInput = document.getElementById('eventSearch');
    var categorySelect = document.getElementById('categoryFilter');

    function reload() {
        loadEventsList({
            search: searchInput ? searchInput.value : '',
            category: categorySelect ? categorySelect.value : ''
        });
    }

    if (searchInput) {
        var typingTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(reload, 300);
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', reload);
    }
}


// ========================================
// EVENT DETAILS PAGE (event-details.html)
// ========================================

// fills the page with the specific details of the event
async function loadEventDetails() {
    var urlParams = new URLSearchParams(window.location.search);
    var eventId = urlParams.get('id');

    if (!eventId) return; 

    try {
        var response = await fetch(`/api/events/${eventId}`, { cache: 'no-store' });
        if (!response.ok) return;

        var data = await response.json();
        var ev = data.event;

        var titleEl = document.getElementById('eventTitle');
        var statusEl = document.getElementById('eventStatusBadge');
        var organizerEl = document.getElementById('eventOrganizerName');
        var organizerCardEl = document.getElementById('eventOrganizerNameCard');
        var locationLineEl = document.getElementById('eventLocationLine');
        var dateLineEl = document.getElementById('eventDateLine');
        var descriptionEl = document.getElementById('eventDescription');
        var capacityEl = document.getElementById('eventCapacityText');

        if (titleEl) titleEl.textContent = ev.title;
        if (organizerEl) organizerEl.textContent = ev.organizer_name || 'Campus Event Planner';
        if (organizerCardEl) organizerCardEl.textContent = ev.organizer_name || 'Campus Event Planner';
        if (locationLineEl) locationLineEl.textContent = '📍 ' + ev.location;
        if (dateLineEl) dateLineEl.textContent = '📅 ' + formatDate(ev.event_date) + ' · ' + ev.start_time + ' – ' + ev.end_time;
        if (descriptionEl) descriptionEl.innerHTML = `<p class="p">${ev.description || ''}</p>`;
        if (capacityEl) capacityEl.textContent = `${ev.capacity} spots · ${ev.registered_count} registered`;

        if (statusEl) {
            statusEl.textContent = ev.status;
            statusEl.className = 'status-badge ' + (ev.status === 'Open' ? 'open' : (ev.status === 'Full' ? 'full' : 'cancelled'));
        }

        document.title = ev.title + ' - Smart Campus Event Planner';

    } catch (err) {
        console.error('Load event details error:', err);
    }
}


// ========================================
// ADMIN — CREATE EVENT PAGE (create-event.html)
// ========================================

async function setupCreateEventForm() {
    var form = document.getElementById('createEventForm');
    if (!form) return;

    // fill the category dropdown from the db instead of the hardcoded list
    var categorySelect = document.getElementById('eventCategory');
    if (categorySelect) {
        try {
            var response = await fetch('/api/events/categories');
            var data = await response.json();

            var options = '<option value="">Select a category</option>';
            for (var i = 0; i < data.categories.length; i++) {
                var cat = data.categories[i];
                options += `<option value="${cat.category_id}">${cat.category_name}</option>`;
            }
            categorySelect.innerHTML = options;
        } catch (err) {
            console.error('Load categories error:', err);
        }
    }

    var urlParams = new URLSearchParams(window.location.search);
    var editId = urlParams.get('edit');

    if (editId) {
        var pageHeader = document.querySelector('.page-header h1');
        if (pageHeader) pageHeader.textContent = 'Edit Event';

        try {
            var eventResponse = await fetch(`/api/events/${editId}`);
            var eventData = await eventResponse.json();
            var ev = eventData.event;

            document.getElementById('eventTitle').value = ev.title;
            document.getElementById('eventDescription').value = ev.description || '';
            document.getElementById('eventCategory').value = ev.category_id;
            document.getElementById('eventOrganizer').value = ev.organizer_name || '';
            document.getElementById('eventDate').value = ev.event_date.split('T')[0];
            document.getElementById('startTime').value = ev.start_time;
            document.getElementById('endTime').value = ev.end_time;
            document.getElementById('eventLocation').value = ev.location;
            document.getElementById('eventCapacity').value = ev.capacity;
            document.getElementById('eventStatus').value = ev.status;
        } catch (err) {
            console.error('Load event for editing error:', err);
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        var payload = {
            title: document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            categoryId: document.getElementById('eventCategory').value,
            organizerName: document.getElementById('eventOrganizer').value,
            eventDate: document.getElementById('eventDate').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            location: document.getElementById('eventLocation').value,
            capacity: document.getElementById('eventCapacity').value,
            status: document.getElementById('eventStatus').value
        };

        try {
            var url = editId ? `/api/events/${editId}` : '/api/events';
            var method = editId ? 'PUT' : 'POST';

            var response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            var data = await response.json();

            if (response.ok) {
                alert(editId ? 'Event updated!' : 'Event created!');
                window.location.href = 'manage-events.html';
            } else {
                alert(data.error || 'Something went wrong.');
            }
        } catch (err) {
            console.error('Save event error:', err);
            alert('Could not reach the server.');
        }
    });
}


// ========================================
// ADMIN — MANAGE EVENTS PAGE (manage-events.html)
// ========================================

async function loadManageEventsTable() {
    var tbody = document.getElementById('eventsTableBody');
    if (!tbody) return;

    try {
        var response = await fetch('/api/events', { cache: 'no-store' });
        var data = await response.json();
        var events = data.events || [];

        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No events yet. Create one to get started.</td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < events.length; i++) {
            var ev = events[i];
            var badgeClass = ev.status.toLowerCase();

            html = html + `
            <tr>
                <td><strong>${ev.title}</strong></td>
                <td>${ev.category_name || 'Other'}</td>
                <td>${formatDate(ev.event_date)}</td>
                <td>${ev.registered_count} / ${ev.capacity}</td>
                <td><span class="status-badge ${badgeClass}">${ev.status}</span></td>
                <td class="action-buttons">
                    <button class="btn-small" onclick="viewRegistrations(${ev.event_id}, '${ev.title.replace(/'/g, "\\'")}')">View</button>
                    <button class="btn-small" onclick="editEvent(${ev.event_id})">Edit</button>
                    <button class="btn-small danger" onclick="cancelEvent(${ev.event_id})">Cancel</button>
                    <button class="btn-small danger" onclick="deleteEvent(${ev.event_id})">Delete</button>
                </td>
            </tr>
            `;
        }
        tbody.innerHTML = html;

    } catch (err) {
        console.error('Load manage events error:', err);
        tbody.innerHTML = '<tr><td colspan="6">Could not load events.</td></tr>';
    }
}

function editEvent(eventId) {
    window.location.href = `create-event.html?edit=${eventId}`;
}

async function cancelEvent(eventId) {
    if (!confirm('Cancel this event? Students will no longer be able to register.')) return;

    try {
        var response = await fetch(`/api/events/${eventId}/cancel`, { method: 'POST' });
        if (response.ok) {
            loadManageEventsTable();
        } else {
            var data = await response.json();
            alert(data.error || 'Could not cancel the event.');
        }
    } catch (err) {
        console.error('Cancel event error:', err);
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Delete this event permanently? This action cannot be undone.')) return;

    try {
        var response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
        if (response.ok) {
            loadManageEventsTable();
        } else {
            var data = await response.json();
            alert(data.error || 'Could not delete the event.');
        }
    } catch (err) {
        console.error('Delete event error:', err);
    }
}

async function viewRegistrations(eventId, eventTitle) {
    var modal = document.getElementById('registrationsModal');
    var titleEl = document.getElementById('modalEventTitle');
    var listEl = document.getElementById('modalRegistrationsList');
    if (!modal) return;

    titleEl.textContent = 'Registrations — ' + eventTitle;
    listEl.innerHTML = 'Loading...';
    modal.classList.add('active');

    try {
        var response = await fetch(`/api/admin/events/${eventId}/registrations`, { cache: 'no-store' });
        var data = await response.json();
        var registrations = data.registrations || [];

        if (registrations.length === 0) {
            listEl.innerHTML = '<p style="color: grey;">No one has registered for this event yet.</p>';
            return;
        }

        var statusClassMap = {
            'Registered': 'status-upcoming',
            'Attended': 'status-attended',
            'Cancelled': 'status-cancelled',
            'Missed': 'status-past'
        };

        var html = '';
        for (var i = 0; i < registrations.length; i++) {
            var r = registrations[i];
            var badgeClass = statusClassMap[r.status] || 'status-upcoming';

            html = html + `
            <div class="registration-row">
                <div>
                    <strong>${r.full_name}</strong><br>
                    <span style="color: grey; font-size: 0.9rem;">${r.email}</span>
                </div>
                <span class="event-status ${badgeClass}">${r.status}</span>
            </div>
            `;
        }
        listEl.innerHTML = html;

    } catch (err) {
        console.error('View registrations error:', err);
        listEl.innerHTML = '<p style="color: grey;">Could not load registrations.</p>';
    }
}

function closeRegistrationsModal() {
    var modal = document.getElementById('registrationsModal');
    if (modal) modal.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', function() {
    var overlay = document.getElementById('registrationsModal');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeRegistrationsModal();
        });
    }
});


// ========================================
// ADMIN DASHBOARD PAGE (admin-dashboard.html)
// ========================================

async function loadAdminDashboardStats() {
    try {
        var response = await fetch('/api/admin/dashboard-stats', { cache: 'no-store' });
        if (!response.ok) return;

        var stats = await response.json();

        var totalEventsEl = document.getElementById('totalEventsStat');
        var totalRegEl = document.getElementById('totalRegistrationsStat');
        var popularEl = document.getElementById('mostPopularStat');
        var attendanceEl = document.getElementById('avgAttendanceStat');

        if (totalEventsEl) totalEventsEl.textContent = stats.totalEvents;
        if (totalRegEl) totalRegEl.textContent = stats.totalRegistrations;
        if (popularEl) popularEl.textContent = stats.mostPopularCategory;
        if (attendanceEl) attendanceEl.textContent = stats.avgAttendance + '%';

    } catch (err) {
        console.error('Admin dashboard stats error:', err);
    }
}

async function loadEventPicker(selectId, onSelectCallback) {
    var select = document.getElementById(selectId);
    if (!select) return;

    try {
        var response = await fetch('/api/events?all=true', { cache: 'no-store' });
        var data = await response.json();
        var events = data.events || [];

        var options = '<option value="">Select an event</option>';
        for (var i = 0; i < events.length; i++) {
            options += `<option value="${events[i].event_id}">${events[i].title} (${formatDate(events[i].event_date)})</option>`;
        }
        select.innerHTML = options;

        select.addEventListener('change', function() {
            onSelectCallback(this.value);
        });

    } catch (err) {
        console.error('Load event picker error:', err);
        select.innerHTML = '<option value="">Could not load events</option>';
    }
}


// ========================================
// ADMIN — VIEW REGISTRATIONS PAGE (view-registrations.html)
// ========================================

async function loadRegistrationsForPickedEvent(eventId) {
    var tbody = document.getElementById('registrationsTableBody');
    if (!tbody) return;

    if (!eventId) {
        tbody.innerHTML = '<tr><td colspan="4">Pick an event above to see its registrations.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        var response = await fetch(`/api/admin/events/${eventId}/registrations`, { cache: 'no-store' });
        var data = await response.json();
        var registrations = data.registrations || [];

        if (registrations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No one has registered for this event yet.</td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < registrations.length; i++) {
            var r = registrations[i];
            html = html + `
            <tr>
                <td>${r.full_name}</td>
                <td>${r.email}</td>
                <td>${formatDate(r.registration_date)}</td>
                <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
            </tr>
            `;
        }
        tbody.innerHTML = html;

    } catch (err) {
        console.error('Load registrations error:', err);
        tbody.innerHTML = '<tr><td colspan="4">Could not load registrations.</td></tr>';
    }
}


// ========================================
// ADMIN — ATTENDANCE PAGE (attendance-management.html)
// ========================================

async function loadAttendanceTable(eventId) {
    var tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;

    if (!eventId) {
        tbody.innerHTML = '<tr><td colspan="4">Pick an event above to mark attendance.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        var response = await fetch(`/api/admin/events/${eventId}/registrations`, { cache: 'no-store' });
        var data = await response.json();
        var registrations = data.registrations || [];

        if (registrations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No one has registered for this event yet.</td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < registrations.length; i++) {
            var r = registrations[i];
            html = html + `
            <tr>
                <td>${r.full_name}</td>
                <td>${r.email}</td>
                <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
                <td class="action-buttons">
                    <button class="btn-small" onclick="markStudentAttendance(${r.registration_id}, true, '${eventId}')">Attended</button>
                    <button class="btn-small danger" onclick="markStudentAttendance(${r.registration_id}, false, '${eventId}')">Absent</button>
                </td>
            </tr>
            `;
        }
        tbody.innerHTML = html;

    } catch (err) {
        console.error('Load attendance error:', err);
        tbody.innerHTML = '<tr><td colspan="4">Could not load registrations.</td></tr>';
    }
}

async function markStudentAttendance(registrationId, attended, eventId) {
    try {
        var response = await fetch(`/api/admin/attendance/${registrationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attended: attended })
        });

        if (response.ok) {
            loadAttendanceTable(eventId);
        } else {
            var data = await response.json();
            alert(data.error || 'Could not update attendance.');
        }
    } catch (err) {
        console.error('Mark attendance error:', err);
    }
}


// ========================================
// ADMIN — STATISTICS PAGE (statistics.html)
// ========================================

async function loadStatisticsTable() {
    var tbody = document.getElementById('statisticsTableBody');
    if (!tbody) return;

    try {
        var response = await fetch('/api/admin/event-stats', { cache: 'no-store' });
        var data = await response.json();
        var stats = data.stats || [];

        if (stats.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No events yet.</td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < stats.length; i++) {
            var s = stats[i];
            var attendanceText = s.attendanceRate === null ? 'Not marked yet' : s.attendanceRate + '%';

            html = html + `
            <tr>
                <td><strong>${s.title}</strong></td>
                <td><span class="status-badge ${s.status.toLowerCase()}">${s.status}</span></td>
                <td>${s.totalSignups} / ${s.capacity}</td>
                <td>${s.percentFilled}%</td>
                <td>${attendanceText}</td>
            </tr>
            `;
        }
        tbody.innerHTML = html;

    } catch (err) {
        console.error('Load statistics error:', err);
        tbody.innerHTML = '<tr><td colspan="5">Could not load statistics.</td></tr>';
    }
}


// ========================================
// REGISTER FORM
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            var firstName = document.getElementById('first-name').value;
            var lastName = document.getElementById('last-name').value;
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            var confirmPassword = document.getElementById('confirm-password').value;
            var role = document.getElementById('role').value;

            try {
                var response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, password, confirmPassword, role })
                });

                var data = await response.json();

                if (response.ok) {
                    alert('Account created! You can now log in.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.error || 'Something went wrong.');
                }
            } catch (err) {
                console.error('Register error:', err);
                alert('Could not reach the server.');
            }
        });
    }
});


// ========================================
// LOGIN FORM
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;

            try {
                var response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                var data = await response.json();

                if (response.ok) {
                    if (data.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                } else {
                    alert(data.error || 'Login failed.');
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('Could not reach the server.');
            }
        });
    }
});


// ========================================
// NAVBAR AUTH STATE
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

async function checkAuthStatus() {
    var authOnlyLinks = document.querySelectorAll('.auth-only');
    var actionBtn = document.getElementById('navbarActionBtn');

    try {
        var response = await fetch('/api/auth/me', { cache: 'no-store' });

        if (response.ok) {
            for (var i = 0; i < authOnlyLinks.length; i++) {
                authOnlyLinks[i].classList.remove('auth-only');
            }
            if (actionBtn) {
                actionBtn.textContent = 'Logout';
                actionBtn.href = '#';
                actionBtn.onclick = async function(e) {
                e.preventDefault();
                await fetch('/api/auth/logout', { cache: 'no-store' });
                window.location.href = 'login.html';
            };
            }
        } else {
            for (var j = 0; j < authOnlyLinks.length; j++) {
                authOnlyLinks[j].classList.add('auth-only');
            }
            if (actionBtn) {
                actionBtn.textContent = 'Login';
                actionBtn.href = 'login.html';
                actionBtn.onclick = null;
            }
        }
    } catch (err) {
        console.error('Auth check error:', err);
    }
}