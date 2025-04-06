package db

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/your-username/task-manager/internal/models"
)

// User repository methods
func (db *DB) CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (id, name, email, password, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	now := time.Now()
	_, err := db.Exec(query, user.ID, user.Name, user.Email, user.Password, now, now)
	return err
}

func (db *DB) GetUserByEmail(email string) (*models.User, error) {
	user := &models.User{}
	err := db.QueryRow("SELECT * FROM users WHERE email = ?", email).Scan(
		&user.ID, &user.Name, &user.Email, &user.Password, &user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}

// Profile repository methods
func (db *DB) UpsertProfile(profile *models.Profile) error {
	query := `
		INSERT INTO profiles (id, user_id, bio, phone, avatar_url, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			bio = ?,
			phone = ?,
			avatar_url = ?,
			updated_at = ?
	`
	now := time.Now()
	_, err := db.Exec(query,
		profile.ID, profile.UserID, profile.Bio, profile.Phone, profile.AvatarURL, now, now,
		profile.Bio, profile.Phone, profile.AvatarURL, now,
	)
	return err
}

func (db *DB) GetProfileByUserID(userID string) (*models.Profile, error) {
	profile := &models.Profile{}
	err := db.QueryRow("SELECT * FROM profiles WHERE user_id = ?", userID).Scan(
		&profile.ID, &profile.UserID, &profile.Bio, &profile.Phone,
		&profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return profile, err
}

// Task repository methods
func (db *DB) CreateTask(task *models.Task) error {
	query := `
		INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, completed, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	now := time.Now()
	_, err := db.Exec(query,
		task.ID, task.UserID, task.Title, task.Description, task.Status,
		task.Priority, task.DueDate, task.Completed, now, now,
	)
	return err
}

func (db *DB) GetTasksByUserID(userID string) ([]models.Task, error) {
	rows, err := db.Query("SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		err := rows.Scan(
			&task.ID, &task.UserID, &task.Title, &task.Description, &task.Status,
			&task.Priority, &task.DueDate, &task.Completed, &task.CreatedAt, &task.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	return tasks, nil
}

func (db *DB) UpdateTask(task *models.Task) error {
	query := `
		UPDATE tasks
		SET title = ?, description = ?, status = ?, priority = ?,
			due_date = ?, completed = ?, updated_at = ?
		WHERE id = ? AND user_id = ?
	`
	result, err := db.Exec(query,
		task.Title, task.Description, task.Status, task.Priority,
		task.DueDate, task.Completed, time.Now(),
		task.ID, task.UserID,
	)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("task not found")
	}
	return nil
}

// Habit repository methods
func (db *DB) CreateHabit(habit *models.Habit) error {
	query := `
		INSERT INTO habits (id, user_id, name, goal, frequency, streak, longest_streak, completed, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	now := time.Now()
	_, err := db.Exec(query,
		habit.ID, habit.UserID, habit.Name, habit.Goal, habit.Frequency,
		habit.Streak, habit.LongestStreak, habit.Completed, now, now,
	)
	return err
}

func (db *DB) GetHabitsByUserID(userID string) ([]models.Habit, error) {
	rows, err := db.Query("SELECT * FROM habits WHERE user_id = ?", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var habits []models.Habit
	for rows.Next() {
		var habit models.Habit
		err := rows.Scan(
			&habit.ID, &habit.UserID, &habit.Name, &habit.Goal, &habit.Frequency,
			&habit.Streak, &habit.LongestStreak, &habit.Completed,
			&habit.CreatedAt, &habit.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		habits = append(habits, habit)
	}
	return habits, nil
}

func (db *DB) UpdateHabit(habit *models.Habit) error {
	query := `
		UPDATE habits
		SET name = ?, goal = ?, frequency = ?, streak = ?,
			longest_streak = ?, completed = ?, updated_at = ?
		WHERE id = ? AND user_id = ?
	`
	result, err := db.Exec(query,
		habit.Name, habit.Goal, habit.Frequency, habit.Streak,
		habit.LongestStreak, habit.Completed, time.Now(),
		habit.ID, habit.UserID,
	)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("habit not found")
	}
	return nil
}

// Notification repository methods
func (db *DB) CreateNotification(notification *models.Notification) error {
	query := `
		INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`
	_, err := db.Exec(query,
		notification.ID, notification.UserID, notification.Type,
		notification.Title, notification.Message, notification.Read,
		time.Now(),
	)
	return err
}

func (db *DB) GetNotificationsByUserID(userID string) ([]models.Notification, error) {
	rows, err := db.Query(`
		SELECT * FROM notifications 
		WHERE user_id = ? 
		ORDER BY created_at DESC 
		LIMIT 50
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var notification models.Notification
		err := rows.Scan(
			&notification.ID, &notification.UserID, &notification.Type,
			&notification.Title, &notification.Message, &notification.Read,
			&notification.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}
	return notifications, nil
}

func (db *DB) MarkNotificationAsRead(id string, userID string) error {
	result, err := db.Exec(
		"UPDATE notifications SET read = TRUE WHERE id = ? AND user_id = ?",
		id, userID,
	)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("notification not found")
	}
	return nil
}

func (db *DB) MarkAllNotificationsAsRead(userID string) error {
	_, err := db.Exec(
		"UPDATE notifications SET read = TRUE WHERE user_id = ? AND read = FALSE",
		userID,
	)
	return err
}

func (db *DB) DeleteNotification(id string, userID string) error {
	result, err := db.Exec(
		"DELETE FROM notifications WHERE id = ? AND user_id = ?",
		id, userID,
	)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("notification not found")
	}
	return nil
} 