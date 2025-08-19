# Jborg Job Finder (MVP)

Static front-end prototype of a job board for **jborg intl company**, built with **HTML, CSS, and vanilla JS**.  
Data is stored in `localStorage` for demo purposes. No real uploads or authentication.

## Pages
- `index.html` – Landing + featured jobs + search.
- `jobs.html` – Listings with search, filters, and pagination.
- `job-details.html` – Details + application form (stores application metadata locally).
- `register.html` / `login.html` – Basic auth (localStorage).
- `employer-dashboard.html` – Post and manage jobs (requires employer account).

## How to run
Just open `index.html` in a browser. For the best experience, use a local static server (e.g., VS Code Live Server).

## Notes
- Passwords are stored as plain text in localStorage for demo only. Do **not** use in production.
- File uploads are simulated (name only) in this static prototype.
- Replace `assets/logo.jpg` with your final logo if needed.
