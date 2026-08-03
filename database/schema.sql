-- ============================================================
-- Smart Campus Event Planner — Database Schema
-- Deliverable 2
-- ============================================================
-- Run this once to set up all tables needed by the app.
-- Matches Section 8 of the project spec (Users, Events,
-- Registrations, Categories) and the fields actually used
-- across index.html, events.html, event-details.html,
-- my-registration.html, student-dashboard.html,
-- admin-dashboard.html, create-event.html, manage-events.html.
-- ============================================================

CREATE DATABASE IF NOT EXISTS campus_event_planner;
USE campus_event_planner;

-- ============================================================
-- Users table
-- Powers: register.html, login.html
-- ============================================================
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Categories table
-- Powers: category dropdown on create-event.html
-- Section 4 says categories can be hard-coded in D1 but must
-- come from the database in D2.
-- ============================================================
CREATE TABLE Categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
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
-- Powers: events.html, event-details.html, create-event.html,
-- manage-events.html, admin-dashboard.html
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
-- Powers: my-registration.html, student-dashboard.html,
-- event-details.html (register button)
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
    -- (Section 3.1 / Section 7.3 / Section 9 all require this)
    UNIQUE KEY unique_registration (user_id, event_id)
);

-- ============================================================
-- Helpful indexes for common lookups
-- ============================================================
CREATE INDEX idx_events_status ON Events(status);
CREATE INDEX idx_events_category ON Events(category_id);
CREATE INDEX idx_registrations_user ON Registrations(user_id);
CREATE INDEX idx_registrations_event ON Registrations(event_id);