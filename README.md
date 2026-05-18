# TaskApp — Full Setup Guide

A simple task-management web app with a **PHP/MySQL backend** and an **HTML + CSS + JavaScript frontend**.

---

## File Structure

```
htdocs/taskapp/          ← Place this entire folder inside XAMPP's htdocs
│
├── API/                 ← Backend (your original PHP files, unchanged)
│   ├── db.php           ← Database connection
│   ├── auth.php         ← Token authentication middleware
│   ├── login.php        ← POST  /API/login.php
│   ├── register.php     ← POST  /API/register.php
│   ├── logout.php       ← POST  /API/logout.php
│   ├── add_task.php     ← POST  /API/add_task.php
│   └── get_task.php     ← GET   /API/get_task.php
│
├── frontend/            ← Frontend files
│   ├── index.html       ← Main app (single page)
│   ├── style.css        ← All styles
│   └── app.js           ← All JavaScript logic
│
└── setup.sql            ← Run once in phpMyAdmin to create DB + tables
```

---

## Prerequisites

- **XAMPP** (includes Apache + MySQL + phpMyAdmin)  
  Download: https://www.apachefriends.org/download.html
- A modern web browser (Chrome, Firefox, Edge)

---

## Step 1 — Install XAMPP & Start Services

1. Install XAMPP and launch the **XAMPP Control Panel**.
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.
4. Both status lights should turn green.

---

## Step 2 — Place Project Files

1. Open your XAMPP installation folder (default: `C:\xampp` on Windows, `/Applications/XAMPP` on Mac).
2. Navigate to `htdocs/`.
3. Create a new folder called `taskapp`.
4. Copy your files so the structure matches exactly:

```
C:\xampp\htdocs\taskapp\
    API\
        db.php
        auth.php
        login.php
        register.php
        logout.php
        add_task.php
        get_task.php
    frontend\
        index.html
        style.css
        app.js
    setup.sql
```

---

## Step 3 — Set Up the Database

1. Open your browser and go to: **http://localhost/phpmyadmin**
2. Click the **SQL** tab at the top.
3. Open `setup.sql` in a text editor, copy all the content.
4. Paste it into the SQL text box in phpMyAdmin.
5. Click **Go**.

You should see a success message. The `task_app` database will appear in the left sidebar with two tables: `users` and `tasks`.

**Alternative (MySQL CLI):**
```bash
mysql -u root -p < C:\xampp\htdocs\taskapp\setup.sql
```

---

## Step 4 — Verify the Database Connection

Open `API/db.php` and confirm these match your XAMPP settings:

```php
$conn = mysqli_connect("localhost", "root", "", "task_app");
//                      ^host        ^user   ^pass  ^db name
```

- **Default XAMPP**: host=`localhost`, user=`root`, password=`""` (empty), db=`task_app`
- If you set a MySQL root password, add it in the third argument.

---

## Step 5 — Open the App

Visit in your browser:

```
http://localhost/taskapp/frontend/index.html
```

You should see the TaskApp login screen.

---

## Step 6 — Test the Full System

### ✅ Checklist

| Test | Expected Result |
|------|----------------|
| Open `http://localhost/taskapp/frontend/index.html` | Login screen appears |
| Click **Register** tab, create an account | "Account created!" message |
| Sign in with that account | Dashboard appears |
| Click **New Task**, enter text, click **Add Task** | Task appears in the list |
| Refresh the page | Tasks are still there (persisted in DB) |
| Click the logout button (→ icon) | Returns to login screen |
| Sign in again | Tasks are still there |

### 🔍 Verify via phpMyAdmin

1. Go to `http://localhost/phpmyadmin`
2. Click **task_app** → **users** → **Browse** — your user should appear.
3. Click **tasks** → **Browse** — your tasks should appear.

---

## How the Connection Works

```
Browser (frontend/index.html)
        │
        │  fetch('/API/login.php')   ← HTTP request with JSON body
        ▼
Apache Web Server (XAMPP)
        │
        │  runs PHP
        ▼
PHP files (API/*.php)
        │
        │  mysqli_connect()
        ▼
MySQL Database (task_app)
        │
        │  returns rows
        ▼
PHP encodes as JSON → Apache sends response → JavaScript parses → UI updates
```

**Authentication flow:**
1. User logs in → PHP generates a random token, stores it in `users.token` column.
2. Token is saved in the browser's `localStorage`.
3. Every API request sends the token in the `Authorization` header.
4. `auth.php` checks the token against the database before allowing access.
5. On logout, the token is set to `NULL` in the database.

---

## Troubleshooting

### "Could not reach server" in the browser
- Make sure **Apache** and **MySQL** are running in XAMPP Control Panel.
- Check that your files are inside `htdocs/taskapp/`, not somewhere else.
- Open browser DevTools (F12) → Network tab → look at the failed request for the exact error.

### Blank page or 404 on `index.html`
- Confirm the URL is exactly: `http://localhost/taskapp/frontend/index.html`
- Check the folder name is `taskapp` (not `taskapp-main` or `API`).

### "DB connection failed"
- MySQL is not running — start it in XAMPP.
- Password mismatch — check `API/db.php` matches your MySQL root password.
- Database not created — re-run `setup.sql` in phpMyAdmin.

### Tasks not saving / "invalid token"
- Your session token may have expired or the DB token was cleared.
- Sign out and sign back in to get a fresh token.

### phpMyAdmin not loading
- Make sure both **Apache** and **MySQL** are started in XAMPP.
- Try: `http://127.0.0.1/phpmyadmin`

---

## API Reference

| Method | Endpoint | Auth Required | Body / Response |
|--------|----------|:---:|---|
| POST | `/API/register.php` | No | `{username, password}` → `{status:"success"}` |
| POST | `/API/login.php` | No | `{username, password}` → `{status:"success", token:"..."}` |
| POST | `/API/logout.php` | Yes | → `{status:"success", message:"Logged out successfully"}` |
| POST | `/API/add_task.php` | Yes | `{task:"..."}` → `{status:"task added"}` |
| GET  | `/API/get_task.php` | Yes | → `[{id, user_id, task, created_at}, ...]` |

**Auth header:** `Authorization: <token>`

---

## Security Notes

The backend uses plain string interpolation in SQL queries which is vulnerable to SQL injection. For a production app, switch to **prepared statements**. The frontend provided here is safe (it escapes HTML before rendering). This project is intended for learning/local use.
