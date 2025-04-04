# Task Manager Application

A full-stack task and habit management application built with Next.js and Go.

## Deployment Instructions

### Deploy to Fly.io (Recommended - Free)

1. Install the Fly.io CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Sign up for a [Fly.io account](https://fly.io/docs/hands-on/start-fresh/01-flyctl-intro/) (no credit card required)

3. Login to Fly.io:
   ```bash
   fly auth login
   ```

4. Launch your app:
   ```bash
   fly launch
   ```

5. Deploy your app:
   ```bash
   fly deploy
   ```

Fly.io will automatically:
- Deploy both frontend and backend
- Set up a PostgreSQL database
- Configure HTTPS
- Set up automatic deployments
- Provide a global edge network

### Alternative Deployment Options

#### Frontend Deployment (Vercel)

1. Create a [Vercel account](https://vercel.com/signup) if you don't have one
2. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
4. Deploy to Vercel:
   ```bash
   vercel
   ```
5. Follow the prompts to connect your GitHub account and deploy

#### Backend Deployment (Railway)

1. Create a [Railway account](https://railway.app/login)
2. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```
3. Login to Railway:
   ```bash
   railway login
   ```
4. Navigate to the backend directory:
   ```bash
   cd backend
   ```
5. Initialize Railway project:
   ```bash
   railway init
   ```
6. Add a PostgreSQL database:
   ```bash
   railway add
   ```
   Select PostgreSQL from the options
7. Deploy the application:
   ```bash
   railway up
   ```

### Environment Variables

The following environment variables are automatically configured on Fly.io:

- `PORT`: 8080
- `DATABASE_URL`: Automatically set by Fly.io
- `JWT_SECRET`: Set in fly.toml
- `CORS_ORIGIN`: Set in fly.toml
- `NEXT_PUBLIC_API_URL`: Automatically set to your backend URL

## Development

To run locally:

1. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Backend:
   ```bash
   cd backend
   go mod download
   go run cmd/main.go
   ```

## Features

- User authentication
- Task management
- Habit tracking
- Profile customization
- Responsive design
- Multi-language support # task-manager
