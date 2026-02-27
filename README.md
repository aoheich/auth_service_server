# 📦 auth_service_server

**Authentication Server** — Node.js + Express backend for session- and JWT-based authentication with Prisma ORM.

This service handles user signup, login, logout, session management, JWT access/refresh tokens, and role-based access control (ADMIN vs USER).

---

## 🚀 Features

- 📥 User registration (JWT & Session)  
- 🔐 Login/logout with session-based authentication  
- 🧬 Login/logout with JWT-based authentication  
- ♻️ Refresh token issuance and rotation  
- 🍪 Secure HttpOnly cookies for refresh tokens  
- 👤 Profile retrieval for authenticated users  
- 🚫 Admin-only route access with role checking  
- 🔎 Token storage with expiration and revocation  
- ✔ Password hashing with bcrypt + pepper  

---

## 🧰 Tech Stack

| Technology      | Purpose                               |
|-----------------|---------------------------------------|
| Node.js         | Runtime environment                   |
| Express         | Web framework                         |
| Prisma          | ORM for database interactions         |
| JWT             | Token-based authentication            |
| bcrypt          | Password hashing                       |
| crypto          | Secure token IDs                        |
| Express-session | Session-based authentication          |

---

## 📦 Installation

### Clone repository

```bash
git clone https://github.com/aoheich/auth_service_server.git
cd auth_service_server
Install dependencies
npm install
Setup environment variables

Create .env file:

PEPPER=your_pepper_here
ACCESS_T_SECRET=your_access_token_secret
REFRESH_T_SECRET=your_refresh_token_secret
DATABASE_URL=your_database_connection_string
Prisma setup
npx prisma generate
npx prisma migrate dev --name init
🏁 Running the Server
npm run dev

Server runs locally on http://localhost:3000/

🔹 API Reference

Base URL: http://localhost:3000/

JWT Routes
Method	Endpoint	Description
POST	/jwt/register	Create user and issue JWT tokens
POST	/jwt/login	Login and issue access/refresh tokens
POST	/jwt/logout	Revoke refresh token & clear cookie
POST	/jwt/refresh	Rotate refresh token and issue new access token
GET	/jwt/profile	Retrieve authenticated user info
GET	/jwt/admin	Admin-only route
JWT Example Request: Signup
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:

{
  "msg": "User created Successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}

Errors:

Status	Message
400	Email already exists
401	Invalid credentials
500	Internal Server Error
JWT Profile (Authenticated)

Request: GET /jwt/profile
Header: Authorization: Bearer <access_token>

Response:

{
  "id": "user-id",
  "email": "user@example.com",
  "role": "USER"
}

Errors: 401 Unauthorized if token invalid/expired.

JWT Admin (Authenticated + Admin)

Request: GET /jwt/admin
Header: Authorization: Bearer <access_token>

Response:

{
  "msg": "Admin-Only"
}

Errors: 403 Forbidden if user role ≠ ADMIN

Session Routes
Method	Endpoint	Description
POST	/session/register	Create user and session
POST	/session/login	Login via session
POST	/session/logout	Destroy session and clear cookie
GET	/session/profile	Retrieve authenticated user info
GET	/session/admin	Admin-only route
Session Example Request: Login
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:

{
  "msg": "Login Successful"
}

Errors: 401 Unauthorized for invalid credentials

Session Profile (Authenticated)

Request: GET /session/profile
Cookies: Must include session cookie connect.sid

Response:

{
  "id": "user-id",
  "email": "user@example.com",
  "role": "USER"
}
Session Admin (Authenticated + Admin)

Request: GET /session/admin
Cookies: Must include session cookie connect.sid

Response:

{
  "msg": "Admin-Only"
}

Errors: 403 Forbidden if role ≠ ADMIN

✅ Notes

Passwords hashed using bcrypt + pepper

JWT access tokens expire in 15 minutes

JWT refresh tokens expire in 1 day (rotated on refresh)

Session cookie is HttpOnly for security

Invalid credentials/tokens always return 401 Unauthorized

Admin-only access returns 403 Forbidden if not authorized

🧪 Example cURL Commands

JWT Login:

curl -X POST http://localhost:3000/jwt/login \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"securepassword"}'

Session Profile:

curl -X GET http://localhost:3000/session/profile \
--cookie "connect.sid=<session_cookie>"
🧠 Contributing

Fork the repository

Create a branch (feature/my-feature)

Make your changes

Submit a pull request

📄 License

MIT License
