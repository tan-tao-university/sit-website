# SIT Curriculum Management API Documentation

## Overview

The SIT Curriculum Management API provides RESTful endpoints for managing educational programs, curriculums, curriculum sections, and user authentication. The API follows REST conventions and includes comprehensive Swagger/OpenAPI documentation.

**Base URL**: `http://localhost:8080/api/v1`  
**Swagger Documentation**: `http://localhost:8080/api/docs`

### Authentication

Every API request requires the private service key in `X-API-Key`. Protected user endpoints additionally require a short-lived JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

**Supported authentication method**: Local email/password authentication with scrypt password hashes, short-lived JWT access tokens, and rotating opaque refresh tokens.

### Authorization (RBAC)

The API implements Role-Based Access Control with three roles:

- **admin** - Full system access
- **student** - Student-specific features
- **parent** - Parent-specific features

## API Conventions

### HTTP Methods

- `GET` - Retrieve resources
- `POST` - Create new resources
- `PUT` - Update existing resources (full update)
- `PATCH` - Partial update of resources
- `DELETE` - Remove resources

### Response Codes

- `200 OK` - Successful GET, PUT, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Request Validation

All requests are automatically validated using `class-validator`. Invalid requests will return `400 Bad Request` with detailed error messages.

---

## Authentication API

### Register with Email/Password

#### `POST /api/v1/auth/register`

Register a new user account with email and password.

**Request Body**:

```json
{
  "email": "student@sit.edu.vn",
  "password": "SecurePassword123!",
  "fullName": "Nguyễn Văn A"
}
```

**Response**: `201 Created`

```json
{
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@sit.edu.vn",
    "fullName": "Nguyễn Văn A",
    "emailVerified": false,
    "isActive": true,
    "createdAt": "2026-01-12T15:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login with Email/Password

#### `POST /api/v1/auth/login`

Login with email and password.

**Request Body**:

```json
{
  "email": "student@sit.edu.vn",
  "password": "SecurePassword123!"
}
```

**Response**: `200 OK`

```json
{
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@sit.edu.vn",
    "fullName": "Nguyễn Văn A",
    "avatarUrl": null,
    "roles": ["student"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response**: `401 Unauthorized`

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

---

### Refresh Access Token

#### `POST /api/v1/auth/refresh`

Refresh an expired access token using a refresh token.

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Logout

#### `POST /api/v1/auth/logout`

Logout and invalidate refresh token.

**Headers**: `Authorization: Bearer <access_token>`

**Response**: `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

---

### Get Current User

#### `GET /api/v1/auth/me`

Get the current authenticated user's profile.

**Headers**: `Authorization: Bearer <access_token>`

**Response**: `200 OK`

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@sit.edu.vn",
  "fullName": "Nguyễn Văn A",
  "avatarUrl": null,
  "emailVerified": true,
  "isActive": true,
  "roles": ["student"],
  "lastLoginAt": "2026-01-12T15:00:00.000Z",
  "createdAt": "2026-01-12T10:00:00.000Z"
}
```

---

### Update Current User Profile

#### `PUT /api/v1/auth/me`

Update the current user's profile.

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:

```json
{
  "fullName": "Nguyễn Văn B",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response**: `200 OK`

---

### Change Password

#### `POST /api/v1/auth/change-password`

Change the current user's password.

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response**: `200 OK`

```json
{
  "message": "Password changed successfully"
}
```

---

## Users API (Admin Only)

All endpoints in this section require **admin** role.

### Get All Users

#### `GET /api/v1/users`

Get all users with optional filtering.

**Headers**: `Authorization: Bearer <access_token>` (admin only)

**Query Parameters**:

- `role` (optional): Filter by role (`admin` | `student` | `parent`)
- `isActive` (optional): Filter by active status (boolean)
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Example**: `GET /api/v1/users?role=student&isActive=true&page=1&limit=20`

**Response**: `200 OK`

```json
{
  "data": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@sit.edu.vn",
      "fullName": "Nguyễn Văn A",
      "roles": ["student"],
      "isActive": true,
      "createdAt": "2026-01-12T10:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### Get User by ID

#### `GET /api/v1/users/:id`

Get a specific user by ID.

**Headers**: `Authorization: Bearer <access_token>` (admin only)

**Parameters**:

- `id`: User UUID

**Response**: `200 OK` | `404 Not Found`

---

### Update User

#### `PUT /api/v1/users/:id`

Update a user's information.

**Headers**: `Authorization: Bearer <access_token>` (admin only)

**Parameters**:

- `id`: User UUID

**Request Body**:

```json
{
  "fullName": "Nguyễn Văn C",
  "isActive": false
}
```

**Response**: `200 OK` | `404 Not Found`

---

### Delete User

#### `DELETE /api/v1/users/:id`

Delete a user account.

**Headers**: `Authorization: Bearer <access_token>` (admin only)

**Parameters**:

- `id`: User UUID

**Response**: `200 OK` | `404 Not Found`

---

### Assign Role to User

#### `POST /api/v1/users/:id/roles`

Assign a role to a user.

**Headers**: `Authorization: Bearer <access_token>` (admin only)

**Parameters**:

- `id`: User UUID

**Request Body**:

```json
{
  "role": "student"
}
```

**Response**: `201 Created`

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "student",
  "assignedAt": "2026-01-12T15:00:00.000Z"
}
```

---

### Remove Role from User

#### `DELETE /api/v1/users/:id/roles/:roleId`

Remove a role from a user.

**Headers**: `Authorization: Bearer <access_token>` (admin only)

**Parameters**:

- `id`: User UUID
- `roleId`: User Role UUID

**Response**: `200 OK` | `404 Not Found`

---

## Programs API

### Endpoints

#### `POST /api/v1/programs`

Create a new program.

**Request Body**:

```json
{
  "code": "KHMT",
  "nameVi": "Khoa học máy tính",
  "nameEn": "Computer Science",
  "level": "undergraduate",
  "majorCode": "7480101",
  "durationYears": 4,
  "totalSemesters": 8,
  "totalCredits": 130,
  "educationType": "chinh_quy",
  "language": "vi",
  "degreeAwarded": "Cử nhân Khoa học máy tính",
  "banner": "https://example.com/banner.jpg",
  "status": "active"
}
```

**Response**: `201 Created`

---

#### `GET /api/v1/programs`

Get all programs with optional filtering.

**Query Parameters**:

- `status` (optional): Filter by status (`active` | `inactive`)
- `level` (optional): Filter by level (`undergraduate` | `postgraduate`)

**Example**: `GET /api/v1/programs?status=active&level=undergraduate`

**Response**: `200 OK`

```json
[
  {
    "programId": "550e8400-e29b-41d4-a716-446655440000",
    "code": "KHMT",
    "nameVi": "Khoa học máy tính",
    "nameEn": "Computer Science",
    "level": "undergraduate",
    "majorCode": "7480101",
    "durationYears": 4,
    "totalSemesters": 8,
    "totalCredits": 130,
    "educationType": "chinh_quy",
    "language": "vi",
    "degreeAwarded": "Cử nhân Khoa học máy tính",
    "banner": "https://example.com/banner.jpg",
    "status": "active"
  }
]
```

---

#### `GET /api/v1/programs/:id`

Get a specific program by ID.

**Parameters**:

- `id`: Program UUID

**Response**: `200 OK` | `404 Not Found`

---

#### `PUT /api/v1/programs/:id`

Update a program (all fields optional).

**Parameters**:

- `id`: Program UUID

**Request Body**: Same as POST, but all fields optional

**Response**: `200 OK` | `404 Not Found`

---

#### `DELETE /api/v1/programs/:id`

Delete a program.

**Parameters**:

- `id`: Program UUID

**Response**: `200 OK` | `404 Not Found`

---

## Curriculums API

### Endpoints

#### `POST /api/v1/curriculums`

Create a new curriculum.

**Request Body**:

```json
{
  "programId": "550e8400-e29b-41d4-a716-446655440000",
  "year": 2025,
  "name": "CTĐT KHMT 2025",
  "description": "Chương trình đào tạo Khoa học máy tính năm 2025",
  "banner": "https://example.com/curriculum-banner.jpg",
  "pdfUrl": "https://example.com/curriculum.pdf",
  "isCurrent": true
}
```

**Response**: `201 Created`

---

#### `GET /api/v1/curriculums`

Get all curriculums with optional filtering.

**Query Parameters**:

- `programId` (optional): Filter by program ID

**Example**: `GET /api/v1/curriculums?programId=550e8400-e29b-41d4-a716-446655440000`

**Response**: `200 OK`

---

#### `GET /api/v1/curriculums/:id`

Get a specific curriculum by ID.

**Parameters**:

- `id`: Curriculum UUID

**Query Parameters**:

- `includeSections` (optional): Include curriculum sections (boolean)

**Example**: `GET /api/v1/curriculums/:id?includeSections=true`

**Response**: `200 OK` | `404 Not Found`

---

#### `GET /api/v1/curriculums/current/:programId`

Get the current active curriculum for a program (includes sections).

**Parameters**:

- `programId`: Program UUID

**Response**: `200 OK` | `404 Not Found`

```json
{
  "curriculumId": "550e8400-e29b-41d4-a716-446655440000",
  "programId": "550e8400-e29b-41d4-a716-446655440000",
  "year": 2025,
  "name": "CTĐT KHMT 2025",
  "description": "Chương trình đào tạo Khoa học máy tính năm 2025",
  "banner": "https://example.com/curriculum-banner.jpg",
  "pdfUrl": "https://example.com/curriculum.pdf",
  "isCurrent": true,
  "publishedAt": "2025-01-01T00:00:00.000Z",
  "sections": [
    {
      "sectionId": "...",
      "curriculumId": "...",
      "sectionKey": "intro",
      "title": "Giới thiệu CTĐT",
      "content": "<p>...</p>",
      "displayOrder": 1,
      "isVisible": true
    }
  ]
}
```

---

#### `PUT /api/v1/curriculums/:id`

Update a curriculum.

**Parameters**:

- `id`: Curriculum UUID

**Request Body**: Same as POST, but all fields optional

**Response**: `200 OK` | `404 Not Found`

---

#### `DELETE /api/v1/curriculums/:id`

Delete a curriculum.

**Parameters**:

- `id`: Curriculum UUID

**Response**: `200 OK` | `404 Not Found`

---

## Courses API

### Endpoints

#### `POST /api/v1/courses`

Create a new course.

**Request Body**:

```json
{
  "code": "CS2101",
  "nameVi": "Cấu trúc dữ liệu và giải thuật",
  "nameEn": "Data Structures and Algorithms",
  "credits": 3,
  "lectureHours": 2,
  "practiceHours": 1
}
```

**Response**: `201 Created`

---

#### `GET /api/v1/courses`

Get all courses with optional filtering.

**Query Parameters**:

- `code` (optional): Filter by course code
- `credits` (optional): Filter by number of credits

**Example**: `GET /api/v1/courses?credits=3`

**Response**: `200 OK`

```json
[
  {
    "courseId": "550e8400-e29b-41d4-a716-446655440000",
    "code": "CS2101",
    "nameVi": "Cấu trúc dữ liệu và giải thuật",
    "nameEn": "Data Structures and Algorithms",
    "credits": 3,
    "lectureHours": 2,
    "practiceHours": 1
  }
]
```

---

#### `GET /api/v1/courses/:id`

Get a specific course by ID.

**Parameters**:

- `id`: Course UUID

**Response**: `200 OK` | `404 Not Found`

---

#### `PUT /api/v1/courses/:id`

Update a course.

**Parameters**:

- `id`: Course UUID

**Request Body**: Same as POST, but all fields optional

**Response**: `200 OK` | `404 Not Found`

---

#### `DELETE /api/v1/courses/:id`

Delete a course.

**Parameters**:

- `id`: Course UUID

**Response**: `200 OK` | `404 Not Found`

---

#### `GET /api/v1/courses/curriculum/:curriculumId`

Get all courses for a specific curriculum.

**Parameters**:

- `curriculumId`: Curriculum UUID

**Response**: `200 OK`

```json
[
  {
    "courseId": "550e8400-e29b-41d4-a716-446655440000",
    "code": "CS2101",
    "nameVi": "Cấu trúc dữ liệu và giải thuật",
    "nameEn": "Data Structures and Algorithms",
    "credits": 3,
    "lectureHours": 2,
    "practiceHours": 1
  }
]
```

---

## Curriculum Courses API

### Endpoints

#### `POST /api/v1/curriculum-courses`

Add a course to a curriculum.

**Request Body**:

```json
{
  "curriculumId": "550e8400-e29b-41d4-a716-446655440000",
  "courseId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response**: `201 Created`

---

#### `GET /api/v1/curriculum-courses`

Get all curriculum-course relationships with optional filtering.

**Query Parameters**:

- `curriculumId` (optional): Filter by curriculum ID
- `courseId` (optional): Filter by course ID

**Example**: `GET /api/v1/curriculum-courses?curriculumId=550e8400-e29b-41d4-a716-446655440000`

**Response**: `200 OK`

---

#### `DELETE /api/v1/curriculum-courses/:id`

Remove a course from a curriculum.

**Parameters**:

- `id`: Curriculum-Course relationship UUID

**Response**: `200 OK` | `404 Not Found`

---

## Sections API

### Section Keys

Predefined section keys for curriculum sections:

- `intro` - Giới thiệu CTĐT
- `overview` - Thông tin CTĐT
- `vision` - Sứ mạng – Tầm nhìn
- `objectives` - Mục tiêu CTĐT
- `learning_outcomes` - Chuẩn đầu ra (PLO)
- `admission_requirements` - Chuẩn đầu vào
- `workload` - Khối lượng học tập
- `curriculum_structure` - Cấu trúc CTĐT
- `teaching_method` - Phương pháp giảng dạy
- `assessment` - Phương pháp đánh giá
- `career_opportunities` - Vị trí việc làm
- `graduation_requirements` - Điều kiện tốt nghiệp

### Endpoints

#### `POST /api/v1/sections`

Create a new section.

**Request Body**:

```json
{
  "curriculumId": "550e8400-e29b-41d4-a716-446655440000",
  "sectionKey": "intro",
  "title": "Giới thiệu CTĐT",
  "content": "<p>Nội dung giới thiệu chương trình đào tạo...</p>",
  "displayOrder": 1,
  "isVisible": true
}
```

**Response**: `201 Created`

---

#### `GET /api/v1/sections`

Get all sections with optional filtering.

**Query Parameters**:

- `curriculumId` (optional): Filter by curriculum ID

**Example**: `GET /api/v1/sections?curriculumId=550e8400-e29b-41d4-a716-446655440000`

**Response**: `200 OK` (ordered by `displayOrder`)

---

#### `GET /api/v1/sections/:id`

Get a specific section by ID.

**Parameters**:

- `id`: Section UUID

**Response**: `200 OK` | `404 Not Found`

---

#### `PUT /api/v1/sections/:id`

Update a section.

**Parameters**:

- `id`: Section UUID

**Request Body**: Same as POST, but all fields optional

**Response**: `200 OK` | `404 Not Found`

---

#### `PATCH /api/v1/sections/:id/reorder`

Update section display order.

**Parameters**:

- `id`: Section UUID

**Request Body**:

```json
{
  "displayOrder": 5
}
```

**Response**: `200 OK` | `404 Not Found`

---

#### `DELETE /api/v1/sections/:id`

Delete a section.

**Parameters**:

- `id`: Section UUID

**Response**: `200 OK` | `404 Not Found`

---

## Error Handling

### Validation Errors (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": [
    "code should not be empty",
    "nameVi must be shorter than or equal to 255 characters"
  ],
  "error": "Bad Request"
}
```

### Not Found (404)

```json
{
  "statusCode": 404,
  "message": "Program with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": "Not Found"
}
```

---

## Common Query Patterns

### Get current curriculum with all sections

```
GET /api/v1/curriculums/current/:programId
```

### Get all sections for a curriculum (ordered)

```
GET /api/v1/sections?curriculumId=:curriculumId
```

### Get all active undergraduate programs

```
GET /api/v1/programs?status=active&level=undergraduate
```

### Get all courses in a curriculum

```
GET /api/v1/courses/curriculum/:curriculumId
```

### Add a course to a curriculum

```
POST /api/v1/curriculum-courses
Body: { "curriculumId": "...", "courseId": "..." }
```

---

## Future Considerations

### Authentication

Currently, the API does not implement authentication. For production use, consider adding:

- JWT-based authentication
- Role-based access control (RBAC)
- API key authentication for external integrations

### Pagination

For large datasets, consider implementing pagination:

- Query parameters: `page`, `limit`
- Response metadata: `total`, `page`, `pageSize`

### Caching

Consider implementing caching for frequently accessed resources:

- Redis for caching current curriculums
- ETags for conditional requests
