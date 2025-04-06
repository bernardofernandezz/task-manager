package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/your-username/task-manager/internal/db"
	"github.com/your-username/task-manager/internal/handlers"
	"github.com/your-username/task-manager/internal/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Initialize database
	database, err := db.New("task_manager.db")
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Run migrations
	if err := database.Migrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize services
	userService := services.NewUserService(database)
	taskService := services.NewTaskService(database)
	habitService := services.NewHabitService(database)

	// Initialize router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:          12 * time.Hour,
	}))

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userService)
	h := handlers.NewHandler(taskService, habitService)

	// API routes
	api := router.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/signup", userHandler.CreateUser)
			auth.POST("/login", userHandler.Login)
			auth.POST("/logout", userHandler.Logout)
		}

		// Task routes
		tasks := api.Group("/tasks")
		{
			tasks.GET("", h.GetTasks)
			tasks.POST("", h.CreateTask)
			tasks.PUT("/:id", h.UpdateTask)
			tasks.DELETE("/:id", h.DeleteTask)
		}

		// Habit routes
		habits := api.Group("/habits")
		{
			habits.GET("", h.GetHabits)
			habits.POST("", h.CreateHabit)
			habits.PUT("/:id", h.UpdateHabit)
			habits.DELETE("/:id", h.DeleteHabit)
			habits.GET("/stats", h.GetHabitStats)
		}

		// Profile routes
		profile := api.Group("/profile")
		{
			profile.GET("", h.GetProfile)
			profile.PUT("", h.UpdateProfile)
			profile.POST("/avatar", h.UpdateAvatar)
		}

		// Notification routes
		notifications := api.Group("/notifications")
		{
			notifications.GET("", h.GetNotifications)
			notifications.PUT("/:id/read", h.MarkNotificationAsRead)
			notifications.PUT("/read-all", h.MarkAllNotificationsAsRead)
			notifications.DELETE("/:id", h.DeleteNotification)
		}
	}

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server starting on port %s...", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
} 