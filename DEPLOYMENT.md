# Deployment Guide - Dashboard R2B

## 🚀 Deployment Options

### Option 1: Deploy to Vercel (Easiest - Recommended)

Vercel is the platform made by the creators of Next.js. Deployment is one-click.

#### Prerequisites
- GitHub account (already have repo connected)
- Vercel account (free)

#### Steps

1. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select "bicaradigital/Dashboard-R2B" repository
   - Click "Import"

2. **Configure Environment Variables**
   - Vercel will ask for environment variables
   - Add these from your Supabase project:
     ```
     NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
     SUPABASE_URL=<your-supabase-url>
     SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
     POSTGRES_URL=<your-postgres-url>
     ```

3. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

#### Get Updates
- Every push to `main` branch auto-deploys
- Check deployment status on Vercel dashboard

---

### Option 2: Deploy to Your Own Server

If you want to self-host on your own server/VPS:

#### Prerequisites
- Node.js 18+ installed
- PostgreSQL/Supabase database
- SSH access to server

#### Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Copy to server**
   ```bash
   scp -r .next/ your-server:/app/
   scp package.json your-server:/app/
   scp package-lock.json your-server:/app/
   ```

3. **Install and run on server**
   ```bash
   cd /app
   npm install
   npm run start
   ```

4. **Setup reverse proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       location / {
           proxy_pass http://localhost:3000;
       }
   }
   ```

---

### Option 3: Docker Deployment

If you want to use Docker:

#### Create Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Build and run
```bash
docker build -t dashboard-r2b .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=... dashboard-r2b
```

---

## ✅ Pre-Deployment Checklist

- [ ] Email verification is working locally
- [ ] Login/signup flow tested
- [ ] Dashboard loads correctly
- [ ] No console errors in browser
- [ ] All environment variables are set
- [ ] Database migrations completed
- [ ] Team members can access dashboard

---

## 🔒 Security Before Deployment

1. **Never commit secrets**
   - Keep `.env.local` in `.gitignore` ✓
   - Never push SUPABASE_SERVICE_ROLE_KEY to GitHub

2. **Set strong admin email**
   - Update admin check in `lib/auth.ts`
   - Change from "rumahretortbersama1@gmail.com" to your email

3. **Enable HTTPS**
   - Vercel does this automatically
   - Self-hosted: Use Let's Encrypt SSL

4. **Configure CORS**
   - If API calls from frontend, setup CORS in Supabase

5. **Backup database**
   - Supabase handles daily backups (paid tier)
   - Self-hosted: Setup backup strategy

---

## 🧪 Post-Deployment Testing

After deployment, test these:

1. **Signup flow**
   - Create new account with test email
   - Verify auto-login works

2. **Login/Logout**
   - Login with account
   - Logout and login again
   - Verify session persists

3. **Protected routes**
   - Try accessing `/dashboard` without login
   - Should redirect to login

4. **Email verification** (production)
   - Check if verification email arrives
   - Click email link
   - Verify redirect works

5. **Database queries**
   - Load dashboard
   - Check if data displays correctly
   - Verify no 500 errors

---

## 📊 Monitoring

### Vercel
- Dashboard shows deployment status
- Real-time logs available
- Analytics for traffic

### Self-hosted
- Monitor CPU, memory, disk
- Check application logs
- Monitor database performance

---

## 🔄 Continuous Deployment

### Auto-deploy on push
```bash
# Setup GitHub Actions (optional)
# Vercel does this automatically
```

### Manual deployment
```bash
# Push to main branch
git push origin main

# Vercel will auto-deploy
# Or run deployment command
vercel deploy --prod
```

---

## 🆘 Deployment Troubleshooting

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Verify all dependencies installed: `npm install`
- Check for TypeScript errors: `npm run build`

### Application crashes after deploy
- Check logs in Vercel dashboard
- Verify environment variables are set
- Check database connection

### "Cannot find module" errors
- Clear `.next` folder
- Run `npm install` again
- Redeploy

### Slow page loads
- Enable Vercel's Edge Functions
- Optimize images
- Check database query performance

---

## 📈 Scaling Tips

1. **Database**
   - Supabase auto-scales
   - Add read replicas for high traffic

2. **Backend**
   - Vercel handles auto-scaling
   - No additional setup needed

3. **Frontend**
   - Use Vercel's CDN (automatic)
   - Cache static assets
   - Optimize images

---

## 📝 Environment Variables Reference

| Variable | Source | Example |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings > URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings > API Keys | `eyJhbG...` |
| `SUPABASE_URL` | Same as above | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings > Service Key | `eyJhbG...` |
| `POSTGRES_URL` | Supabase > Databases | `postgresql://...` |

---

**Your app is ready to deploy! Choose your preferred option above and you're live!** 🚀
