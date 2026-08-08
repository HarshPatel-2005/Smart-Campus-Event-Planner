// ========================================
// MAIN INITIALIZATION - this will run when the page loads
// ========================================
document.addEventListener('DOMContentLoaded', function() {

    // Check if the user is on the Student Dashboard page (has the date display)
    if (document.getElementById('currentDate')) {
        displayCurrentDate();
        loadDashboardStats();
        loadUpcomingEvents();
        loadRecentActivity();
        loadSuggestedEvents();
    }

    // Check if the user is on the My Registrations page (has the registrations list)
    if (document.getElementById('registrationsList')) {
        loadRegistrationsData('all');
        setupFilterTabs();
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

// Update the 4 stat card categories (hard coded for now)
function loadDashboardStats() {
    var totalElement = document.getElementById('totalRegistered');
    var upcomingElement = document.getElementById('upcomingEvents');
    var attendedElement = document.getElementById('attendedEvents');
    var cancelledElement = document.getElementById('cancelledEvents');

    if (totalElement) totalElement.textContent = 6;
    if (upcomingElement) upcomingElement.textContent = 4;
    if (attendedElement) attendedElement.textContent = 2;
    if (cancelledElement) cancelledElement.textContent = 0;
}

// "Upcoming Events" cards on the dashboard (hard coded for now)
function loadUpcomingEvents() {

    //this connects to the student-dashboard.html file by calling the id upcomingEventsGrid
    var grid = document.getElementById('upcomingEventsGrid');
    if (!grid) return;

    var events = [
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

    // Build HTML for each event card, as a string, then inject into student-dashboard.html which may call this function
    var html = '';
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        html = html + `
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
    }
    grid.innerHTML = html;
}

// "Recent Activity" list on the dashboard (hard coded for now)
function loadRecentActivity() {

    //this connects to the student-dashboard.html file by calling the id recentActivity
    var list = document.getElementById('recentActivity');
    if (!list) return;

    var activities = [
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

    // Build HTML for each event card, as a string, then inject into student-dashboard.html which may call this function
    var html = '';
    for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];
        html = html + `
        <li>
        <span class="activity-dot dot-${activity.dot}"></span>
        <div>
        <p class="activity-title">${activity.title}</p>
        <p class="activity-time">${activity.time}</p>
        </div>
        </li>
        `;
    }
    list.innerHTML = html;
}

// "Suggested For You" list on the dashboard (hard coded for now)
function loadSuggestedEvents() {

    //this connects to the student-dashboard.html file by calling the id suggestedEvents
    var container = document.getElementById('suggestedEvents');
    if (!container) return;

    var suggestions = [
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

    // Build HTML for each event card, as a string, then inject into student-dashboard.html which may call this function
    var html = '';
    for (var i = 0; i < suggestions.length; i++) {
        var suggestion = suggestions[i];
        html = html + `
        <div class="suggestion-item">
        <div class="suggestion-info">
        <p class="suggestion-title">${suggestion.title}</p>
        <p class="suggestion-meta">📅 ${suggestion.date} • 📍 ${suggestion.location}</p>
        </div>
        <a href="event-details.html" class="suggestion-link">View →</a>
        </div>
        `;
    }
    container.innerHTML = html;
}


// ========================================
// MY-REGISTRATION FUNCTIONS
// ========================================

// Load registrations (hard coded for now) and applies the selected filter
function loadRegistrationsData(filter) {
    var list = document.getElementById('registrationsList');
    var countDisplay = document.getElementById('registrationCount');
    if (!list) return;

    var allRegistrations = [
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

    // Filter the data based on which tab was clicked
    var filtered = [];
    if (filter === 'all') {
        filtered = allRegistrations;
    } else if (filter === 'upcoming') {
        for (var i = 0; i < allRegistrations.length; i++) {
            if (allRegistrations[i].status === 'upcoming') {
                filtered.push(allRegistrations[i]);
            }
        }
    } else if (filter === 'past') {
        for (var i = 0; i < allRegistrations.length; i++) {
            if (allRegistrations[i].status === 'past') {
                filtered.push(allRegistrations[i]);
            }
        }
    } else if (filter === 'cancelled') {
        for (var i = 0; i < allRegistrations.length; i++) {
            if (allRegistrations[i].status === 'cancelled') {
                filtered.push(allRegistrations[i]);
            }
        }
    }

    // Update the registration count
    if (countDisplay) {
        countDisplay.textContent = filtered.length + ' registrations';
    }

    // Show the empty state if no registrations match the filter
    if (filtered.length === 0) {
        list.innerHTML = `
        <div class="empty-state">
        <p>No registrations found</p>
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
        // Build HTML for each registration card
        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            var reg = filtered[i];

            // Different buttons for upcoming events vs past events
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

            // Build HTML for each event card, as a string, then inject into my-registration.html which may call this function
            html = html + `
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
        }
        list.innerHTML = html;
    }
}

// Set up the filter tabs so that clicking them will filter the list
function setupFilterTabs() {
    var tabs = document.querySelectorAll('.filter-tab');

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function() {

            // Remove 'active' class from all tabs
            var allTabs = document.querySelectorAll('.filter-tab');
            for (var j = 0; j < allTabs.length; j++) {
                allTabs[j].classList.remove('active');
            }

            // Add 'active' class to the clicked tab
            this.classList.add('active');

            // Get the filter value and reload the list
            var filter = this.getAttribute('data-filter');
            loadRegistrationsData(filter);
        });
    }
}


// ========================================
// USER ACTION FUNCTIONS
// ========================================

// Cancel registration (ask for confirmation first)
function cancelRegistration(registrationId) {
    var confirmCancel = confirm(
        'Are you sure you want to cancel this registration?\n' +
        'This action cannot be undone.'
    );

    if (confirmCancel) {
        alert('Registration cancelled successfully!');

        // Reload the registrations list to show the update
        var activeTab = document.querySelector('.filter-tab.active');
        var filter = 'all';
        if (activeTab) {
            filter = activeTab.getAttribute('data-filter');
        }
        loadRegistrationsData(filter);
    }
}

// Go to the event details page
function viewEventDetails(eventId) {
    window.location.href = 'event-details.html?id=' + eventId;
}

// ========================================
// EVENTS PAGE SEARCH
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('eventSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterEventCards(this.value);
        });
    }
});

function filterEventCards(query) {
    var lowerQuery = query.toLowerCase();
    var cardLinks = document.querySelectorAll('#eventCardsContainer > a');

    for (var i = 0; i < cardLinks.length; i++) {
        var titleElement = cardLinks[i].querySelector('h4');
        var title = titleElement ? titleElement.textContent.toLowerCase() : '';

        if (title.indexOf(lowerQuery) !== -1) {
            cardLinks[i].style.display = '';
        } else {
            cardLinks[i].style.display = 'none';
        }
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
            // Logged in — show Dashboard/My Registrations, show Logout
            for (var i = 0; i < authOnlyLinks.length; i++) {
                authOnlyLinks[i].classList.remove('auth-only');
            }
            if (actionBtn) {
                actionBtn.textContent = 'Logout';
                actionBtn.href = '#';
                actionBtn.onclick = async function(e) {
                    e.preventDefault();
                    await fetch('/api/auth/logout');
                    window.location.href = 'login.html';
                };
            }
        } else {
            // Not logged in — make sure links are hidden, show Login
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