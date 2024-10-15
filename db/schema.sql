-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the games table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  state JSONB NOT NULL DEFAULT '{}',
  players INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a players table (if needed to track more detailed player info)
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  game_id INTEGER REFERENCES games(id),
  position INTEGER DEFAULT 0,
  money INTEGER DEFAULT 1500
);
