# Miriyam Studio

Multi-user card management app for tracking studio time sessions.

## Project Structure

```
miriyam-studio/
  server.js          # Express API (auth + cards)
  package.json
  .env               # MONGO_URI, JWT_SECRET, FRONTEND_URL, PORT
  frontend/          # Vite vanilla JS app
    index.html       # Dashboard (protected)
    login.html       # Login page
    register.html    # Registration page
    src/
      app.js         # Card management logic
      auth.js        # Token storage, apiFetch wrapper
      login.js       # Login form handler
      register.js    # Register form handler
      style.css      # All styles
    public/
      2222.jpg        # Background image
```

## Local Development

### Backend

```bash
npm install
# Create .env with: MONGO_URI, JWT_SECRET, FRONTEND_URL=http://localhost:5173, PORT=5501
node server.js
```

### Frontend

```bash
cd frontend
npm install
# Create frontend/.env with: VITE_API_URL=http://localhost:5501
npm run dev
```

Open `http://localhost:5173` in the browser.

## Deployment

### Backend on Render

https://miriyam-studio.onrender.com

### Frontend on Render

https://miriyam-studio-front.onrender.com

## Docker

```bash
docker build -t miriyam-studio .
docker run -d -p 5501:5501 --env-file .env --name miriyam-studio miriyam-studio
```
