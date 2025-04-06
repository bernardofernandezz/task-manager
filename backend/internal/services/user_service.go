package services

import (
	"database/sql"
	"errors"
	"time"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	db *sql.DB
}

type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	Bio       string    `json:"bio"`
	Phone     string    `json:"phone"`
	AvatarURL string    `json:"avatar_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) CreateUser(user *User) error {
	// Check if user already exists
	var exists bool
	err := s.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)", user.Email).Scan(&exists)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Set timestamps
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	// Insert user
	query := `
		INSERT INTO users (id, name, email, password, bio, phone, avatar_url, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err = s.db.Exec(query,
		user.ID,
		user.Name,
		user.Email,
		string(hashedPassword),
		user.Bio,
		user.Phone,
		user.AvatarURL,
		user.CreatedAt,
		user.UpdatedAt,
	)
	return err
}

func (s *UserService) GetUserByEmail(email string) (*User, error) {
	user := &User{}
	query := `
		SELECT id, name, email, password, bio, phone, avatar_url, created_at, updated_at
		FROM users WHERE email = ?
	`
	err := s.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Bio,
		&user.Phone,
		&user.AvatarURL,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) ValidateCredentials(email, password string) (*User, error) {
	user, err := s.GetUserByEmail(email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

func (s *UserService) UpdateUser(user *User) error {
	user.UpdatedAt = time.Now()
	query := `
		UPDATE users
		SET name = ?, bio = ?, phone = ?, avatar_url = ?, updated_at = ?
		WHERE id = ?
	`
	_, err := s.db.Exec(query,
		user.Name,
		user.Bio,
		user.Phone,
		user.AvatarURL,
		user.UpdatedAt,
		user.ID,
	)
	return err
}

func (s *UserService) DeleteUser(id string) error {
	_, err := s.db.Exec("DELETE FROM users WHERE id = ?", id)
	return err
} 