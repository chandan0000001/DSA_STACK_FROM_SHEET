# Workflow

This document describes the request flow and data flow for the project.

## FLOW DIGRAM

```
User
  |
  v
Browser + React App
  |
  |  API requests
  v
Backend (Express)
  |
  |  Database queries
  v
MongoDB
```

## Google Login Flow

```
User clicks Google Sign-In
  |
  v
Google Login Popup
  |
  v
React App receives ID token
  |
  v
Backend verifies token
  |
  v
Backend sets session cookies
  |
  v
User is logged in
```

## Runtime Steps LIKE YOUR GIRLFRIEND

1. User loads the frontend in the browser.
2. Frontend calls backend APIs for data and auth.
3. Backend validates requests and talks to MongoDB.
4. For Google login, frontend retrieves an ID token and sends it to backend.
5. Backend verifies token, creates or updates user, and issues cookies.
6. Subsequent requests include cookies for session continuity.
