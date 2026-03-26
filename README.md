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

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect the GitHub repository
3. Settings:
   - **Root directory:** (leave empty / repo root)
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
4. Environment variables:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a random secret string
   - `FRONTEND_URL` — your Vercel deployment URL (e.g. `https://miriyam-studio.vercel.app`)
   - `PORT` — `5501`

### Frontend on Vercel

1. Import the repository on [vercel.com](https://vercel.com)
2. Settings:
   - **Root directory:** `frontend`
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Environment variables:
   - `VITE_API_URL` — your Render service URL (e.g. `https://miriyam-studio.onrender.com`)

### Post-deployment

After both services are live, update `FRONTEND_URL` on Render to match the actual Vercel domain so CORS works correctly.

## API Endpoints

All `/cards` routes require `Authorization: Bearer <token>` header.

| Method   | Path             | Description              |
| -------- | ---------------- | ------------------------ |
| POST     | /auth/register   | Register a new user      |
| POST     | /auth/login      | Login, returns JWT       |
| GET      | /cards           | Get user's cards         |
| POST     | /cards           | Create a new card        |
| PATCH    | /cards/:id       | Update card checkboxes   |
| DELETE   | /cards/:id       | Delete a card            |

## Docker (optional)

```bash
docker build -t miriyam-studio .
docker run -d -p 5501:5501 --env-file .env --name miriyam-studio miriyam-studio
```

## Notes

- Do NOT commit `.env` files (they are listed in `.gitignore`)
- JWT tokens expire after 7 days
- Each user only sees their own cards
