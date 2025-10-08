# 🔐 Complete JWT Authentication Process Breakdown

## Overview
Your Smart Notes App implements a secure JWT-based authentication system using httpOnly cookies. Here's how the entire process works from signup to protected route access.

---

## 🏗️ Authentication Architecture

### Core Components
- **JWT Library**: `jose` for secure token verification + `jsonwebtoken` for signing
- **Password Security**: `bcryptjs` for hashing
- **Storage**: httpOnly cookies (secure, not accessible via JavaScript)
- **Protection**: Next.js middleware for route protection

---

## 📝 Step-by-Step Authentication Flow

### 1. 🔑 **Token Creation Process**

#### Signup (`/api/auth/signup`)
```typescript
// 1. User provides email, password, name
const { email, password, name } = await req.json();

// 2. Hash password with bcrypt
const hashed = await bcrypt.hash(password, 10);

// 3. Create user in database
const user = await User.create({ email, password: hashed, name });

// 4. Generate JWT token
const token = signToken({ sub: String(user._id), email: user.email });

// 5. Set httpOnly cookie
res.cookies.set("token", token, {
  httpOnly: true,        // Prevents XSS attacks
  secure: process.env.NODE_ENV === "production",  // HTTPS only in production
  sameSite: "lax",       // CSRF protection
  path: "/",             // Available site-wide
  maxAge: 60 * 60 * 24 * 7,  // 7 days expiration
});
```

#### Login (`/api/auth/login`)
```typescript
// 1. Verify credentials
const user = await User.findOne({ email });
const ok = await bcrypt.compare(password, user.password);

// 2. Generate same JWT token
const token = signToken({ sub: String(user._id), email: user.email });

// 3. Set same httpOnly cookie
```

---

### 2. 🎫 **JWT Token Structure**

#### Token Payload
```typescript
type JwtPayload = { 
  sub: string;    // User ID (subject)
  email?: string; // User email
}

// Example token payload:
{
  "sub": "64a7b8c9d1e2f3g4h5i6j7k8",  // MongoDB ObjectId
  "email": "user@example.com",
  "iat": 1703123456,  // Issued at
  "exp": 1703728256   // Expires at (7 days later)
}
```

#### Token Signing (`src/lib/jwt.ts`)
```typescript
export function signToken(payload: JwtPayload, expiresInSeconds: number = 60 * 60 * 24 * 7) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
}
```

---

### 3. 🛡️ **Token Verification Process**

#### Your `verifyAuth` Function Breakdown
```typescript
export async function verifyAuth(token: string): Promise<JWTPayload> {
  try {
    // 1. Decode and verify the JWT signature
    const verified = await jwtVerify(
      token,                                    // The JWT token string
      new TextEncoder().encode(process.env.JWT_SECRET)  // Secret key as Uint8Array
    );
    
    // 2. Return the payload if verification succeeds
    return verified.payload;
  } catch {
    // 3. Throw error if verification fails (expired, invalid signature, etc.)
    throw new Error('Invalid token');
  }
}
```

#### How `jwtVerify` Works:
1. **Decodes** the JWT header and payload
2. **Verifies** the signature using your secret key
3. **Checks** expiration time (`exp` claim)
4. **Validates** the token structure
5. **Returns** the payload if everything is valid

---

### 4. 🔒 **Route Protection with Middleware**

#### Middleware Flow (`src/middleware.ts`)
```typescript
export async function middleware(request: NextRequest) {
  // 1. Extract token from httpOnly cookie
  const token = request.cookies.get('token');

  // 2. Check if accessing protected route
  if (request.nextUrl.pathname.startsWith('/notes')) {
    
    // 3. No token = redirect to login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('next', request.nextUrl.pathname); // Save intended destination
      return NextResponse.redirect(url);
    }

    try {
      // 4. Verify token using your verifyAuth function
      const verifiedToken = await verifyAuth(token.value);
      
      if (!verifiedToken) {
        throw new Error('Invalid token');
      }

      // 5. Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', verifiedToken.userId as string);

      return NextResponse.next({ headers: requestHeaders });
      
    } catch {
      // 6. Invalid token = redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
```

---

### 5. 🚀 **API Route Protection**

#### Protected API Example (`/api/notes`)
```typescript
async function getUserIdFromRequest(req: Request) {
  try {
    // 1. Try to get token from cookie first
    const store = await cookies();
    const tokenFromCookie = store?.get("token")?.value ?? null;
    
    // 2. Try Authorization header as fallback
    const authHeader = req.headers.get("authorization") ?? null;

    if (tokenFromCookie) {
      try {
        // 3. Verify token using your verifyToken function
        const payload = verifyToken(tokenFromCookie);
        if (payload?.sub) return payload.sub; // Return user ID
      } catch (err) {
        console.warn("Cookie token verify failed:", err);
      }
    }

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearer = authHeader.slice(7).trim();
      try {
        const payload = verifyToken(bearer);
        if (payload?.sub) return payload.sub;
      } catch (err) {
        console.warn("Authorization token verify failed:", err);
      }
    }

    return null; // No valid token found
  } catch (err) {
    console.error("getUserIdFromRequest error:", err);
    return null;
  }
}

export async function GET(req: Request) {
  // 1. Get user ID from token
  const userId = await getUserIdFromRequest(req);
  
  // 2. No valid token = unauthorized
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Use userId to fetch user's notes
  await dbConnect();
  const notes = await Note.find({ userId }).sort({ updatedAt: -1 });
  return NextResponse.json({ notes });
}
```

---

## 🔄 Complete Authentication Flow Diagram

```
1. User Signs Up/Logs In
   ↓
2. Server validates credentials
   ↓
3. Server creates JWT token with user info
   ↓
4. Server sets httpOnly cookie with token
   ↓
5. User makes request to protected route
   ↓
6. Middleware extracts token from cookie
   ↓
7. Middleware verifies token with verifyAuth()
   ↓
8. If valid: Allow access + add user info to headers
   ↓
9. If invalid: Redirect to login
```

---

## 🛡️ Security Features

### 1. **httpOnly Cookies**
- ✅ Prevents XSS attacks (JavaScript can't access cookie)
- ✅ Automatically sent with requests
- ✅ More secure than localStorage

### 2. **Token Expiration**
- ✅ 7-day expiration prevents indefinite access
- ✅ Automatic cleanup of expired tokens

### 3. **Secure Cookie Settings**
```typescript
{
  httpOnly: true,                    // No JavaScript access
  secure: process.env.NODE_ENV === "production",  // HTTPS only in production
  sameSite: "lax",                  // CSRF protection
  path: "/",                        // Site-wide access
  maxAge: 60 * 60 * 24 * 7,        // 7 days
}
```

### 4. **Password Security**
```typescript
// Hash passwords with salt rounds
const hashed = await bcrypt.hash(password, 10);

// Verify passwords securely
const ok = await bcrypt.compare(password, user.password);
```

---

## 🔧 Token Verification Breakdown

### What Happens in `verifyAuth(token)`:

1. **Token Structure Check**
   - Verifies JWT format (header.payload.signature)
   - Ensures proper base64 encoding

2. **Signature Verification**
   - Uses your JWT_SECRET to verify the signature
   - Ensures token wasn't tampered with

3. **Expiration Check**
   - Validates `exp` claim against current time
   - Rejects expired tokens

4. **Payload Extraction**
   - Returns decoded payload with user information
   - Includes `sub` (user ID) and `email`

### Error Scenarios:
- ❌ **Expired Token**: Token past expiration time
- ❌ **Invalid Signature**: Token tampered with or wrong secret
- ❌ **Malformed Token**: Invalid JWT structure
- ❌ **Missing Secret**: JWT_SECRET not configured

---

## 🚨 Logout Process

```typescript
// Clear the httpOnly cookie
export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,  // Expire immediately
  });
  return response;
}
```

---

## 🎯 Key Interview Points

### Why This Implementation is Secure:
1. **httpOnly cookies** prevent XSS attacks
2. **JWT expiration** limits exposure window
3. **Password hashing** with bcrypt protects user data
4. **Middleware protection** ensures all routes are secured
5. **Proper error handling** doesn't leak sensitive information

### Technical Highlights:
- Uses modern `jose` library for secure verification
- Implements both cookie and header authentication
- Proper TypeScript typing for payload
- Environment-based security settings
- Graceful error handling and fallbacks

This authentication system demonstrates production-ready security practices and modern web development standards!
