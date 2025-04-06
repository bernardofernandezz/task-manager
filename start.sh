#!/bin/sh

# Start backend
cd /app/backend
./main &

# Start frontend
cd /app/frontend
npm start

# Keep container running
tail -f /dev/null 