# 🚀 Vercel Frontend Deployment - Step by Step

## Go to: https://vercel.com/new

---

## **STEP 1: Connect Your Repository**

### Option A: If your code is on GitHub
- Click **Import Git Repository**
- Paste: `https://github.com/chandan0000001/DSA_STACK_FROM_SHEET`
- Click **Import**

### Option B: If you don't have GitHub (Upload Folder)
- Click **Import from Git**
- Select **GitLab** or **Bitbucket** or upload manually
- Or continue with next steps

---

## **STEP 2: Configure Project**

### Project Name:
```
dsa-stack-frontend
```

### Root Directory:
```
Frontend
```

⭐ **IMPORTANT:** Set to `Frontend` (not the entire project!)

### Framework Preset:
```
Vite
```

---

## **STEP 3: Build Command**

Should be auto-filled as:
```
npm run build
```

If not, enter it manually.

---

## **STEP 4: Output Directory**

Should be:
```
dist
```

---

## **STEP 5: Environment Variables** ⭐ (IMPORTANT!)

Click **Environment Variables** and add 2 variables:

### Variable 1:
- Key: `VITE_API_URL`
- Value: `https://your-backend-on-render.onrender.com` 
  
  *(Get this URL from your Render deployment)*

### Variable 2:
- Key: `VITE_GOOGLE_CLIENT_ID`
- Value: `your_google_client_id_here`

---

## **STEP 6: Deploy!**

Click **Deploy** button!

---

## **WAIT FOR DEPLOYMENT** ⏳

You'll see:
```
Building...
Installing dependencies...
Running build...
✅ Production
```

Takes 2-3 minutes.

---

## **After Deployment - Get Your Frontend URL**

Once done, you'll get:
```
https://dsa-stack-frontend.vercel.app
```

---

## **FINAL STEP: Update Backend Environment**

1. Go back to Render dashboard
2. Select your backend: `dsa-stack-backend`
3. Click **Environment**
4. Update `CLIENT_URL`:
   ```
   https://dsa-stack-frontend.vercel.app
   ```
5. Click **Save Changes**

The backend will auto-redeploy with the new URL ✅

---

## **🎉 YOUR APP IS LIVE!**

| Component | URL |
|-----------|-----|
| **Frontend** | https://dsa-stack-frontend.vercel.app |
| **Backend** | https://dsa-stack-backend.onrender.com |
| **Database** | MongoDB Atlas ✅ |

---

## **✅ Test Your App:**

1. Open: https://dsa-stack-frontend.vercel.app
2. Try **Email Registration**
3. Try **Google Sign-In**
4. Try **DSA Sheet** (requires login)
5. Try **Daily Problems**

Everything should work! 🚀
