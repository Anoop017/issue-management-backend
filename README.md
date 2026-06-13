# Issue Management Platform - Backend

A minimal issue management system built with NestJS, PostgreSQL, and Drizzle ORM. Features full CRUD operations for issues and comments, AI-powered issue analysis with Google Gemini, and a comprehensive REST API with Swagger documentation.

## 🏗️ Architecture Overview

```
issue-management-backend/
├── src/
│   ├── database/
│   │   ├── db.ts                    # Database connection singleton
│   │   ├── database.module.ts       # Database module
│   │   └── schema/
│   │       ├── issues.schema.ts     # Issues table definition
│   │       └── comments.schema.ts   # Comments table definition
│   ├── modules/
│   │   ├── issues/                  # Issues module (CRUD, soft delete, bulk ops)
│   │   ├── comments/                # Comments module (discussion threads)
│   │   └── ai/                      # AI module (Gemini integration)
│   ├── app.module.ts                # Root module
│   └── main.ts                      # Application bootstrap
├── drizzle/                         # Migration files
├── scripts/                         # Database utilities
│   ├── migrate.ts                   # Run migrations
│   ├── sync-migrations.ts           # Sync migration metadata
│   └── verify-setup.ts              # Verify database setup
└── package.json
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | NestJS 11.0.1 |
| **Language** | TypeScript 5.7.3 |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM 0.45.2 |
| **API** | REST with Swagger UI |
| **Validation** | class-validator + class-transformer |
| **AI Integration** | Google Gemini API (@google/genai 2.8.0) |

## ⚙️ Prerequisites

- Node.js v18+ (tested on v24.15.0)
- PostgreSQL 12+
- npm
- Google Gemini API key (for AI analysis feature)

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/Anoop017/issue-management-backend.git
cd issue-management-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/issue_management

# PORT Number
PORT=3000

# Gemini AI Configuration (required for AI analysis feature)
GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get GEMINI_API_KEY:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste it into your `.env` file

### 4. Set up the database

The application uses **Drizzle ORM** with migrations to manage the database schema.

```bash
# Generate migrations (if schema changes)
npm run db:generate

# Apply migrations to your database
npm run db:migrate

```

## 🚀 Running the Application

### Development mode (with hot reload)
```bash
npm run start:dev
```
The application will start on `http://localhost:3000`

### Production build
```bash
npm run build
npm run start:prod
```

### Debug mode
```bash
npm run start:debug
```

## 📚 API Documentation

**Swagger UI is automatically available at:** http://localhost:3000/api

The Swagger UI provides:
- Interactive API exploration
- Request/response examples
- DTO schema documentation
- Try-it-out functionality

### API Endpoints Summary

#### Issues (14 endpoints)
```
POST   /issues                      Create issue
GET    /issues                      List all issues (with filtering, pagination, sorting)
GET    /issues/deleted/bin          List deleted issues (recycle bin)
GET    /issues/:id                  Get issue by ID
PATCH  /issues/:id                  Update issue
DELETE /issues/:id                  Soft delete (move to trash)
DELETE /issues/:id/permanent        Permanently delete
PATCH  /issues/:id/restore          Restore from trash

POST   /issues/bulk/soft-delete     Bulk soft delete
DELETE /issues/bulk/permanent       Bulk permanent delete
PATCH  /issues/bulk/restore         Bulk restore
```

#### Comments (4 endpoints)
```
POST   /issues/:issueId/comments                Create comment
GET    /issues/:issueId/comments                List comments
PATCH  /issues/:issueId/comments/:commentId     Update comment
DELETE /issues/:issueId/comments/:commentId     Delete comment
```

#### AI Analysis (1 endpoint)
```
POST   /issues/:issueId/analyze     Generate AI analysis of issue with all comments
```

### Example API Requests

**Create an issue:**
```bash
curl -X POST http://localhost:3000/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login page throws 500 error",
    "description": "Users see a 500 error after submitting valid credentials.",
    "priority": "high"
  }'
```

**List issues with filters:**
```bash
curl "http://localhost:3000/issues?status=open&priority=high&page=1&limit=10"
```

**Generate AI analysis:**
```bash
curl -X POST http://localhost:3000/issues/1/analyze
```

**Soft delete multiple issues:**
```bash
curl -X POST http://localhost:3000/issues/bulk/soft-delete \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3]}'
```

## 📊 Database Schema

### Issues Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| title | TEXT | Issue title |
| description | TEXT | Detailed description |
| status | VARCHAR(20) | open \| in-progress \| closed |
| priority | VARCHAR(20) | low \| medium \| high |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |
| deletedAt | TIMESTAMP NULL | Soft delete marker (NULL = active) |

### Comments Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| issueId | INTEGER FK | References issues.id (cascades on delete) |
| content | TEXT | Comment text |
| authorName | VARCHAR(255) | Author name (optional) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

## ✨ Key Features

### 1. Full CRUD Operations
- Create, read, update, and delete issues
- Comment threads on issues for discussions
- Comprehensive filtering, pagination, and sorting

### 2. Soft Delete & Recycle Bin
- Issues marked as deleted (not permanently removed)
- Recover deleted issues from recycle bin
- Permanent deletion option for data cleanup

### 3. Bulk Operations
- Batch soft delete, hard delete, and restore
- Single API call for multiple issues
- Input validation with detailed error messages

### 4. AI-Powered Analysis
- Analyzes issue content + all discussion comments
- Generates summary, severity level, root causes, and recommendations
- Uses Google Gemini API for intelligent insights

### 5. Validation & Error Handling
- Request DTOs with class-validator decorators
- Automatic response transformation
- Comprehensive error messages
- 404 handling for not-found resources

### 6. API Documentation
- Swagger UI with live endpoint testing
- Full endpoint descriptions and examples
- Request/response schemas automatically documented
``

## 📝 Project Structure

```
src/
├── modules/
│   ├── issues/
│   │   ├── dto/
│   │   │   ├── create-issue.dto.ts
│   │   │   ├── update-issue.dto.ts
│   │   │   ├── list-issues-query.dto.ts
│   │   │   └── bulk-delete.dto.ts
│   │   ├── issues.controller.ts
│   │   ├── issues.service.ts
│   │   └── issues.module.ts
│   ├── comments/
│   │   ├── dto/
│   │   │   ├── create-comment.dto.ts
│   │   │   └── list-comments-query.dto.ts
│   │   ├── comments.controller.ts
│   │   ├── comments.service.ts
│   │   └── comments.module.ts
│   └── ai/
│       ├── dto/
│       │   └── issue-analysis.dto.ts
│       ├── ai.controller.ts
│       ├── ai.service.ts
│       └── ai.module.ts
├── database/
│   ├── schema/
│   │   ├── issues.schema.ts
│   │   └── comments.schema.ts
│   ├── db.ts
│   ├── database.module.ts
│   └── database.constants.ts
├── app.controller.ts
├── app.module.ts
└── main.ts
```

## 🔧 Available Scripts

```bash
# Build
npm run build              # Compile TypeScript
npm run format             # Format code with Prettier
npm run lint               # Run ESLint

# Database
npm run db:generate        # Generate migration from schema changes
npm run db:migrate         # Apply migrations to database

# Development
npm run start              # Start application
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger
npm run start:prod         # Start production build

```

## 🔐 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| PORT | No | Server port (default: 3000) |
| GEMINI_API_KEY | Yes | Google Gemini API key for AI analysis |

## 🐛 Troubleshooting

### Database connection errors
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists and user has permissions

### AI analysis returns empty
- Verify GEMINI_API_KEY is set and valid
- Check that issue and comments exist in database
- Ensure issue ID is correct (404 if not found)

## 📋 Requirements Checklist

- ✅ Create and manage issues/tasks
- ✅ View a list of issues with filtering
- ✅ View a detailed page for a single issue
- ✅ Add discussions/comments to an issue
- ✅ Generate automated AI analysis (Gemini)
- ✅ REST API implementation
- ✅ PostgreSQL database
- ✅ Drizzle ORM
- ✅ TypeScript
- ✅ Clean architecture & separation of concerns
- ✅ Swagger API documentation
- ✅ Request validation
- ✅ Database migrations
