package db

import (
	"database/sql"
	"os"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

func New(dbPath string) (*sql.DB, error) {
	// Check if we're in production (Railway provides DATABASE_URL)
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL != "" {
		// Use PostgreSQL in production
		return sql.Open("postgres", dbURL)
	}

	// Use SQLite in development
	return sql.Open("sqlite3", dbPath)
}

func Migrate(db *sql.DB) error {
	// Create users table
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			bio TEXT,
			phone TEXT,
			avatar_url TEXT,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL
		)
	`)
	if err != nil {
		return err
	}

	// Create tasks table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS tasks (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT,
			due_date TIMESTAMP,
			completed BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)
	if err != nil {
		return err
	}

	// Create habits table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS habits (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			name TEXT NOT NULL,
			frequency TEXT NOT NULL,
			goal TEXT NOT NULL,
			streak INTEGER DEFAULT 0,
			longest_streak INTEGER DEFAULT 0,
			completed BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)
	if err != nil {
		return err
	}

	// Create notifications table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS notifications (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			title TEXT NOT NULL,
			message TEXT NOT NULL,
			read BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP NOT NULL,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)
	return err
} 