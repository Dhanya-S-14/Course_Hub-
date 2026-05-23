# 🚀 CourseHub Deployment Guide

This guide will help you deploy your CourseHub project with MongoDB on Railway or Render.

---

## 📋 Prerequisites

- GitHub account
- Railway or Render account (both have free tiers)

---

## Step 1: Set Up MongoDB Atlas (Free Cloud Database)

1. **Go to:** https://www.mongodb.com/atlas
2. **Sign up** with your email (free account)
3. **Create a Free Cluster:**
   - Click "Build a Database"
   - Choose FREE tier (Shared)
   - Select region closest to you (Mumbai for India)
   - Click "Create"

4. **Create Database User:**
   - Go to "Security" → "Database Access"
   - Click "Add New Database User"
   - Username: `coursehub_user`
   - Password: (generate a secure password - SAVE THIS!)
   - Role: "Read and Write to any database"
   - Click "Add User"

5. **Configure Network Access:**
   - Go to "Security" → "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Get Connection String:**
   - Go to "Deployment" → "Database"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with the password you saved

   Example:
   ```
   mongodb+srv://coursehub_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/coursehub?retryWrites=true&w=majority
   ```

---

## Step 2: Push Code to GitHub

1. **Create a new GitHub repository:**
   - Go to https://github.com
   - Click "New repository"
   - Name: `coursehub`
   - Make it Public
   - Click "Create repository"

2. **Push your code (in project folder):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - CourseHub project"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/coursehub.git
   git push -u origin main
   ```

---

## Step 3: Deploy on Railway (Recommended)

### Option A: Railway

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize GitHub
   - Select your `coursehub` repository

4. **Configure Environment Variables:**
   - Click on your deployment
   - Go to "Variables" tab
   - Add these variables:

   ```
   MONGODB_URI = mongodb+srv://coursehub_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/coursehub?retryWrites=true&w=majority
   PORT = 3000
   NODE_ENV = production
   ```

5. **Set Start Command:**
   - Go to "Settings" tab
   - Under "Start Command", add:
   ```
   npm start
   ```

6. **Deploy:**
   - Railway will automatically deploy
   - Wait for deployment to complete
   - Your app will be live at: `https://your-project.railway.app`

---

### Option B: Render

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Create Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Select `coursehub` repository

4. **Configure Settings:**
   - Name: `coursehub`
   - Region: Singapore (closest to India)
   - Branch: `main`
   - Root Directory: (leave empty)
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`

5. **Add Environment Variables:**
   - Click "Environment" tab
   - Add variable:
   ```
   MONGODB_URI = mongodb+srv://coursehub_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/coursehub?retryWrites=true&w=majority
   PORT = 3000
   NODE_ENV = production
   ```

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment
   - Your app will be live at: `https://coursehub.onrender.com`

---

## Step 4: Update MongoDB Data

Your courses are stored locally. To add them to the cloud database:

1. **After deployment, visit:**
   ```
   https://your-app-url.com/api/seed-courses
   ```
   (If you have seed endpoints - check your server.js)

2. **Or manually insert courses via MongoDB Atlas:**
   - Go to MongoDB Atlas
   - Click "Browse Collections"
   - Select `coursehub` database
   - Add your course documents

---

## Step 5: Test Your Deployment

1. **Open your deployed URL**
2. **Test:**
   - Homepage loads
   - Course search works
   - Jobs page shows companies
   - Prep pages open correctly

---

## 🔧 Troubleshooting

### Common Issues:

**1. MongoDB Connection Error:**
- Check your MONGODB_URI is correct
- Ensure database user password is correct
- Check network access allows all IPs

**2. 404 Errors:**
- Make sure all HTML files are pushed to GitHub
- Check if static files are being served

**3. Build Failed:**
- Check package.json scripts are correct
- Ensure all dependencies are listed

**4. CORS Errors:**
- Your server.js already has CORS enabled
- If issues persist, check browser console

---

## 📝 Important Notes

- **Free Tier Limits:**
  - Railway: 500 hours/month, sleeps after 7 days
  - Render: Sleeps after 15 min inactivity (first 90 days free)

- **MongoDB Atlas Free Tier:**
  - 512MB storage
  - Good for development/small projects
  - Shared CPU/RAM

- **Custom Domain:**
  - Railway: Upgrade to paid plan
  - Render: Connect custom domain in settings (free)

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access configured
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Railway/Render connected to GitHub
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] App tested and working

---

## 🌐 Your Live URLs

After deployment, fill in your URLs:

- **Railway:** `https://coursehub.railway.app`
- **Render:** `https://coursehub.onrender.com`
- **MongoDB Atlas:** `https://cloud.mongodb.com`

---

## 📞 Need Help?

If you face issues:
1. Check Railway/Render deployment logs
2. Verify MongoDB Atlas connection string
3. Ensure all files are committed to GitHub

Good luck with your deployment! 🚀
