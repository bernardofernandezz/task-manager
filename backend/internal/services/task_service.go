package services

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/your-username/task-manager/internal/db"
	"github.com/your-username/task-manager/internal/models"
)

type TaskService struct {
	db *db.DB
}

func NewTaskService(db *db.DB) *TaskService {
	return &TaskService{db: db}
}

func (s *TaskService) CreateTask(userID string, title, description, status, priority string, dueDate time.Time) (*models.Task, error) {
	task := &models.Task{
		ID:          uuid.New().String(),
		UserID:      userID,
		Title:       title,
		Description: description,
		Status:      status,
		Priority:    priority,
		DueDate:     dueDate,
		Completed:   false,
	}

	if err := s.db.CreateTask(task); err != nil {
		return nil, fmt.Errorf("error creating task: %v", err)
	}

	// Create notification for task creation
	notification := &models.Notification{
		ID:      uuid.New().String(),
		UserID:  userID,
		Type:    "task_created",
		Title:   "New Task Created",
		Message: fmt.Sprintf("Task '%s' has been created", title),
	}
	if err := s.db.CreateNotification(notification); err != nil {
		// Log error but don't fail the task creation
		fmt.Printf("error creating notification: %v\n", err)
	}

	return task, nil
}

func (s *TaskService) GetUserTasks(userID string) ([]models.Task, error) {
	tasks, err := s.db.GetTasksByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("error getting tasks: %v", err)
	}
	return tasks, nil
}

func (s *TaskService) UpdateTask(userID string, task *models.Task) error {
	// Verify task belongs to user
	if task.UserID != userID {
		return fmt.Errorf("unauthorized: task does not belong to user")
	}

	if err := s.db.UpdateTask(task); err != nil {
		return fmt.Errorf("error updating task: %v", err)
	}

	// Create notification for task completion if task was marked as completed
	if task.Completed {
		notification := &models.Notification{
			ID:      uuid.New().String(),
			UserID:  userID,
			Type:    "task_completed",
			Title:   "Task Completed",
			Message: fmt.Sprintf("Task '%s' has been marked as completed", task.Title),
		}
		if err := s.db.CreateNotification(notification); err != nil {
			// Log error but don't fail the task update
			fmt.Printf("error creating notification: %v\n", err)
		}
	}

	return nil
}

func (s *TaskService) CheckOverdueTasks(userID string) error {
	tasks, err := s.db.GetTasksByUserID(userID)
	if err != nil {
		return fmt.Errorf("error getting tasks: %v", err)
	}

	now := time.Now()
	for _, task := range tasks {
		if !task.Completed && task.DueDate.Before(now) {
			notification := &models.Notification{
				ID:      uuid.New().String(),
				UserID:  userID,
				Type:    "task_overdue",
				Title:   "Task Overdue",
				Message: fmt.Sprintf("Task '%s' is overdue", task.Title),
			}
			if err := s.db.CreateNotification(notification); err != nil {
				// Log error but continue checking other tasks
				fmt.Printf("error creating notification: %v\n", err)
			}
		}
	}

	return nil
}

func (s *TaskService) GetTaskStats(userID string) (map[string]int, error) {
	tasks, err := s.db.GetTasksByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("error getting tasks: %v", err)
	}

	now := time.Now()
	stats := map[string]int{
		"total":      len(tasks),
		"completed":  0,
		"overdue":    0,
		"today":      0,
		"this_week": 0,
	}

	for _, task := range tasks {
		if task.Completed {
			stats["completed"]++
		}
		if !task.Completed && task.DueDate.Before(now) {
			stats["overdue"]++
		}
		if task.DueDate.Year() == now.Year() && task.DueDate.YearDay() == now.YearDay() {
			stats["today"]++
		}
		if task.DueDate.After(now) && task.DueDate.Before(now.AddDate(0, 0, 7)) {
			stats["this_week"]++
		}
	}

	return stats, nil
} 