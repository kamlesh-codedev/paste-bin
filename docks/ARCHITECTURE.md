# PasteVault System Architecture

## 1. Architecture Overview

PasteVault is a full-stack web application built using a layered architecture.

The system consists of:

* **React + Vite frontend** for the user interface
* **Flask REST API** for backend application logic
* **SQLAlchemy ORM** for database interaction
* **PostgreSQL** for persistent data storage
* **JWT** for stateless authentication and authorization
* **Flask-Migrate / Alembic** for database schema migrations
* **Docker Compose** for multi-container application orchestration
* **GitHub Actions** for continuous integration and automated testing

The architecture separates presentation, API, business logic, data access, and persistence concerns to maintain a modular and maintainable application structure.

---

# 2. High-Level System Architecture

```mermaid
flowchart TD

    U["User / Client Browser"]

    F["React Frontend\nVite\nPort 5173"]

    API["Flask REST API\nPort 5000"]

    AUTH["JWT Authentication\nAuthorization"]

    BL["Application Logic\nValidation & Access Control"]

    ORM["SQLAlchemy ORM"]

    DB[("PostgreSQL Database\nPort 5432")]

    MIG["Flask-Migrate\nAlembic"]

    VOL[("Persistent Docker Volume")]

    U -->|HTTP / HTTPS| F

    F -->|REST API Requests| API

    API --> AUTH

    API --> BL

    BL --> ORM

    ORM -->|SQL Queries| DB

    MIG -->|Schema Migrations| DB

    DB --> VOL
````

---

# 3. Component Architecture

The system is divided into the following major components:

```mermaid
flowchart LR

    subgraph Client_Layer
        A["User Browser"]
    end

    subgraph Presentation_Layer
        B["React Application"]
        C["Vite Development Server"]
    end

    subgraph Application_Layer
        D["Flask REST API"]
        E["Route / Controller Layer"]
        F["Authentication & Authorization"]
        G["Business Logic"]
        H["Validation"]
    end

    subgraph Data_Access_Layer
        I["SQLAlchemy ORM"]
        J["Application Models"]
    end

    subgraph Persistence_Layer
        K[("PostgreSQL")]
    end

    subgraph Infrastructure_Layer
        L["Docker"]
        M["Docker Compose"]
        N["Persistent Volume"]
    end

    subgraph CI_Layer
        O["GitHub Actions"]
        P["Pytest"]
    end

    A --> B
    B --> C
    B --> D

    D --> E
    E --> F
    E --> G
    G --> H

    G --> I
    I --> J
    I --> K

    K --> N

    M --> L
    L --> B
    L --> D
    L --> K

    O --> P
    P --> D
```

---

# 4. Request Flow

A typical request flows through the application as follows:

```mermaid
sequenceDiagram

    participant User
    participant Frontend as React Frontend
    participant API as Flask API
    participant Auth as JWT Auth
    participant Service as Application Logic
    participant ORM as SQLAlchemy
    participant DB as PostgreSQL

    User->>Frontend: Perform action
    Frontend->>API: HTTP Request

    API->>Auth: Validate JWT

    alt Protected Endpoint
        Auth-->>API: Token Valid
    else Invalid or Missing Token
        Auth-->>API: Unauthorized
        API-->>Frontend: 401 Unauthorized
    end

    API->>Service: Process Request
    Service->>ORM: Execute Database Operation
    ORM->>DB: SQL Query
    DB-->>ORM: Database Result
    ORM-->>Service: ORM Result
    Service-->>API: Processed Response
    API-->>Frontend: JSON Response
    Frontend-->>User: Updated UI
```

---

# 5. Authentication Flow

PasteVault uses JWT-based stateless authentication.

```mermaid
sequenceDiagram

    participant User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Enter Login Credentials

    Frontend->>API: POST /api/auth/login

    API->>Database: Validate User Credentials

    Database-->>API: User Record

    API->>API: Verify Password

    API->>API: Generate JWT

    API-->>Frontend: Return JWT Access Token

    Frontend->>Frontend: Store Authentication State

    Frontend->>API: Protected API Request
    API->>API: Validate JWT

    API-->>Frontend: Authorized Response
```

### Authentication Model

```text
User Credentials
       │
       ▼
POST /api/auth/login
       │
       ▼
Credential Verification
       │
       ▼
JWT Access Token
       │
       ▼
Authorization Header
       │
       ▼
Protected API Endpoint
       │
       ▼
JWT Validation
       │
       ├── Valid ──────► Continue Request
       │
       └── Invalid ────► 401 Unauthorized
```

Protected requests use:

```http
Authorization: Bearer <access_token>
```

---

# 6. Paste Creation Flow

The paste creation workflow is:

```mermaid
sequenceDiagram

    participant User
    participant Frontend
    participant API
    participant Auth
    participant ORM
    participant DB

    User->>Frontend: Enter Paste Data

    Frontend->>API: POST /api/pastes

    API->>Auth: Validate JWT

    Auth-->>API: User Identity

    API->>API: Validate Request Data

    API->>API: Apply Business Rules

    API->>ORM: Create Paste Model

    ORM->>DB: INSERT Paste

    DB-->>ORM: Created Record

    ORM-->>API: Paste Object

    API-->>Frontend: JSON Response

    Frontend-->>User: Display Created Paste
```

---

# 7. Paste Retrieval Flow

## Authenticated Paste Retrieval

```mermaid
flowchart TD

    A["User Requests Paste"] --> B["React Frontend"]

    B --> C["GET /api/pastes/{paste_id}"]

    C --> D{"JWT Valid?"}

    D -->|No| E["401 Unauthorized"]

    D -->|Yes| F["Find Paste"]

    F --> G{"Paste Exists?"}

    G -->|No| H["Resource Not Found"]

    G -->|Yes| I["Return Paste"]

    I --> J["React Frontend"]

    J --> K["Display Paste"]
```

---

# 8. Public Paste Sharing Flow

Public pastes can be accessed through a dedicated public endpoint.

```mermaid
flowchart TD

    A["User Creates Paste"]

    A --> B{"Visibility"}

    B -->|Public| C["Generate Shareable Paste ID"]

    C --> D["Public URL"]

    D --> E["GET /api/pastes/public/{paste_id}"]

    E --> F{"Paste Exists?"}

    F -->|No| G["Not Found"]

    F -->|Yes| H{"Expired?"}

    H -->|Yes| I["410 Gone"]

    H -->|No| J{"Visibility Public?"}

    J -->|No| K["Public Access Denied"]

    J -->|Yes| L["Return Public Paste"]
```

---

# 9. Private Paste Access Control

Private pastes are protected from public access.

```mermaid
flowchart TD

    A["Request Public Paste"]

    A --> B["GET /api/pastes/public/{paste_id}"]

    B --> C["Find Paste"]

    C --> D{"Visibility"}

    D -->|Public| E["Continue"]

    D -->|Private| F["Reject Public Access"]

    E --> G{"Expired?"}

    G -->|No| H["Return Paste"]

    G -->|Yes| I["410 Gone"]

    F --> J["Access Denied"]
```

The visibility state controls whether a paste can be accessed through the public sharing endpoint.

---

# 10. Ownership Authorization

PasteVault uses ownership-based authorization for modification and deletion operations.

The ownership check follows this model:

```mermaid
flowchart TD

    A["Authenticated User"]

    A --> B["Request Update / Delete"]

    B --> C["Validate JWT"]

    C --> D["Retrieve Paste"]

    D --> E["Compare User ID"]

    E --> F{"User Owns Paste?"}

    F -->|Yes| G["Allow Operation"]

    F -->|No| H["403 Forbidden"]
```

### Authorization Rule

```text
Authenticated User ID
        │
        ▼
Compare with Paste Owner ID
        │
        ├── Match
        │     │
        │     ▼
        │  Allow Operation
        │
        └── No Match
              │
              ▼
         403 Forbidden
```

This prevents one authenticated user from modifying or deleting another user's paste.

---

# 11. Paste Expiration Architecture

Paste expiration is handled using an expiration timestamp.

```mermaid
flowchart TD

    A["Create Paste"]

    A --> B{"expires_at provided?"}

    B -->|No| C["Paste Does Not Expire"]

    B -->|Yes| D["Store Expiration Timestamp"]

    D --> E["Public Paste Request"]

    E --> F{"Current Time >= expires_at?"}

    F -->|No| G["Paste Still Available"]

    F -->|Yes| H["Paste Expired"]

    H --> I["Return 410 Gone"]
```

### Expiration States

| State             | Behavior                                                                |
| :---------------- | :---------------------------------------------------------------------- |
| No expiration     | Paste remains available according to visibility and authorization rules |
| Future expiration | Paste remains available until expiration                                |
| Expired           | Public access returns `410 Gone`                                        |

---

# 12. Pagination Architecture

Paste listing supports paginated requests.

Example:

```http
GET /api/pastes?page=1&per_page=10
```

The request flow is:

```mermaid
flowchart TD

    A["GET /api/pastes"] --> B["Read Query Parameters"]

    B --> C["Validate page"]

    C --> D{"Valid?"}

    D -->|No| E["400 Bad Request"]

    D -->|Yes| F["Validate per_page"]

    F --> G{"Valid?"}

    G -->|No| H["400 Bad Request"]

    G -->|Yes| I["Apply Pagination"]

    I --> J["Query PostgreSQL"]

    J --> K["Return Paginated Results"]
```

Pagination reduces the amount of data returned by a single request and improves API performance when users have many pastes.

---

# 13. Database Architecture

PostgreSQL is the persistent data store for PasteVault.

SQLAlchemy provides the ORM layer between the Flask application and PostgreSQL.

```mermaid
flowchart TD

    A["Flask REST API"]

    A --> B["Application Models"]

    B --> C["SQLAlchemy ORM"]

    C --> D["Database Connection"]

    D --> E[("PostgreSQL")]

    E --> F["Persistent Docker Volume"]
```

### Database Responsibilities

PostgreSQL stores persistent application data such as:

* User accounts
* Password hashes
* Paste records
* Paste ownership
* Paste visibility
* Paste language metadata
* Paste expiration information
* Creation and update timestamps

The exact database schema is defined by the SQLAlchemy models and managed through database migrations.

---

# 14. Database Migration Architecture

Database schema changes are managed through Flask-Migrate and Alembic.

```mermaid
flowchart LR

    A["Modify SQLAlchemy Model"]

    A --> B["flask db migrate"]

    B --> C["Generate Migration Script"]

    C --> D["Review Migration"]

    D --> E["flask db upgrade"]

    E --> F[("PostgreSQL Database")]
```

### Migration Workflow

```text
Developer Changes Model
        │
        ▼
Generate Migration
        │
        ▼
Review Migration File
        │
        ▼
Apply Migration
        │
        ▼
Database Schema Updated
```

Migration files are maintained in:

```text
backend/migrations/
```

---

# 15. Docker Architecture

PasteVault runs as a multi-container application using Docker Compose.

```mermaid
flowchart TD

    subgraph Docker_Compose

        F["Frontend Container\nReact / Vite\nPort 5173"]

        B["Backend Container\nFlask API\nPort 5000"]

        DB["Database Container\nPostgreSQL\nPort 5432"]

        V[("PostgreSQL Named Volume")]

    end

    User["User Browser"]

    User -->|HTTP| F

    F -->|REST API| B

    B -->|SQLAlchemy| DB

    DB --> V
```

### Container Responsibilities

| Container    | Responsibility                     |
| :----------- | :--------------------------------- |
| Frontend     | Serves the React application       |
| Backend      | Runs Flask REST API                |
| PostgreSQL   | Stores persistent application data |
| Named Volume | Persists database data             |

---

# 16. Docker Startup Flow

When the application is started using:

```bash
docker compose up --build
```

the environment is initialized as follows:

```mermaid
flowchart TD

    A["docker compose up --build"]

    A --> B["Build Frontend Image"]

    A --> C["Build Backend Image"]

    A --> D["Start PostgreSQL Container"]

    D --> E["Initialize / Mount Database Volume"]

    B --> F["Start Frontend"]

    C --> G["Start Flask Backend"]

    G --> H["Connect to PostgreSQL"]

    H --> I["Application Ready"]

    F --> I
```

---

# 17. Health Check Architecture

The health endpoint provides a simple mechanism to verify application availability and database connectivity.

```mermaid
flowchart TD

    A["Monitoring System / User"]

    A --> B["GET /api/health"]

    B --> C["Flask API"]

    C --> D["Check Database Connectivity"]

    D --> E{"Database Available?"}

    E -->|Yes| F["Return Healthy Response"]

    E -->|No| G["Return Database Failure"]
```

Example healthy response:

```json
{
  "database": "connected",
  "message": "PasteVault API is running",
  "status": "ok"
}
```

---

# 18. Testing Architecture

PasteVault uses Pytest for backend automated testing.

```mermaid
flowchart LR

    A["Developer / CI Pipeline"]

    A --> B["Pytest"]

    B --> C["Authentication Tests"]

    B --> D["Health Tests"]

    B --> E["Paste CRUD Tests"]

    B --> F["Authorization Tests"]

    B --> G["Visibility Tests"]

    B --> H["Expiration Tests"]

    B --> I["Pagination Tests"]

    C --> J[("Test Database")]

    D --> J

    E --> J

    F --> J

    G --> J

    H --> J

    I --> J
```

The test environment should remain isolated from development and production databases.

---

# 19. CI Architecture

GitHub Actions provides continuous integration.

```mermaid
flowchart LR

    A["Developer"]

    A --> B["Git Push / Pull Request"]

    B --> C["GitHub Repository"]

    C --> D["GitHub Actions"]

    D --> E["Checkout Code"]

    E --> F["Setup Python Environment"]

    F --> G["Install Dependencies"]

    G --> H["Run Pytest"]

    H --> I{"Tests Pass?"}

    I -->|Yes| J["CI Success"]

    I -->|No| K["CI Failure"]
```

### CI Responsibilities

The CI pipeline validates that:

* Dependencies can be installed
* The application test suite executes successfully
* Changes do not break existing functionality

The current CI pipeline is focused on testing and validation rather than automated production deployment.

---

# 20. Complete End-to-End Architecture

The complete system can be represented as:

```mermaid
flowchart TD

    USER["User"]

    subgraph Client
        BROWSER["Web Browser"]
        REACT["React Frontend"]
    end

    subgraph Backend
        API["Flask REST API"]
        AUTH["JWT Authentication"]
        ROUTES["API Routes"]
        LOGIC["Application Logic"]
        ORM["SQLAlchemy ORM"]
    end

    subgraph Database
        PG[("PostgreSQL")]
        VOL[("Persistent Volume")]
    end

    subgraph Migration
        MIGRATE["Flask-Migrate / Alembic"]
    end

    subgraph Testing
        PYTEST["Pytest"]
        TESTDB[("Test Database")]
    end

    subgraph CI
        ACTIONS["GitHub Actions"]
    end

    USER --> BROWSER

    BROWSER --> REACT

    REACT -->|HTTP / REST| API

    API --> AUTH
    API --> ROUTES

    ROUTES --> LOGIC

    LOGIC --> ORM

    ORM -->|SQL| PG

    PG --> VOL

    MIGRATE --> PG

    PYTEST --> TESTDB

    ACTIONS --> PYTEST
```

---

# 21. Data Flow Summary

The main data flow through PasteVault is:

```text
User
 │
 ▼
React Frontend
 │
 │ HTTP / REST
 ▼
Flask REST API
 │
 ├── JWT Authentication
 │
 ├── Request Validation
 │
 ├── Authorization
 │
 └── Business Logic
          │
          ▼
    SQLAlchemy ORM
          │
          ▼
      PostgreSQL
          │
          ▼
   Persistent Storage
```

For public paste sharing:

```text
Public User
     │
     ▼
Public Paste URL
     │
     ▼
Flask Public Endpoint
     │
     ├── Check Paste Exists
     │
     ├── Check Visibility
     │
     ├── Check Expiration
     │
     └── Return Paste
```

For protected paste management:

```text
Authenticated User
        │
        ▼
JWT Bearer Token
        │
        ▼
Flask API
        │
        ▼
JWT Validation
        │
        ▼
Ownership Validation
        │
        ├── Owner ──────► Allow
        │
        └── Not Owner ──► 403 Forbidden
```

---

# 22. Architecture Principles

PasteVault follows these architectural principles:

### Separation of Concerns

Frontend, backend, database, testing, and infrastructure responsibilities are separated.

### Stateless Authentication

JWT tokens allow the API to authenticate requests without maintaining traditional server-side session state.

### Persistent Data Storage

PostgreSQL provides reliable persistent relational storage.

### ORM-Based Database Access

SQLAlchemy abstracts database operations and provides structured model-based access.

### Migration-Based Schema Management

Flask-Migrate and Alembic provide version-controlled database schema changes.

### Containerized Environment

Docker provides consistent runtime environments across development and testing.

### Automated Validation

Pytest and GitHub Actions provide automated verification of application behavior.

### Ownership-Based Authorization

Users can manage only the resources they own.

### Public/Private Resource Control

Paste visibility determines whether content can be accessed through public sharing.

---

# 23. Security Architecture Summary

The security model can be summarized as:

```mermaid
flowchart TD

    A["Client Request"]

    A --> B{"Protected Endpoint?"}

    B -->|No| C["Process Public Request"]

    B -->|Yes| D{"JWT Present?"}

    D -->|No| E["401 Unauthorized"]

    D -->|Yes| F["Validate JWT"]

    F --> G{"Token Valid?"}

    G -->|No| E

    G -->|Yes| H{"Ownership Required?"}

    H -->|No| I["Process Request"]

    H -->|Yes| J{"User Owns Resource?"}

    J -->|No| K["403 Forbidden"]

    J -->|Yes| I

    C --> I

    I --> L["Return Response"]
```

---

# 24. Deployment Architecture

The current project is designed around a containerized architecture.

### Current Environment

```text
Developer / User
       │
       ▼
Docker Compose
       │
       ├── React Frontend
       │
       ├── Flask Backend
       │
       └── PostgreSQL Database
```

### Future Production Architecture

A potential production deployment can evolve toward:

```mermaid
flowchart TD

    USER["Users"]

    USER --> CDN["CDN / Static Assets"]

    USER --> PROXY["HTTPS Reverse Proxy"]

    PROXY --> FRONTEND["Frontend"]

    PROXY --> BACKEND["Flask API"]

    BACKEND --> DB[("Managed PostgreSQL")]

    BACKEND --> CACHE[("Redis Cache")]

    CI["GitHub Actions"] --> REGISTRY["Container Registry"]

    REGISTRY --> DEPLOY["Production Environment"]

    DEPLOY --> BACKEND
    DEPLOY --> FRONTEND
```

This represents a possible future architecture and is not necessarily part of the current deployment.

---

# 25. Architecture Summary

PasteVault follows a modular full-stack architecture:

```text
┌──────────────────────────────────────────────┐
│                  USER                        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             REACT FRONTEND                   │
│              Vite / UI                       │
└──────────────────────┬───────────────────────┘
                       │ REST API
                       ▼
┌──────────────────────────────────────────────┐
│              FLASK REST API                  │
│                                              │
│  Authentication │ Authorization │ Validation  │
│                                              │
│            Application Logic                 │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             SQLALCHEMY ORM                   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              POSTGRESQL                      │
│          Persistent Data Storage              │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│         DOCKER PERSISTENT VOLUME             │
└──────────────────────────────────────────────┘


       ┌──────────────────────────────────┐
       │       SUPPORTING SYSTEMS         │
       │                                  │
       │  Flask-Migrate / Alembic         │
       │  Pytest                          │
       │  GitHub Actions                  │
       │  Docker Compose                  │
       └──────────────────────────────────┘
```

---

## Document Information

| Property              | Value                                                            |
| :-------------------- | :--------------------------------------------------------------- |
| **Project**           | PasteVault                                                       |
| **Document**          | System Architecture                                              |
| **Architecture Type** | Full-Stack Layered Architecture                                  |
| **Frontend**          | React + Vite                                                     |
| **Backend**           | Flask REST API                                                   |
| **Database**          | PostgreSQL                                                       |
| **ORM**               | SQLAlchemy                                                       |
| **Authentication**    | JWT                                                              |
| **Migrations**        | Flask-Migrate / Alembic                                          |
| **Testing**           | Pytest                                                           |
| **Containerization**  | Docker                                                           |
| **Orchestration**     | Docker Compose                                                   |
| **CI**                | GitHub Actions                                                   |
| **Status**            | Current architecture with future production evolution documented |