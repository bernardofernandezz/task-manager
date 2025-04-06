package services

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/your-username/task-manager/internal/db"
	"github.com/your-username/task-manager/internal/models"
)

type HabitService struct {
	db *db.DB
}

func NewHabitService(db *db.DB) *HabitService {
	return &HabitService{db: db}
}

func (s *HabitService) CreateHabit(userID string, name, goal, frequency string) (*models.Habit, error) {
	habit := &models.Habit{
		ID:        uuid.New().String(),
		UserID:    userID,
		Name:      name,
		Goal:      goal,
		Frequency: frequency,
	}

	if err := s.db.CreateHabit(habit); err != nil {
		return nil, fmt.Errorf("error creating habit: %v", err)
	}

	notification := &models.Notification{
		ID:      uuid.New().String(),
		UserID:  userID,
		Type:    "habit_created",
		Title:   "New Habit Created",
		Message: fmt.Sprintf("Habit '%s' has been created", name),
	}
	if err := s.db.CreateNotification(notification); err != nil {
		fmt.Printf("error creating notification: %v\n", err)
	}

	return habit, nil
}

func (s *HabitService) GetUserHabits(userID string) ([]models.Habit, error) {
	habits, err := s.db.GetHabitsByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("error getting habits: %v", err)
	}
	return habits, nil
}

func (s *HabitService) UpdateHabit(userID string, habit *models.Habit) error {
	if habit.UserID != userID {
		return fmt.Errorf("unauthorized: habit does not belong to user")
	}

	// Get the current habit state to check for streak changes
	currentHabit, err := s.getHabit(habit.ID, userID)
	if err != nil {
		return err
	}

	// Update streak if habit was marked as completed
	if !currentHabit.Completed && habit.Completed {
		habit.Streak++
		if habit.Streak > habit.LongestStreak {
			habit.LongestStreak = habit.Streak

			// Create notification for new streak record
			notification := &models.Notification{
				ID:      uuid.New().String(),
				UserID:  userID,
				Type:    "streak_record",
				Title:   "New Streak Record!",
				Message: fmt.Sprintf("You've achieved a %d day streak with habit '%s'!", habit.LongestStreak, habit.Name),
			}
			if err := s.db.CreateNotification(notification); err != nil {
				fmt.Printf("error creating notification: %v\n", err)
			}
		}
	} else if currentHabit.Completed && !habit.Completed {
		// If marking as uncompleted, decrease streak
		habit.Streak--
	}

	if err := s.db.UpdateHabit(habit); err != nil {
		return fmt.Errorf("error updating habit: %v", err)
	}

	return nil
}

func (s *HabitService) getHabit(id, userID string) (*models.Habit, error) {
	habits, err := s.db.GetHabitsByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("error getting habits: %v", err)
	}

	for _, h := range habits {
		if h.ID == id {
			return &h, nil
		}
	}

	return nil, fmt.Errorf("habit not found")
}

func (s *HabitService) CheckStreaks(userID string) error {
	habits, err := s.db.GetHabitsByUserID(userID)
	if err != nil {
		return fmt.Errorf("error getting habits: %v", err)
	}

	for _, habit := range habits {
		if habit.Streak >= 3 && habit.Streak < 7 {
			notification := &models.Notification{
				ID:      uuid.New().String(),
				UserID:  userID,
				Type:    "streak_milestone",
				Title:   "3-Day Streak!",
				Message: fmt.Sprintf("You've maintained '%s' for 3 days! Keep it up!", habit.Name),
			}
			if err := s.db.CreateNotification(notification); err != nil {
				fmt.Printf("error creating notification: %v\n", err)
			}
		} else if habit.Streak >= 7 {
			notification := &models.Notification{
				ID:      uuid.New().String(),
				UserID:  userID,
				Type:    "streak_milestone",
				Title:   "7-Day Streak!",
				Message: fmt.Sprintf("Amazing! You've maintained '%s' for a week!", habit.Name),
			}
			if err := s.db.CreateNotification(notification); err != nil {
				fmt.Printf("error creating notification: %v\n", err)
			}
		}
	}

	return nil
}

func (s *HabitService) GetHabitStats(userID string) (map[string]interface{}, error) {
	habits, err := s.db.GetHabitsByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("error getting habits: %v", err)
	}

	stats := map[string]interface{}{
		"total_habits":     len(habits),
		"completed_habits": 0,
		"total_streaks":    0,
		"longest_streak":   0,
		"frequency_breakdown": map[string]int{
			"daily":   0,
			"weekly":  0,
			"monthly": 0,
		},
	}

	for _, habit := range habits {
		if habit.Completed {
			stats["completed_habits"] = stats["completed_habits"].(int) + 1
		}
		stats["total_streaks"] = stats["total_streaks"].(int) + habit.Streak
		if habit.LongestStreak > stats["longest_streak"].(int) {
			stats["longest_streak"] = habit.LongestStreak
		}
		stats["frequency_breakdown"].(map[string]int)[habit.Frequency]++
	}

	return stats, nil
} 