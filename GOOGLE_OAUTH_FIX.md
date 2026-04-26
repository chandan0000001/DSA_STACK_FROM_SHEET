# 🔧 GOOGLE OAUTH FIX - Production Ready

## STEP 1: Fix CORS in Backend

### File: `Backend/src/app.js`

Replace CORS configuration with:

```javascript
const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/+$/, '') || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.NODE_ENV === 'production' ? 'https://dsa-stack-from-sheet.vercel.app' : null
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));
```

---

## STEP 2: Google Console Configuration

Go to: https://console.cloud.google.com/apis/credentials

### Authorized JavaScript Origins:
```
https://dsa-stack-from-sheet.vercel.app
http://localhost:3000
http://localhost:5173
```

### Authorized Redirect URIs:
```
https://dsa-stack-backend.onrender.com/user/google
http://localhost:3000/user/google
```

---

## STEP 3: Backend Environment Variables

Set on Render Dashboard:

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CLIENT_URL=https://dsa-stack-from-sheet.vercel.app
```

---

## STEP 4: Frontend Environment Variables

Set on Vercel Dashboard:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_URL=https://dsa-stack-backend.onrender.com
```

---

## STEP 5: Verify Backend Routes

### File: `Backend/src/routes/auth.route.js`

Should have:
```javascript
router.post('/google', controller.googleAuth);
```

Accessed as: `POST /user/google`

---

## STEP 6: Verify Frontend Call

### File: `Frontend/src/components/GoogleSignInButton.jsx`

Should call:
```javascript
const res = await axiosInstance.post('/user/google', {
  credential: response.credential,
})
```

Which resolves to: `https://dsa-stack-backend.onrender.com/user/google`

---

## STEP 7: Full End-to-End Flow

```
1. User clicks Google Sign-In button on Frontend
   ↓
2. Google opens consent popup
   ↓
3. User consents
   ↓
4. Google returns `credential` token to Frontend
   ↓
5. Frontend sends POST /user/google with credential
   ↓
6. Backend verifies token with Google servers
   ↓
7. Backend creates/updates user in MongoDB
   ↓
8. Backend issues JWT cookies
   ↓
9. Frontend receives user data
   ↓
10. Frontend navigates to /problems
```

---

## STEP 8: Deploy & Test

1. Update `Backend/src/app.js` with CORS fix
2. Push to GitHub
3. Render redeploys automatically
4. Test at: https://dsa-stack-from-sheet.vercel.app

---

## TROUBLESHOOTING

### CORS still blocked?
- Clear browser cache (Ctrl+Shift+Delete)
- Check Network tab → OPTIONS request
- Verify CLIENT_URL in Render env

### 404 on /user/google?
- Check if route exists in `auth.route.js`
- Verify frontend is calling correct URL (check Network tab)
- Check `VITE_API_URL` on frontend

### Google token verification fails?
- Verify GOOGLE_CLIENT_ID matches in Render env
- Check token hasn't expired (< 1 hour)
- Verify Google Console has correct origins
