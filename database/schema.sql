-- ============================================================
-- Smart Campus Event Planner
-- ============================================================

CREATE DATABASE IF NOT EXISTS campus_event_planner;
USE campus_event_planner;

-- ============================================================
-- Users table
-- register.html, login.html
-- ============================================================
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Categories table
-- category dropdown on create-event.html
-- ============================================================
CREATE TABLE Categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(256)
);

INSERT INTO Categories (category_name, description) VALUES
    ('Academic workshops', 'Workshops focused on academic skills and coursework'),
    ('Career events', 'Career fairs, recruiting events, and networking with employers'),
    ('Club activities', 'Events run by student clubs and organizations'),
    ('Sports events', 'Athletic and recreational sports events'),
    ('Cultural events', 'Events celebrating culture, heritage, and diversity'),
    ('Volunteering events', 'Community service and volunteering opportunities'),
    ('Social events', 'General social gatherings and mixers'),
    ('Guest lectures', 'Talks and lectures from guest speakers'),
    ('Networking events', 'Events focused on professional networking'),
    ('Other', 'Anything that doesn''t fit the categories above');

-- ============================================================
-- Events table
-- Powers: events.html, event-details.html, create-event.html, manage-events.html, admin-dashboard.html
-- ============================================================
CREATE TABLE Events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category_id INT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    capacity INT NOT NULL,
    status ENUM('Open', 'Full', 'Cancelled', 'Completed', 'Disabled') NOT NULL DEFAULT 'Open',
    organizer_id INT NOT NULL,
    organizer_name VARCHAR(150),
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    FOREIGN KEY (organizer_id) REFERENCES Users(user_id)
);

-- ============================================================
-- Registrations table
-- Powers: my-registration.html, student-dashboard.html, event-details.html (register button)
-- ============================================================
CREATE TABLE Registrations (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Registered', 'Cancelled', 'Attended', 'Missed') NOT NULL DEFAULT 'Registered',
    attended BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id),

    -- A student can't register for the same event twice
    UNIQUE KEY unique_registration (user_id, event_id)
);