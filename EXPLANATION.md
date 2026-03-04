# Manufacturers Sale System

A modern, full-stack ERP-style sales management system for manufacturing businesses. This application provides modules for stock management, order processing, invoicing, payments, delivery notes, and more.

---

## Table of Contents

- [Technologies Used](#technologies-used)
- [Backend Structure](#backend-structure)
  - [Folder Structure](#backend-folder-structure)
  - [Key Directories & Files](#backend-key-directories--files)
  - [Authentication](#backend-authentication)
- [Frontend Structure](#frontend-structure)
  - [Folder Structure](#frontend-folder-structure)
  - [Major Components & Pages](#frontend-major-components--pages)
  - [State Management](#frontend-state-management)
- [Database](#database)
  - [Technology & Configuration](#database-technology--configuration)
  - [ORM & Migrations](#database-orm--migrations)
- [How to Run the Application](#how-to-run-the-application)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Development vs Production](#development-vs-production)
  - [Required Dependencies](#required-dependencies)

---

## Technologies Used

### Backend

- **Python 3**
- **Flask** (Web framework)
- **Flask-RESTful** (REST API)
- **Flask-SQLAlchemy** (ORM)
- **Flask-Migrate** (Database migrations)
- **Flask-JWT-Extended** (Authentication)
- **Flask-CORS** (CORS support)
- **Gunicorn** (Production WSGI server)
- **psycopg2-binary** (PostgreSQL driver)
- **reportlab** (PDF generation)

### Frontend

- **React** (UI library)
- **Vite** (Build tool)
- **TypeScript** (Type safety)
- **shadcn/ui** (UI components)
- **Tailwind CSS** (Styling)
- **React Router** (Routing)
- **React Query** (Data fetching/caching)
- **Lucide-react** (Icons)
- **Zod** (Validation)
- **Other UI/utility libraries** (see `package.json`)

---

## Backend Structure

### Backend Folder Structure

```
backend/
├── app.py                # Main application entry point
├── database.py           # Database and JWT setup
├── models.py             # SQLAlchemy models
├── resources/            # API resource (route) definitions
├── migrations/           # Alembic migration scripts
│   ├── versions/         # Individual migration files
│   ├── env.py            # Alembic environment config
│   └── alembic.ini       # Alembic settings
├── requirements.txt      # Python dependencies
└── README.md             # Backend-specific instructions
```

### Key Directories & Files

- **`app.py`**: Initializes Flask app, configures extensions, registers API resources.
- **`models.py`**: Contains SQLAlchemy models for users, products, orders, invoices, etc.
- **`resources/`**: Houses route handlers (controllers) for authentication, stock, orders, invoices, payments, etc.
- **`database.py`**: Sets up SQLAlchemy and JWT manager.
- **`migrations/`**: Alembic migration environment and scripts for database schema changes.
- **`requirements.txt`**: Lists all backend Python dependencies.

### Backend Authentication

- **JWT-based authentication** using `Flask-JWT-Extended`.
- Endpoints for login, signup, logout, password reset.
- JWT tokens are issued on login and required for protected endpoints.
- Tokens are stored in the frontend (localStorage).

---

## Frontend Structure

### Frontend Folder Structure

```
docs/
├── src/
│   ├── components/           # Reusable UI components (sidebar, buttons, forms, etc.)
│   ├── pages/                # Main application pages (Dashboard, Orders, Invoices, etc.)
│   ├── types/                # TypeScript type definitions
│   ├── App.jsx / App.tsx     # Main React app entry
│   └── index.html            # HTML entry point
├── package.json              # Frontend dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
└── .vite/                    # Vite build cache (auto-generated)
```

### Major Components & Pages

- **`components/`**: Sidebar, layout, UI elements, modal dialogs, etc.
- **`pages/`**: Each feature (Dashboard, Stock Management, Orders, Invoices, Payments, etc.) is a separate page.
- **`App.jsx`**: Sets up routing, authentication guards, and layout.
- **`types/`**: Shared TypeScript types for invoices, payments, etc.

### State Management

- **React Query** for server state (data fetching, caching, mutation).
- **React useState/useEffect** for local UI state.
- **Context API** may be used for sidebar and layout state.

---

## Database

### Technology & Configuration

- **Primary DB**: PostgreSQL (production) or SQLite (development fallback)
- **Connection**: Configured via `DATABASE_URL` environment variable in `app.py`
- **Default**: If `DATABASE_URL` is not set, uses SQLite at `backend/instances/manufacture.db`

### ORM & Migrations

- **ORM**: SQLAlchemy (via Flask-SQLAlchemy)
- **Migrations**: Alembic (via Flask-Migrate)
- **Migration Scripts**: Located in `backend/migrations/versions/`
- **How to Migrate**:
  - `flask db init` (once, to initialize migrations)
  - `flask db migrate -m "message"`
  - `flask db upgrade`

---

## How to Run the Application

### Backend Setup

1. **Clone the repository**
    ```sh
    git clone <YOUR_GIT_URL>
    cd manufacturers-sale-system-main/backend
    ```

2. **Create and activate a virtual environment**
    ```sh
    python3 -m venv venv
    source venv/bin/activate
    ```

3. **Install dependencies**
    ```sh
    pip install -r requirements.txt
    ```

4. **Set environment variables**
    - For Linux/macOS:
      ```sh
      export FLASK_APP=app.py
      export FLASK_ENV=development
      export PYTHONPATH=$(pwd)
      export DATABASE_URL=postgresql://user:password@localhost/dbname  # (or leave unset for SQLite)
      export JWT_SECRET_KEY=your-secret-key
      ```
    - For Windows (PowerShell):
      ```ps
      $env:FLASK_APP = "app.py"
      $env:FLASK_ENV = "development"
      $env:PYTHONPATH = (Get-Location)
      $env:DATABASE_URL = "postgresql://user:password@localhost/dbname"
      $env:JWT_SECRET_KEY = "your-secret-key"
      ```

5. **Initialize and upgrade the database**
    ```sh
    flask db upgrade
    ```

6. **Run the backend server**
    ```sh
    flask run
    ```
    Or 
    ```sh
    python app.py
    ```
    Or for production:
    ```sh
    gunicorn app:create_app
    ```

### Frontend Setup

1. **Navigate to the frontend directory**
    ```sh
    cd ../docs
    ```

2. **Install dependencies**
    ```sh
    npm install
    ```

3. **Start the development server**
    ```sh
    npm run dev
    ```

4. **Access the app**
    - Open [http://localhost:5173](http://localhost:5173) (default Vite port)

### Development vs Production

- **Development**: Use `flask run` and `npm run dev` for hot-reloading.
- **Production**:
  - Backend: Use `gunicorn` or similar WSGI server.
  - Frontend: Build static files with `npm run build` and serve with a static server or integrate with backend.

### Required Dependencies

- **Backend**: See [`backend/requirements.txt`](backend/requirements.txt)
- **Frontend**: See [`docs/package.json`](docs/package.json)

---

## Additional Notes

- **Authentication**: JWT tokens are stored in browser localStorage and sent with API requests.
- **API Endpoints**: All backend endpoints are prefixed and documented in the `resources/` directory.
- **Migrations**: Always run migrations after pulling new changes that affect the database schema.
- **Custom Domains**: Supported via Lovable platform (see project settings).

---

For further details, see the [backend/README.md](backend/README.md) and [docs/](docs/) directory.