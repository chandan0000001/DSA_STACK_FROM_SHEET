# ✅ GOOGLE OAUTH DEPLOYMENT CHECKLIST

## Backend - Render Dashboard

Set these Environment Variables:

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CLIENT_URL=https://dsa-stack-from-sheet.vercel.app
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password_here
NODE_ENV=production
PORT=3000
```

---

## Frontend - Vercel Dashboard

Set these Environment Variables:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_URL=https://dsa-stack-backend.onrender.com
```

---

## Google Cloud Console

### OAuth Consent Screen
1. Go to https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Type: Web application

### Authorized JavaScript Origins:
```
https://dsa-stack-from-sheet.vercel.app
http://localhost:5173
http://localhost:3000
```

### Authorized Redirect URIs:
```
https://dsa-stack-backend.onrender.com/user/google
http://localhost:3000/user/google
```

---

## Backend Code - Verify

✅ `Backend/src/app.js` - CORS fixed with multiple origins
✅ `Backend/src/routes/auth.route.js` - Has `router.post('/google', controller.googleAuth)`
✅ `Backend/src/controller/auth.controller.js` - Has googleAuth function
✅ `Backend/src/keepAlive.js` - Keeps app awake

---

## Frontend Code - Verify

✅ `Frontend/src/components/GoogleSignInButton.jsx` - Calls `/user/google`
✅ `Frontend/src/config/Axios.config.js` - Has `withCredentials: true`
✅ `Frontend/.env` - Has `VITE_GOOGLE_CLIENT_ID`

---

## Deployment Steps

1. **Update Backend Code:**
   ```bash
   cd /home/chanadan/Desktop/newCODE/DsaStack-main
   git add .
   git commit -m "Fix: Google OAuth CORS configuration"
   git push origin main
   ```

2. **Render Auto-Deploys** (3-5 min)

3. **Verify at:**
   https://dsa-stack-from-sheet.vercel.app

4. **Test Flow:**
   - Click "Continue with Google"
   - Consent in popup
   - Should redirect to /problems
   - Check browser cookies for token

---

## Debug Network Tab

When testing, check Network tab:

1. **OPTIONS /user/google** (preflight)
   - Should return 200
   - Should have `Access-Control-Allow-Origin` header

2. **POST /user/google** (actual request)
   - Should return 200
   - Should have `Set-Cookie` header for tokens

3. **Check Console Errors**
   - No CORS errors
   - No 404 errors
