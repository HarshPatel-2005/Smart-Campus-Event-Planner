/* ========================================
 SMART CAMPUS EVENT PLANNER           *
 Student Dashboard & My Registrations
 Standalone JavaScript - Version 1.0
 ======================================== */

// ========================================
// 1. MAIN INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {

    // --- Dashboard Page ---
    // Check if we're on the dashboard page by looking for a unique element
    if (document.getElementById('currentDate')) {
        displayCurrentDate();
        loadDashboardStats();
        loadUpcomingEvents();
        loadRecentActivity();
        loadSuggestedEvents();
    }

    // --- My Registrations Page ---
    // Check if we're on the registrations page
    if (document.getElementById('registrationsList')) {
        loadRegistrationsData('all');
        setupFilterTabs();
    }

});


// ========================================
// 2. DASHBOARD FUNCTIONS
// ========================================

// Displays the current date in the dashboard header
function displayCurrentDate() {
    const dateDisplay = document.getElementById('currentDate');
    if (!dateDisplay) return;

    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

// Loads and displays dashboard statistics cards
function loadDashboardStats() {
    // In a real app, these would come from a database, but for Deliverable 1, we use hard-coded data
    const stats = {
        totalRegistered: 6,
        upcomingEvents: 4,
        attendedEvents: 2,
        cancelledEvents: 0
    };

    // Update each stat card
    const totalElement = document.getElementById('totalRegistered');
    const upcomingElement = document.getElementById('upcomingEvents');
    const attendedElement = document.getElementById('attendedEvents');
    const cancelledElement = document.getElementById('cancelledEvents');

    if (totalElement) totalElement.textContent = stats.totalRegistered;
    if (upcomingElement) upcomingElement.textContent = stats.upcomingEvents;
    if (attendedElement) attendedElement.textContent = stats.attendedEvents;
    if (cancelledElement) cancelledElement.textContent = stats.cancelledEvents;
}

// Loads and displays upcoming events in the dashboard
function loadUpcomingEvents() {
    const grid = document.getElementById('upcomingEventsGrid');
    if (!grid) return;

    // Hard-coded event data for Deliverable 1
    const events = [
        {
            title: 'Web Development Workshop',
            date: 'Aug 10, 2026',
            time: '10:00 AM - 12:00 PM',
            location: 'Room 205, CompSci Building',
            id: 1
        },
        {
            title: 'AI in Healthcare Seminar',
            date: 'Aug 12, 2026',
            time: '2:00 PM - 4:00 PM',
            location: 'Auditorium A',
            id: 2
        },
        {
            title: 'Career Fair 2026',
            date: 'Aug 15, 2026',
            time: '9:00 AM - 5:00 PM',
            location: 'Main Hall',
            id: 3
        },
        {
            title: 'Data Science Meetup',
            date: 'Aug 18, 2026',
            time: '6:00 PM - 8:00 PM',
            location: 'Student Lounge',
            id: 4
        }
    ];

    // Generate HTML for each event card
    grid.innerHTML = events.map(function(event) {
        return `
        <div class="cards">
        <h4 class="event-title">${event.title}</h4>
        <p class="event-meta">📅 ${event.date}</p>
        <p class="event-meta">🕐 ${event.time}</p>
        <p class="event-meta">📍 ${event.location}</p>
        <span class="event-status status-upcoming">Upcoming</span>
        <a href="event-details.html?id=${event.id}"
        style="display:block; margin-top:12px; color:lightcoral; font-weight:500;">
        View Details →
        </a>
        </div>
        `;
    }).join('');
}

// Loads and displays recent activity in the dashboard
function loadRecentActivity() {
    const list = document.getElementById('recentActivity');
    if (!list) return;

    // Hard-coded activity data
    const activities = [
        {
            title: 'Registered for "Web Development Workshop"',
            time: '2 hours ago',
            dot: 'green'
        },
        {
            title: 'Attended "Career Fair 2026"',
            time: '2 days ago',
            dot: 'blue'
        },
        {
            title: 'Reminder: "AI in Healthcare" starts tomorrow',
            time: '1 day ago',
            dot: 'orange'
        }
    ];

    list.innerHTML = activities.map(function(activity) {
        return `
        <li>
        <span class="activity-dot dot-${activity.dot}"></span>
        <div>
        <p class="activity-title">${activity.title}</p>
        <p class="activity-time">${activity.time}</p>
        </div>
        </li>
        `;
    }).join('');
}

// Loads and displays suggested events in the dashboard
function loadSuggestedEvents() {
    const container = document.getElementById('suggestedEvents');
    if (!container) return;

    // Hard-coded suggestions based on user interests
    const suggestions = [
        {
            title: 'Data Science Bootcamp',
            date: 'Aug 15',
            location: 'Room 301'
        },
        {
            title: 'International Food Festival',
            date: 'Aug 20',
            location: 'Main Square'
        },
        {
            title: 'Graduate School Info Session',
            date: 'Aug 22',
            location: 'Online'
        }
    ];

    container.innerHTML = suggestions.map(function(suggestion) {
        return `
        <div class="suggestion-item">
        <div class="suggestion-info">
        <p class="suggestion-title">${suggestion.title}</p>
        <p class="suggestion-meta">📅 ${suggestion.date} • 📍 ${suggestion.location}</p>
        </div>
        <a href="event-details.html" class="suggestion-link">View →</a>
        </div>
        `;
    }).join('');
}


// ========================================
// 3. MY REGISTRATIONS FUNCTIONS
// ========================================

/**
 * Loads and displays registrations with optional filtering
 * @param {string} filter - 'all', 'upcoming', 'past', or 'cancelled'
 */
function loadRegistrationsData(filter) {
    const list = document.getElementById('registrationsList');
    const countDisplay = document.getElementById('registrationCount');
    if (!list) return;

    // Hard-coded registration data for Deliverable 1
    const allRegistrations = [
        {
            id: 1,
            title: 'Web Development Workshop',
            date: 'Aug 10, 2026',
            location: 'Room 205, CompSci Building',
            registeredOn: 'Jul 25, 2026',
            status: 'upcoming',
            statusLabel: 'Upcoming'
        },
        {
            id: 2,
            title: 'Career Fair 2026',
            date: 'Aug 15, 2026',
            location: 'Main Hall',
            registeredOn: 'Jul 20, 2026',
            status: 'upcoming',
            statusLabel: 'Upcoming'
        },
        {
            id: 3,
            title: 'Spring Festival 2026',
            date: 'Apr 20, 2026',
            location: 'Campus Grounds',
            registeredOn: 'Apr 10, 2026',
            status: 'attended',
            statusLabel: 'Attended'
        },
        {
            id: 4,
            title: 'Guest Lecture: Future of AI',
            date: 'May 5, 2026',
            location: 'Auditorium A',
            registeredOn: 'Apr 28, 2026',
            status: 'past',
            statusLabel: 'Past'
        }
    ];

    // Apply filter
    var filtered = allRegistrations;

    if (filter === 'upcoming') {
        filtered = allRegistrations.filter(function(reg) {
            return reg.status === 'upcoming';
        });
    } else if (filter === 'past') {
        filtered = allRegistrations.filter(function(reg) {
            return reg.status === 'past';
        });
    } else if (filter === 'cancelled') {
        filtered = allRegistrations.filter(function(reg) {
            return reg.status === 'cancelled';
        });
    }
    // 'all' shows everything

    // Update count
    if (countDisplay) {
        var countText = filtered.length + ' registration';
        if (filtered.length !== 1) {
            countText += 's';
        }
        countDisplay.textContent = countText;
    }

    // Show empty state or list
    if (filtered.length === 0) {
        var filterName = filter.charAt(0).toUpperCase() + filter.slice(1);
        if (filter === 'all') filterName = '';

        list.innerHTML = `
        <div class="empty-state">
        <p>No ${filterName ? filterName + ' ' : ''}registrations found</p>
        <p style="color: #999; margin-top: 8px;">
        Browse events and register to get started!
        </p>
        <a href="events.html" class="btn"
        style="display:inline-block; margin-top:16px; width:auto; padding:10px 24px;">
        Browse Events
        </a>
        </div>
        `;
    } else {
        // Build registration cards
        list.innerHTML = filtered.map(function(reg) {
            // Build action buttons based on status
            var actions = '';

            if (reg.status === 'upcoming') {
                actions = `
                <a href="event-details.html?id=${reg.id}"
                class="btn"
                style="width:auto; height:auto; padding:6px 16px;">
                View
                </a>
                <button class="btn"
                style="width:auto; height:auto; padding:6px 16px;
                background:#c0392b; color:white;"
                onclick="cancelRegistration(${reg.id})">
                Cancel
                </button>
                `;
            } else {
                actions = `
                <a href="event-details.html?id=${reg.id}"
                class="btn"
                style="width:auto; height:auto; padding:6px 16px;">
                View
                </a>
                `;
            }

            return `
            <div class="registration-card">
            <div class="registration-info">
            <h4 class="registration-title">${reg.title}</h4>
            <p class="registration-details">
            <span>📅 ${reg.date}</span>
            <span>📍 ${reg.location}</span>
            <span>📌 Registered: ${reg.registeredOn}</span>
            </p>
            <span class="event-status status-${reg.status}">
            ${reg.statusLabel}
            </span>
            </div>
            <div class="registration-actions">
            ${actions}
            </div>
            </div>
            `;
        }).join('');
    }
}

// Sets up the filter tabs functionality
function setupFilterTabs() {
    var tabs = document.querySelectorAll('.filter-tab');

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(function(t) {
                t.classList.remove('active');
            });

            // Add active class to clicked tab
            this.classList.add('active');

            // Get filter value and reload data
            var filter = this.getAttribute('data-filter');
            loadRegistrationsData(filter);
        });
    });
}


// ========================================
// 4. USER ACTION FUNCTIONS
// ========================================

/**
 * Handles registration cancellation with confirmation
 * @param {number} registrationId - The ID of the registration to cancel
 */
function cancelRegistration(registrationId) {
    var confirmCancel = confirm(
        'Are you sure you want to cancel this registration?\n' +
        'This action cannot be undone.'
    );

    if (confirmCancel) {
        // In a real app, this would send a DELETE request to the server, but for Deliverable 1, we can just show a success message

        alert('Registration cancelled successfully!');

        // Reload the registrations list & find which filter is active and reload
        var activeTab = document.querySelector('.filter-tab.active');
        var filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
        loadRegistrationsData(filter);
    }
}

/**
 * Helper function to navigate to event details
 * @param {number} eventId - The ID of the event
 */
function viewEventDetails(eventId) {
    window.location.href = 'event-details.html?id=' + eventId;
}


// ========================================
// 5. (OPTIONAL) DEMO DATA REFRESH
// ========================================

// Simulates refreshing dashboard data. In a real app, this would fetch from a server
function refreshDashboard() {
    console.log('Dashboard refreshed at ' + new Date().toLocaleTimeString());

    // Reload all dashboard components
    loadDashboardStats();
    loadUpcomingEvents();
    loadRecentActivity();
    loadSuggestedEvents();
}

// Uncomment the line below to auto-refresh every 60 seconds (for demo)
// setInterval(refreshDashboard, 60000);