# Module 1: Authentication & Access Control

## 1. Module Overview
The Authentication & Access Control module is responsible for securing the ShopSphere admin panel. It handles admin login, session persistence, secure page routing (middleware route guarding), and session termination (logout).

## 2. Features in this Module
- **Admin Authentication**: Safe login system using email and password.
- **Route Guarding & Protection**: Next.js middleware checking session tokens on every route request under dashboard endpoints.
- **Persistent Sessions**: User remains logged in across page refreshes until token expiration or explicit sign-out.
- **Secure Sign-out**: Revokes current authentication token, clearing local storage/cookies and redirecting the browser to the login page.

## 3. User Interactions
- **Unauthorized Visit**: Admin attempts to access a protected page (e.g. `/` or `/products`) without an active session -> Middleware intercepts request -> Redirects to `/login`.
- **Admin Sign-In**:
  1. User navigates to `/login`.
  2. Enters email and password.
  3. Clicks "Sign In".
  4. On success: Dashboard welcomes user, stores session credentials, redirects to `/`.
  5. On failure: Form highlights input, displays specific error message (e.g., "Invalid credentials").
- **Admin Logout**:
  1. User clicks the "Logout" button on sidebar.
  2. Application terminates Supabase session, displays success notification, and redirects to `/login`.

## 4. Data Requirements
- **Inputs**:
  - `email` (string, required, standard email validation format)
  - `password` (string, required, minimum 8 characters)
- **Session State Metadata**:
  - `access_token` (JWT string)
  - `refresh_token` (string)
  - `expires_at` (unix timestamp integer)
  - User details (e.g., role `admin`, unique user ID)

## 5. API Requirements (High Level)
- **Supabase Auth API**:
  - `supabase.auth.signInWithPassword({ email, password })`: Checks credentials and returns JWT token.
  - `supabase.auth.signOut()`: Ends active session.
  - `supabase.auth.getSession()`: Validates ongoing cookie/token validity on initial render or middleware check.

## 6. Edge Cases
- **Network Connection Drop**: Admin attempts authentication offline -> Application must intercept and display a clean "No Network Connection" message rather than a generic authentication error.
- **Token Expiry During Usage**: Admin has dashboard open while session expires -> API request returns 401 Unauthorized -> Application catches exception and redirects user to `/login` with message "Session expired. Please log in again."
- **Brute Force Login Attacks**: Repeated incorrect passwords -> Handled by Supabase backend (automatically applies IP lockouts or rate limits).
- **Back-Button Traversal**: Admin logs out and clicks browser "Back" button -> Application forces redirect to login and prevents viewing of cached HTML views.
