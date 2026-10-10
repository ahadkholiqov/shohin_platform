# Shohin Platform

**Full-Stack Real Estate Sales & Management Platform**

**English** | [Русский](README.ru.md)

Shohin Platform is a full-stack web application designed for a residential real estate development. It combines a customer-facing property website, an apartment catalog, an interactive availability grid, and an administration panel into a single system.

The project focuses on practical real estate sales workflows, a mobile-friendly user experience, and a straightforward architecture.

It is designed for a single residential development rather than as a multi-tenant SaaS platform.

## Features

### Property Website

- **Residential complex landing page** — presents the development, construction information, gallery, and contact details.
- **Apartment catalog** — allows users to browse apartments by building block, floor, room count, price, and availability.
- **Interactive apartment chessboard** — displays apartment availability across building blocks and floors.
- **Apartment details** — presents property area, price, availability status, description, and floor plans.
- **Customer inquiries** — allows potential buyers to submit apartment-related requests.
- **Mobile-oriented interface** — prioritizes convenient browsing and navigation on smartphones.

### Administration Panel

- Create, update, and manage apartment records.
- Change apartment availability statuses.
- Review and process incoming customer inquiries.
- Upload and manage gallery images.
- Edit website settings and marketing content.
- Manage construction progress information.
- Update contact details and communication links.
- Access protected administrative API operations through token-based authentication.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, CSS |
| Backend | C#, ASP.NET Core (.NET 10) |
| Database | PostgreSQL |
| ORM | Entity Framework Core |
| API | REST, JSON |
| Tooling | npm, .NET CLI, Oxlint |

## Architecture

The application contains two main components:

**Frontend**

A React and TypeScript application that provides the public property website and administration interface.

It communicates with the backend through a REST API.

**Backend**

An ASP.NET Core application responsible for:

- Business logic.
- Database access.
- Apartment management.
- Customer applications.
- Website settings.
- Gallery operations.
- Administrative access control.
- File uploads.

**Database**

PostgreSQL is used for storing apartment records, customer inquiries, website settings, and other application data.

Entity Framework Core provides data access and schema migrations.

During development, Vite proxies `/api` and `/uploads` requests to ASP.NET Core.

A production frontend build is generated into `plaza/wwwroot/`, allowing the backend to serve the compiled application as static files.

## Project Structure

```text
shohin_platform/
├── frontend/                    # React + TypeScript application
│   ├── public/                  # Static assets
│   └── src/
│       ├── api/                 # API client and types
│       ├── components/          # Reusable UI components
│       ├── hooks/               # React hooks
│       └── pages/               # Public and admin pages
│
├── plaza/                       # ASP.NET Core backend
│   ├── Controllers/             # REST API endpoints
│   ├── DTOs/                    # Data transfer objects
│   ├── Data/                    # EF Core database context
│   ├── Models/                  # Database entities
│   ├── Migrations/              # EF Core migrations
│   ├── Middleware/              # Access control and errors
│   └── Program.cs               # Application entry point
│
└── SHOHIN_PLATFORM_CONTEXT.md   # Project context and design decisions
```

## Getting Started

### 1. Prerequisites

Install:

- Git
- .NET 10 SDK
- Node.js and npm, compatible with Vite 8
- PostgreSQL

A code editor such as Visual Studio Code or JetBrains Rider is recommended.

### 2. Clone the Repository

```bash
git clone https://github.com/ahadkholiqov/shohin_platform.git
cd shohin_platform
```

Unless otherwise specified, subsequent commands are executed from the repository root.

### 3. Configure PostgreSQL

Create a local PostgreSQL database named `shohin`.

Create a `.env` file in the repository root, alongside the `frontend/` and `plaza/` directories.

Example:

```dotenv
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/shohin
ADMIN_TOKEN=REPLACE_WITH_A_LONG_RANDOM_SECRET
```

Replace the placeholders with your PostgreSQL credentials and a strong, randomly generated administrator token.

If the database password contains special characters, URL-encode them as necessary.

**Do not commit `.env` or real credentials to Git.**

The backend loads this environment file from the parent directory of `plaza/`.

### 4. Start the Backend

Open a terminal in the repository root:

```bash
cd plaza
dotnet restore
dotnet run --launch-profile http
```

The backend runs at:

`http://localhost:5241`

EF Core migrations are applied automatically during application startup.

PostgreSQL must already be running, and the database must exist and be accessible.

### 5. Start the Frontend

Open a second terminal in the repository root:

```bash
cd frontend
npm ci
npm run dev
```

The frontend is normally available at:

`http://localhost:5173`

Vite proxies API and upload requests to the ASP.NET Core backend.

### 6. Initialize Demo Data (Optional)

For an empty database, sample apartments and website settings can be created through the protected administration endpoint.

Example using cURL:

```bash
curl -X POST http://localhost:5241/api/admin/seed -H "X-Admin-Token: YOUR_ADMIN_TOKEN"
```

Replace `YOUR_ADMIN_TOKEN` with the token configured in `.env`.

On Windows PowerShell, use `curl.exe` instead of the `curl` alias.

**Demo data is intended for local testing only.** Generated apartment details, statuses, and construction information should not be treated as real property listings.

### 7. Verify the Application

Open the frontend in your browser and inspect the following pages:

| Route | Purpose |
|---|---|
| `/` | Residential complex landing page |
| `/catalog` | Apartment catalog and filters |
| `/chessboard` | Interactive apartment availability grid |
| `/admin/login` | Administration login |

These routes use the frontend base URL, normally `http://localhost:5173`.

You can also check the public apartment API:

`http://localhost:5241/api/apartments`

A correctly running backend should return JSON.

An empty array is expected if the database does not yet contain apartments.

### 8. Build and Check

From `frontend/`:

```bash
npm ci
npm run lint
npm run build
```

From `plaza/`:

```bash
dotnet build
```

The frontend build includes TypeScript compilation checks and Vite.

Compiled frontend files are written to `plaza/wwwroot/`.

These commands perform compilation and static checks, not a complete end-to-end test suite.

## Development Status

**Independent full-stack project — under development.**

The repository contains the main customer-facing modules, administrative interfaces, REST API endpoints, database models, and EF Core migrations.

The current administration authentication model uses a shared token.

Further security review, automated testing, and deployment configuration are required before production use.

## Author

Developed by **[@ahadkholiqov](https://github.com/ahadkholiqov)**.

Independent full-stack development with React, TypeScript, ASP.NET Core, and PostgreSQL.
