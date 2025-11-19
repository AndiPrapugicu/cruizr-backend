# Cruizr Backend - Deployment Guide

## ✅ Build Configuration Fixed

### Changes Made:
1. **Fixed start command**: Changed from `node dist/main.js` to `node dist/src/main.js`
   - NestJS compiles to `dist/src/` not `dist/`
   
2. **Added PORT environment variable support**: 
   - Server now uses `process.env.PORT || 3000`
   - Compatible with Render's dynamic port assignment

3. **Fixed uploads path**: 
   - Adjusted static file serving for compiled structure
   
4. **Created render.yaml**: 
   - Proper Render configuration file
   - Node.js version: 22.16.0

## 🚀 Deployment to Render

### Option 1: Using render.yaml (Recommended)
1. Commit all changes to GitHub
2. Connect repository to Render
3. Render will automatically use `render.yaml` configuration

### Option 2: Manual Configuration
If not using render.yaml, configure these settings in Render dashboard:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/src/main.js`
- **Node Version**: 22.16.0

### Environment Variables to Set on Render:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://cruizr-frontend.vercel.app
API_URL=https://your-app.onrender.com
JWT_SECRET=<your-secret>
DATABASE_URL=<your-database-url>
# Add other .env variables as needed
```

**Important:** After deployment, update your frontend's `VITE_API_URL` to point to your Render backend URL!

## 📝 Local Development

```bash
# Install dependencies
npm install

# Run in development
npm run start:dev

# Build for production
npm run build

# Start production build
npm run start:prod
```

## ✅ Verification

After deployment, check:
- Health check: `https://your-app.onrender.com/`
- API docs: `https://your-app.onrender.com/api`

## 🐛 Troubleshooting

### "Cannot find module" Error
- ✅ **FIXED**: Ensure start command is `node dist/src/main.js`

### Port Binding Issues
- ✅ **FIXED**: Using `process.env.PORT` for dynamic port assignment

### Build Failures
- Check Node.js version matches (22.16.0)
- Ensure all dependencies are in `dependencies` not `devDependencies`
