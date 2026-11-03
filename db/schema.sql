-- 1. Roles Lookup Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (role_name) VALUES ('Employee'), ('Technician')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Status Lookup Table
CREATE TABLE IF NOT EXISTS statuses (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO statuses (status_name, description) VALUES
('Open', 'Ticket submitted and waiting for triage'),
('In-Progress', 'Assigned to a technician and actively being worked'),
('Resolved', 'Issue addressed and resolution notes posted')
ON CONFLICT (status_name) DO NOTHING;

-- 3. Users Table (Employees)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT
);

-- 4. Technicians Table
CREATE TABLE IF NOT EXISTS technicians (
    id SERIAL PRIMARY KEY,
    technician_name VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT
);

-- 5. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    technician_id INT REFERENCES technicians(id) ON DELETE SET NULL,
    status_id INT NOT NULL REFERENCES statuses(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    ticket_id INT NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL,
    sender_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. History / Resolution Log Table
CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    ticket_id INT NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    change_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolution_notes TEXT NOT NULL
);