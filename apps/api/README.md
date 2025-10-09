# JP7an-timing API Backend

## ⚠️ Important: Deployment

**DO NOT deploy this API to Vercel!**

This backend uses:
- Express HTTP server
- Socket.IO for WebSocket real-time communication
- Long-running Node.js process

These features are **incompatible with Vercel's serverless architecture**.

## Recommended Deployment Platforms

### Option 1: Railway (Recommended)
1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set root directory to `apps/api`
4. Add environment variables (see `.env.example` in project root)
5. Railway will automatically detect and deploy the Node.js app

### Option 2: Render
1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `apps/api`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables (see `.env.example` in project root)

### Option 3: Any VPS/Cloud Provider
Deploy to any platform that supports long-running Node.js processes:
- DigitalOcean App Platform
- Heroku
- AWS EC2/ECS
- Google Cloud Run
- Azure App Service

## Environment Variables

Make sure to configure all required environment variables on your deployment platform:

```
ADMIN_PASSWORD=your-admin-password
GATEWAY_HMAC_SECRET=your-hmac-secret
DATABASE_URL=postgresql://...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-email-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=https://your-frontend.vercel.app
```

See the root `.env.example` file for the complete list of environment variables.

## Local Development

```bash
cd apps/api
npm install
npm run dev
```

The API will be available at `http://localhost:3001`
