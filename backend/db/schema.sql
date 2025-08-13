CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_rsvped BOOLEAN DEFAULT false,
    is_favorited BOOLEAN DEFAULT false,
    image_url VARCHAR(255),
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    categories VARCHAR(255)[] NOT NULL,
    organizer VARCHAR(255) NOT NULL
);
