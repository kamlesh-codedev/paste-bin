# PasteVault API Documentation

**Version:** 1.0.0
**API Status:** Development
**Base URL:** `http://127.0.0.1:5000`
**API Prefix:** `/api`
**Authentication:** JWT Bearer Token
**Content Type:** `application/json`

---

## 1. Overview

PasteVault is a Pastebin-style API for creating, storing, retrieving, managing, and sharing text and code snippets.

The API provides:

* User registration
* User authentication
* JWT-based authorization
* Current-user retrieval
* Paste creation
* Paste listing with pagination
* Paste retrieval
* Paste updating
* Paste deletion
* Public paste sharing
* Public/private visibility control
* Ownership-based authorization
* Paste expiration

All authenticated endpoints require a valid JWT access token unless explicitly stated otherwise.

---

## 2. Base URL

### Local Development

```text
http://127.0.0.1:5000
```

All API endpoints are prefixed with:

```text
/api
```

For example:

```text
http://127.0.0.1:5000/api/auth/login
```

> **Production Note:** The current documentation uses the local development server because a deployed production URL has not been provided yet. Replace the base URL with the deployed API domain before publishing this documentation for external users.

---

# 3. Authentication

PasteVault uses **JWT Bearer Token authentication**.

After successful login, the API provides an access token that must be included in the `Authorization` header when accessing protected endpoints.

### Authorization Header

```http
Authorization: Bearer <access_token>
```

Example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 3.1 Authentication Flow

The recommended authentication flow is:

```text
1. Register a user
       ↓
2. Login with username or email
       ↓
3. Receive JWT access token
       ↓
4. Include token in Authorization header
       ↓
5. Access protected endpoints
```

Example:

```text
POST /api/auth/register
        ↓
POST /api/auth/login
        ↓
JWT Access Token
        ↓
GET /api/auth/me
        ↓
POST /api/pastes
```

---

# 4. API Endpoint Summary

| Method   | Endpoint                        | Authentication | Description                          |
| -------- | ------------------------------- | -------------- | ------------------------------------ |
| `POST`   | `/api/auth/register`            | No             | Register a new user                  |
| `POST`   | `/api/auth/login`               | No             | Login using username or email        |
| `GET`    | `/api/auth/me`                  | Yes            | Get authenticated user's information |
| `POST`   | `/api/pastes`                   | Yes            | Create a new paste                   |
| `GET`    | `/api/pastes`                   | Yes            | List authenticated user's pastes     |
| `GET`    | `/api/pastes/{paste_id}`        | Yes            | Retrieve a specific paste            |
| `PUT`    | `/api/pastes/{paste_id}`        | Yes            | Update a paste                       |
| `DELETE` | `/api/pastes/{paste_id}`        | Yes            | Delete a paste                       |
| `GET`    | `/api/pastes/public/{paste_id}` | No             | Retrieve a public paste              |

---

# 5. Authentication API

## 5.1 Register User

Creates a new user account.

### Endpoint

```http
POST /api/auth/register
```

### Authentication

Not required.

### Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "username": "kamlesh",
  "email": "kamlesh@example.com",
  "password": "Test@12345"
}
```

### Request Fields

| Field      | Type   | Required | Description                     |
| ---------- | ------ | -------- | ------------------------------- |
| `username` | String | Yes      | Unique username for the account |
| `email`    | String | Yes      | User's email address            |
| `password` | String | Yes      | Account password                |

### Example

```bash
curl -X POST "http://127.0.0.1:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kamlesh",
    "email": "kamlesh@example.com",
    "password": "Test@12345"
  }'
```

### Expected Behavior

A successful request creates a new user account.

The uploaded test collection does not specify the exact success response body or status code. Confirm the implementation response before adding the exact response schema to this documentation.

---

## 5.2 Login

Authenticates a user and provides a JWT access token.

The API supports authentication using either:

* Username
* Email address

### Endpoint

```http
POST /api/auth/login
```

### Authentication

Not required.

### Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "identifier": "kamlesh",
  "password": "Test@12345"
}
```

The `identifier` can contain either the user's username or email address.

### Login Using Username

```json
{
  "identifier": "kamlesh",
  "password": "Test@12345"
}
```

### Login Using Email

```json
{
  "identifier": "kamlesh@example.com",
  "password": "Test@12345"
}
```

### Example

```bash
curl -X POST "http://127.0.0.1:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "kamlesh",
    "password": "Test@12345"
  }'
```

### Authentication Workflow

After login, store the returned JWT access token.

Use the token in subsequent protected requests:

```http
Authorization: Bearer <access_token>
```

> **Implementation Note:** The uploaded test collection confirms that a JWT access token is returned and subsequently used for protected requests. It does not define the exact login response JSON structure, so the exact response schema should be confirmed from the backend implementation.

---

## 5.3 Get Current User

Returns information about the currently authenticated user.

### Endpoint

```http
GET /api/auth/me
```

### Authentication

Required.

### Headers

```http
Authorization: Bearer <access_token>
```

### Example

```bash
curl -X GET "http://127.0.0.1:5000/api/auth/me" \
  -H "Authorization: Bearer <access_token>"
```

### Unauthorized Request

Calling this endpoint without a JWT access token should be rejected.

### Example

```http
GET /api/auth/me
```

### Expected Result

```text
401 Unauthorized
```

The test collection explicitly tests the protected route both without a token and with a valid token.

---

# 6. Paste API

## 6.1 Create Paste

Creates a new paste belonging to the authenticated user.

### Endpoint

```http
POST /api/pastes
```

### Authentication

Required.

### Headers

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request Body

```json
{
  "title": "My First Python Paste",
  "content": "def hello_world():\n    print('Hello, Kamlesh!')\n\nhello_world()",
  "language": "python",
  "visibility": "public"
}
```

### Request Fields

| Field        | Type              | Required                 | Description                                     |
| ------------ | ----------------- | ------------------------ | ----------------------------------------------- |
| `title`      | String            | Implementation-dependent | Paste title                                     |
| `content`    | String            | Yes                      | Text or code stored in the paste                |
| `language`   | String            | Implementation-dependent | Programming language or text type               |
| `visibility` | String            | Implementation-dependent | Paste visibility, such as `public` or `private` |
| `expires_at` | ISO 8601 DateTime | No                       | Optional expiration timestamp                   |

### Public Paste Example

```json
{
  "title": "My First Python Paste",
  "content": "def hello_world():\n    print('Hello, Kamlesh!')\n\nhello_world()",
  "language": "python",
  "visibility": "public"
}
```

### Paste With Expiration

```json
{
  "title": "Temporary Paste",
  "content": "This will expire",
  "language": "text",
  "visibility": "public",
  "expires_at": "2026-08-01T12:00:00+00:00"
}
```

### Example

```bash
curl -X POST "http://127.0.0.1:5000/api/pastes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "title": "My First Python Paste",
    "content": "def hello_world():\n    print(\"Hello, World!\")",
    "language": "python",
    "visibility": "public"
  }'
```

---

# 7. List User's Pastes

Returns the authenticated user's pastes.

### Endpoint

```http
GET /api/pastes
```

### Authentication

Required.

### Headers

```http
Authorization: Bearer <access_token>
```

### Basic Request

```http
GET /api/pastes
```

### Example

```bash
curl -X GET "http://127.0.0.1:5000/api/pastes" \
  -H "Authorization: Bearer <access_token>"
```

The endpoint also supports pagination.

---

## 7.1 Pagination

Pagination parameters:

| Parameter  | Type    | Description                |
| ---------- | ------- | -------------------------- |
| `page`     | Integer | Page number                |
| `per_page` | Integer | Number of records per page |

### Default Pagination

```http
GET /api/pastes
```

### Page 1 With 2 Records

```http
GET /api/pastes?page=1&per_page=2
```

### Page 2 With 2 Records

```http
GET /api/pastes?page=2&per_page=2
```

### Example

```bash
curl -X GET "http://127.0.0.1:5000/api/pastes?page=1&per_page=2" \
  -H "Authorization: Bearer <access_token>"
```

### Pagination Validation

The test suite verifies invalid pagination input.

#### Invalid Page Type

```http
GET /api/pastes?page=abc&per_page=10
```

Expected:

```text
400 Bad Request
```

#### Per-Page Limit Exceeded

```http
GET /api/pastes?page=1&per_page=101
```

Expected:

```text
400 Bad Request
```

The test collection therefore establishes that the API validates pagination parameters and rejects a `per_page` value of `101`.

> **Note:** The exact maximum allowed `per_page` value should be confirmed from the backend implementation. The test demonstrates that `101` is rejected.

---

# 8. Retrieve a Paste

Retrieves a specific paste by its unique paste ID.

### Endpoint

```http
GET /api/pastes/{paste_id}
```

### Authentication

Required.

### Path Parameter

| Parameter  | Type | Description                    |
| ---------- | ---- | ------------------------------ |
| `paste_id` | UUID | Unique identifier of the paste |

### Example

```http
GET /api/pastes/a13b2a96-4d0b-4137-81f2-0661018dcc70
```

### Headers

```http
Authorization: Bearer <access_token>
```

### Example

```bash
curl -X GET \
  "http://127.0.0.1:5000/api/pastes/a13b2a96-4d0b-4137-81f2-0661018dcc70" \
  -H "Authorization: Bearer <access_token>"
```

---

# 9. Update a Paste

Updates an existing paste.

### Endpoint

```http
PUT /api/pastes/{paste_id}
```

### Authentication

Required.

### Authorization

The authenticated user must own the paste.

A user cannot update another user's paste.

### Headers

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Full Update Example

```json
{
  "title": "My Updated Python Paste",
  "content": "def hello_world():\n    print('Hello, Kamlesh! This is updated.')\n\nhello_world()",
  "language": "python",
  "visibility": "public"
}
```

### Visibility-Only Update

The API can also be used to change the visibility of an existing paste.

```json
{
  "visibility": "private"
}
```

### Example

```bash
curl -X PUT \
  "http://127.0.0.1:5000/api/pastes/<paste_id>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "visibility": "private"
  }'
```

---

# 10. Public Paste View

Retrieves a paste through its public sharing endpoint.

### Endpoint

```http
GET /api/pastes/public/{paste_id}
```

### Authentication

Not required.

### Path Parameter

| Parameter  | Type | Description                    |
| ---------- | ---- | ------------------------------ |
| `paste_id` | UUID | Unique identifier of the paste |

### Example

```http
GET /api/pastes/public/a13b2a96-4d0b-4137-81f2-0661018dcc70
```

### Example

```bash
curl -X GET \
  "http://127.0.0.1:5000/api/pastes/public/<paste_id>"
```

---

## 10.1 Public Paste Visibility

A paste marked as:

```json
{
  "visibility": "public"
}
```

can be retrieved through:

```http
GET /api/pastes/public/{paste_id}
```

A paste changed to:

```json
{
  "visibility": "private"
}
```

should no longer be accessible through the public endpoint.

### Visibility Workflow

```text
Create Paste
     │
     ▼
visibility = public
     │
     ▼
GET /api/pastes/public/{paste_id}
     │
     └── Accessible
     
     ▼
PUT /api/pastes/{paste_id}
{
    "visibility": "private"
}
     │
     ▼
GET /api/pastes/public/{paste_id}
     │
     └── Public access denied
```

The uploaded test collection explicitly verifies both public access and subsequent denial after changing the paste to private.

---

# 11. Delete a Paste

Deletes an existing paste.

### Endpoint

```http
DELETE /api/pastes/{paste_id}
```

### Authentication

Required.

### Authorization

Only the owner of the paste can delete it.

### Headers

```http
Authorization: Bearer <access_token>
```

### Example

```bash
curl -X DELETE \
  "http://127.0.0.1:5000/api/pastes/<paste_id>" \
  -H "Authorization: Bearer <access_token>"
```

---

# 12. Ownership and Authorization

PasteVault enforces ownership-based authorization.

A paste belongs to the user who created it.

Only the owner should be able to:

* Update the paste
* Delete the paste

Another authenticated user cannot modify or delete someone else's paste.

---

## 12.1 Unauthorized Update Attempt

Example scenario:

```text
User A
  │
  ├── Creates Paste A
  │
  ▼
Paste A belongs to User A

User B
  │
  └── Attempts to update Paste A
```

Expected result:

```text
403 Forbidden
```

---

## 12.2 Unauthorized Delete Attempt

Example scenario:

```text
User A
  │
  ├── Creates Paste A
  │
  ▼
Paste A belongs to User A

User B
  │
  └── Attempts to delete Paste A
```

Expected result:

```text
403 Forbidden
```

The test suite explicitly verifies both cross-user update and cross-user delete attempts and expects `403 Forbidden`.

### Authorization Rule

```text
Authenticated User ID
        │
        ▼
Compare with Paste Owner ID
        │
        ├── Match ──────► Allow operation
        │
        └── No Match ───► 403 Forbidden
```

---

# 13. Paste Expiration

Pastes may optionally have an expiration timestamp.

The expiration value is represented using an ISO 8601 datetime.

Example:

```json
{
  "expires_at": "2026-08-01T12:00:00+00:00"
}
```

---

## 13.1 Future Expiration

A paste with a future expiration timestamp should remain accessible until the expiration time is reached.

### Example

```json
{
  "title": "Temporary Paste",
  "content": "This will expire",
  "language": "text",
  "visibility": "public",
  "expires_at": "2026-08-01T12:00:00+00:00"
}
```

The public paste endpoint is then used to verify that the paste is still available.

```http
GET /api/pastes/public/{paste_id}
```

Expected behavior:

```text
200 OK
```

The uploaded test collection explicitly marks the future expiration test as expected to return `200 OK`.

---

## 13.2 Expired Paste

A paste with an expiration timestamp in the past is considered expired.

### Example

```json
{
  "title": "Expired Paste",
  "content": "This has expired",
  "language": "text",
  "visibility": "public",
  "expires_at": "2020-01-01T00:00:00+00:00"
}
```

Attempting to retrieve the expired paste through the public endpoint should return:

```text
410 Gone
```

### Example

```http
GET /api/pastes/public/{paste_id}
```

Expected result:

```text
410 Gone
```

The test collection explicitly verifies expired paste handling using the `410 Gone` response status.

---

# 14. HTTP Status Codes

The following status codes are confirmed or explicitly expected by the provided API test collection.

| Status Code        | Meaning                         | Usage                                             |
| ------------------ | ------------------------------- | ------------------------------------------------- |
| `200 OK`           | Request successful              | Successful retrieval and future-expiration access |
| `400 Bad Request`  | Invalid request                 | Invalid pagination input                          |
| `401 Unauthorized` | Authentication required/invalid | Protected endpoint accessed without token         |
| `403 Forbidden`    | Access denied                   | User attempts to modify another user's paste      |
| `410 Gone`         | Resource expired                | Accessing an expired paste                        |

> The exact status codes for successful registration, login, paste creation, update, and deletion should be confirmed from the backend implementation before expanding this table.

---

# 15. Common Request Headers

## JSON Request

For requests containing a JSON body:

```http
Content-Type: application/json
```

## Authenticated Request

For protected endpoints:

```http
Authorization: Bearer <access_token>
```

## Combined

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

---

# 16. Complete API Workflows

## 16.1 New User Workflow

### Step 1: Register

```http
POST /api/auth/register
```

```json
{
  "username": "kamlesh",
  "email": "kamlesh@example.com",
  "password": "Test@12345"
}
```

### Step 2: Login

```http
POST /api/auth/login
```

```json
{
  "identifier": "kamlesh",
  "password": "Test@12345"
}
```

### Step 3: Store JWT

```text
access_token = <JWT returned by login>
```

### Step 4: Verify Authentication

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Step 5: Create Paste

```http
POST /api/pastes
Authorization: Bearer <access_token>
```

### Step 6: Manage Paste

```text
GET     /api/pastes
GET     /api/pastes/{paste_id}
PUT     /api/pastes/{paste_id}
DELETE  /api/pastes/{paste_id}
```

---

## 16.2 Public Sharing Workflow

```text
1. User logs in
        ↓
2. User creates a paste
        ↓
3. Set visibility to "public"
        ↓
4. Share paste ID
        ↓
5. Anyone can request:
   GET /api/pastes/public/{paste_id}
```

---

## 16.3 Private Paste Workflow

```text
1. User creates paste
        ↓
2. Set visibility to "private"
        ↓
3. Public endpoint is accessed
        ↓
4. Public access is denied
```

---

## 16.4 Ownership Security Workflow

```text
User A
   │
   └── Creates Paste A
          │
          ▼
     Paste Owner = A
          │
          ▼
User B authenticates
          │
          ├── PUT /api/pastes/{paste_id}
          │
          └── DELETE /api/pastes/{paste_id}
                    │
                    ▼
              403 Forbidden
```

---

## 16.5 Expiration Workflow

```text
Create Paste
     │
     ├── No expiration
     │       └── Normal lifecycle
     │
     ├── Future expiration
     │       └── Accessible before expiration
     │
     └── Past expiration
             └── 410 Gone
```

---

# 17. Example API Usage Sequence

The following sequence demonstrates a complete PasteVault session.

### 1. Register

```http
POST /api/auth/register
```

### 2. Login

```http
POST /api/auth/login
```

### 3. Authenticate

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### 4. Create Paste

```http
POST /api/pastes
Authorization: Bearer <access_token>
```

### 5. List Pastes

```http
GET /api/pastes
Authorization: Bearer <access_token>
```

### 6. Retrieve Paste

```http
GET /api/pastes/{paste_id}
Authorization: Bearer <access_token>
```

### 7. Update Paste

```http
PUT /api/pastes/{paste_id}
Authorization: Bearer <access_token>
```

### 8. Make Paste Public

```json
{
  "visibility": "public"
}
```

### 9. Access Public Paste

```http
GET /api/pastes/public/{paste_id}
```

### 10. Make Paste Private

```json
{
  "visibility": "private"
}
```

### 11. Delete Paste

```http
DELETE /api/pastes/{paste_id}
Authorization: Bearer <access_token>
```

---

# 18. Security Considerations

## JWT Authentication

Protected API endpoints must require a valid JWT Bearer token.

Clients should send:

```http
Authorization: Bearer <access_token>
```

Access tokens should be treated as sensitive credentials.

Do not:

* Commit tokens to Git
* Store tokens in source code
* Share tokens publicly
* Include real tokens in public documentation
* Log access tokens in application logs

The example tokens used during API testing should never be reused in production documentation.

---

## Ownership Authorization

Authentication alone is not sufficient for modifying a paste.

The API must verify that:

```text
Authenticated User ID == Paste Owner ID
```

before allowing update or delete operations.

---

## Public and Private Data

Public paste access should be explicitly controlled by the paste's visibility state.

Private pastes must not be exposed through the public paste endpoint.

---

## Expiration

Expired public pastes should not remain publicly accessible.

The API uses:

```text
410 Gone
```

for expired paste access according to the provided test scenario.

---

# 19. Testing Coverage

The provided API test collection covers the following areas:

### Authentication

* User registration
* Login using username
* Login using email
* Protected endpoint without token
* Protected endpoint with token

### Paste Management

* Create paste
* List pastes
* Retrieve paste
* Update paste
* Delete paste

### Visibility

* Public paste retrieval
* Change public paste to private
* Verify private paste is no longer publicly accessible

### Authorization

* User A creates a paste
* User B authenticates
* User B attempts to update User A's paste
* User B attempts to delete User A's paste
* Expected result: `403 Forbidden`

### Pagination

* Default pagination
* Page selection
* Custom `per_page`
* Invalid page type
* Excessive `per_page` value

### Expiration

* Future expiration
* Access before expiration
* Past expiration
* Access after expiration
* Expected expired response: `410 Gone`

These scenarios provide coverage for the core authentication, authorization, CRUD, visibility, pagination, and expiration behavior represented in the current API test collection.

---

# 20. API Test Checklist

Use the following checklist when validating the API.

## Authentication

* [ ] Register a new user
* [ ] Login using username
* [ ] Login using email
* [ ] Access `/api/auth/me` without token
* [ ] Access `/api/auth/me` with valid token

## Paste CRUD

* [ ] Create paste
* [ ] List pastes
* [ ] Retrieve paste
* [ ] Update paste
* [ ] Delete paste

## Visibility

* [ ] Create public paste
* [ ] Access public paste without authentication
* [ ] Change paste to private
* [ ] Verify public access is denied

## Authorization

* [ ] Create paste as User A
* [ ] Login as User B
* [ ] Attempt to update User A's paste
* [ ] Verify `403 Forbidden`
* [ ] Attempt to delete User A's paste
* [ ] Verify `403 Forbidden`

## Pagination

* [ ] Test default pagination
* [ ] Test page 1
* [ ] Test page 2
* [ ] Test invalid page value
* [ ] Test excessive `per_page` value

## Expiration

* [ ] Create future-expiring paste
* [ ] Verify future paste is accessible
* [ ] Create already-expired paste
* [ ] Verify expired paste returns `410 Gone`

---

# 21. API Documentation Status

This document describes the API behavior represented by the current API test collection.

### Currently Documented

* JWT Bearer authentication
* User registration
* Username/email login
* Current-user endpoint
* Paste CRUD operations
* Public paste access
* Visibility control
* Ownership authorization
* Pagination
* Paste expiration
* Expected security behaviors
* API testing workflows

### Recommended Before Production Release

The following details should be added after confirming the backend implementation:

* Exact success response JSON for every endpoint
* Exact error response JSON format
* Exact status code for each successful operation
* Password validation rules
* Username validation rules
* Email validation rules
* Allowed `language` values, if restricted
* Allowed `visibility` values
* Maximum title length
* Maximum paste content size
* Exact pagination defaults
* Exact maximum `per_page`
* JWT expiration time
* Refresh token support, if available
* Rate limiting
* CORS policy
* API versioning strategy
* Production API base URL
* Request ID / correlation ID behavior
* OpenAPI / Swagger specification

---

# 22. Quick Reference

```text
BASE URL
http://127.0.0.1:5000

AUTH
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

PASTES
POST   /api/pastes
GET    /api/pastes
GET    /api/pastes/{paste_id}
PUT    /api/pastes/{paste_id}
DELETE /api/pastes/{paste_id}

PUBLIC
GET    /api/pastes/public/{paste_id}

AUTH HEADER
Authorization: Bearer <access_token>

PAGINATION
GET /api/pastes?page=1&per_page=2

VISIBILITY
public
private

KNOWN VALIDATION BEHAVIOR
401 Unauthorized  → Protected endpoint without valid authentication
403 Forbidden      → User does not own the paste
400 Bad Request    → Invalid pagination input
410 Gone           → Paste has expired
```

---

## Document Information

| Property       | Value                        |
| -------------- | ---------------------------- |
| Document       | PasteVault API Documentation |
| Version        | 1.0.0                        |
| Environment    | Local Development            |
| Base URL       | `http://127.0.0.1:5000`      |
| Authentication | JWT Bearer Token             |
| Content Type   | JSON                         |
| API Prefix     | `/api`                       |
| Status         | Development                  |
