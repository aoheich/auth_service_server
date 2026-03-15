# Auth Service Server API

## Overview
This project is a robust authentication and authorization service built with Node.js, Express, and Prisma, supporting both JSON Web Tokens (JWT) and secure session-based authentication mechanisms. It provides endpoints for user registration, login, logout, and profile management with role-based access control.

## Features
- **JWT Authentication**: Implements secure token-based authentication with access and refresh tokens, supporting token rotation and invalidation.
- **Session-Based Authentication**: Utilizes `express-session` with a Prisma-backed session store for stateful authentication.
- **Role-Based Access Control (RBAC)**: Supports `USER` and `ADMIN` roles, allowing fine-grained access to specific API resources for both JWT and session authenticated users.
- **Password Hashing**: Enhances security by hashing user passwords using `bcrypt` with a pepper.
- **Input Validation**: Ensures data integrity and security with comprehensive input validation using `express-validator`.
- **Database Integration**: Leverages Prisma ORM to interact with a MySQL database for efficient data management.

## Getting Started

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/aoheich/auth_service_server.git
    cd auth_service_server
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Prisma and Database**:
    Ensure your MySQL database is running and accessible.
    ```bash
    npx prisma migrate dev --name init
    npx prisma generate
    ```
    This command will create the necessary tables in your database and generate the Prisma client.

4.  **Start the Server**:
    ```bash
    npm start
    ```
    The server will start on the port specified in your `.env` file.

### Environment Variables
Create a `.env` file in the root directory and populate it with the following variables:

-   `PORT`: The port on which the server will run.
    -   Example: `PORT=5000`
-   `DATABASE_URL`: The connection string for your MySQL database.
    -   Example: `DATABASE_URL="mysql://user:password@localhost:3306/auth_db"`
-   `SESSION_SECRET`: A strong, random string used to sign the session ID cookie.
    -   Example: `SESSION_SECRET="super-secret-session-key-random-string"`
-   `PEPPER`: A secret string added to passwords before hashing for enhanced security.
    -   Example: `PEPPER="a-very-secret-pepper-string"`
-   `ACCESS_T_SECRET`: A strong, random string used to sign JWT access tokens.
    -   Example: `ACCESS_T_SECRET="jwt-access-secret-random-string"`
-   `REFRESH_T_SECRET`: A strong, random string used to sign JWT refresh tokens.
    -   Example: `REFRESH_T_SECRET="jwt-refresh-secret-random-string"`

## API Documentation

### Base URL
`/api`

### Endpoints
#### POST /jwt/register
**Request**:
```json
{
  "email": "user@example.com",
  "password": "strongpassword"
}
```
**Response**:
```json
{
  "msg": "User created Successfully",
  "access_token": "eyJhbGciOiJIUzI1Ni..."
}
```
**Errors**:
- 400: Email already exists
- 400: Validation errors (e.g., "Email field must be present")
- 500: Internal Server Error

#### POST /jwt/login
**Request**:
```json
{
  "email": "user@example.com",
  "password": "strongpassword"
}
```
**Response**:
```json
{
  "msg": "Login Successfull",
  "access_token": "eyJhbGciOiJIUzI1Ni..."
}
```
**Errors**:
- 401: Invalid Credentials
- 400: Validation errors (e.g., "Email field must be present")
- 500: Internal Server Error

#### POST /jwt/refresh
**Request**:
Requires `refresh_token` in cookies.
(No body payload)
**Response**:
```json
{
  "msg": "Refresh Successfull",
  "access_token": "eyJhbGciOiJIUzI1Ni..."
}
```
**Errors**:
- 401: Token Missing (if refresh token not in cookies)
- 401: Invalid Token (if refresh token is invalid, expired, or revoked)
- 500: Internal Server Error

#### POST /jwt/logout
**Request**:
Requires `refresh_token` in cookies.
(No body payload)
**Response**:
```json
"Logout Successful"
```
**Errors**:
- 401: Token Missing (if refresh token not in cookies)
- 401: Invalid Token (if refresh token is invalid or already revoked)
- 500: Internal Server Error

#### GET /jwt/profile
**Request**:
Requires a valid JWT access token in the `Authorization: Bearer <token>` header.
(No body payload)
**Response**:
```json
{
  "email": "user@example.com",
  "id": "uuid-of-user",
  "role": "USER"
}
```
**Errors**:
- 401: Authorization Required
- 401: Invalid Authorization Format
- 401: Invalid or Expired Token
- 401: Token Invalidated (if token version mismatch)
- 500: Internal Server Error

#### GET /jwt/admin
**Request**:
Requires a valid JWT access token with `ADMIN` role in the `Authorization: Bearer <token>` header.
(No body payload)
**Response**:
```json
{
  "msg": "Admin-Only"
}
```
**Errors**:
- 401: Authorization Required
- 401: Invalid Authorization Format
- 401: Invalid or Expired Token
- 401: Token Invalidated (if token version mismatch)
- 403: Unauthorized Access (if user is not ADMIN)
- 500: Internal Server Error

#### POST /session/register
**Request**:
```json
{
  "email": "user@example.com",
  "password": "strongpassword"
}
```
**Response**:
```json
{
  "msg": "User created Successfully"
}
```
**Errors**:
- 400: Email already exists
- 400: Validation errors (e.g., "Email field must be present")
- 500: Internal Server Error

#### POST /session/login
**Request**:
```json
{
  "email": "user@example.com",
  "password": "strongpassword"
}
```
**Response**:
```json
{
  "msg": "Login Successfull"
}
```
**Errors**:
- 401: Invalid Credentials
- 400: Validation errors (e.g., "Email field must be present")
- 500: Internal Server Error

#### POST /session/logout
**Request**:
(No body payload)
**Response**:
```json
{
  "msg": "Logout Successful"
}
```
**Errors**:
- 500: Internal Server Error

#### GET /session/profile
**Request**:
Requires a valid session cookie (`connect.sid`).
(No body payload)
**Response**:
```json
{
  "id": "uuid-of-user",
  "role": "USER",
  "email": "user@example.com"
}
```
**Errors**:
- 401: Not Authenticated
- 500: Internal Server Error

#### GET /session/admin
**Request**:
Requires a valid session cookie (`connect.sid`) with `ADMIN` role.
(No body payload)
**Response**:
```json
{
  "msg": "Admin-Only"
}
```
**Errors**:
- 401: Not Authenticated
- 403: Unauthorized Access (if user is not ADMIN)
- 500: Internal Server Error

## Usage

Once the server is running and you have registered/logged in, you can interact with the API endpoints.

**For JWT Authentication:**
1.  **Register/Login**: Use `/api/jwt/register` or `/api/jwt/login` to obtain an `access_token` and a `refresh_token` (stored as an `httpOnly` cookie).
2.  **Access Protected Routes**: Include the `access_token` in the `Authorization` header of your requests as a Bearer token: `Authorization: Bearer <your_access_token>`.
3.  **Refresh Token**: If your access token expires, send a request to `/api/jwt/refresh`. The server will use the `refresh_token` cookie to issue a new access token and a new refresh token.

**For Session-Based Authentication:**
1.  **Register/Login**: Use `/api/session/register` or `/api/session/login`. A session cookie (`connect.sid`) will be set automatically.
2.  **Access Protected Routes**: Your browser will automatically send the `connect.sid` cookie with subsequent requests to protected routes.

## Technologies Used

| Technology                   | Description                                                | Link                                                                        |
| :--------------------------- | :--------------------------------------------------------- | :-------------------------------------------------------------------------- |
| **Node.js**                  | JavaScript runtime environment                             | [nodejs.org](https://nodejs.org/)                                           |
| **Express.js**               | Fast, unopinionated, minimalist web framework for Node.js  | [expressjs.com](https://expressjs.com/)                                     |
| **Prisma ORM**               | Next-generation ORM for Node.js and TypeScript             | [prisma.io](https://www.prisma.io/)                                         |
| **MySQL**                    | Popular open-source relational database management system  | [mysql.com](https://www.mysql.com/)                                         |
| **Bcrypt**                   | Library to hash passwords                                  | [npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt)            |
| **JSON Web Tokens (JWT)**    | Standard for creating access tokens                        | [jwt.io](https://jwt.io/)                                                   |
| **Express Session**          | Middleware for managing session state                      | [npmjs.com/package/express-session](https://www.npmjs.com/package/express-session) |
| **Prisma Session Store**     | Session store for Express using Prisma                     | [npmjs.com/package/@quixo3/prisma-session-store](https://www.npmjs.com/package/@quixo3/prisma-session-store) |
| **Cookie Parser**            | Middleware for parsing cookie headers                      | [npmjs.com/package/cookie-parser](https://www.npmjs.com/package/cookie-parser) |
| **Express Validator**        | Middleware for request data validation                     | [express-validator.github.io](https://express-validator.github.io/)         |

## Contributing

We welcome contributions to enhance this Auth Service Server API! Please follow these guidelines:

*   **Fork the repository**: Start by forking the project to your GitHub account.
*   **Create a new branch**: Name your branch descriptively (e.g., `feature/add-social-login` or `fix/jwt-bug`).
*   **Make your changes**: Implement your features or bug fixes.
*   **Test your changes**: Ensure all existing tests pass and add new tests for your modifications if applicable.
*   **Commit your changes**: Write clear, concise commit messages.
*   **Open a Pull Request**: Submit a pull request to the `main` branch, describing your changes in detail.

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

## Author Info

**[Your Name]**
*   [LinkedIn Profile](https://www.linkedin.com/in/yourusername)
*   [X (formerly Twitter)](https://x.com/yourusername)

---

### Badges

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-darkblue?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)