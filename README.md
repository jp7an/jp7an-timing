# jp7an-timing

Modern monorepo for timing application with Next.js frontend and Express backend.

## Repository Structure

```
jp7an-timing/
├── apps/
│   ├── web/          # Next.js frontend/admin (Vercel)
│   └── api/          # Express backend API (Railway/Render)
├── .github/
│   └── workflows/    # CI/CD workflows
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Prerequisites

- Node.js 20 or higher
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jp7an/jp7an-timing.git
cd jp7an-timing
```

### 2. Setup environment variables

Copy the example environment file and configure your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual values for:
- `ADMIN_PASSWORD` - Password for admin access
- `GATEWAY_HMAC_SECRET` - Secret for HMAC validation
- `DATABASE_URL` - PostgreSQL connection string
- Other API keys and email service credentials as needed

### 3. Install dependencies

#### Frontend (Next.js)
```bash
cd apps/web
npm install
```

#### Backend (Express)
```bash
cd apps/api
npm install
```

### 4. Development

#### Start Frontend
```bash
cd apps/web
npm run dev
```
The frontend will be available at http://localhost:3000

#### Start Backend
```bash
cd apps/api
npm run dev
```
The API will be available at http://localhost:3001

## Building for Production

### Frontend
```bash
cd apps/web
npm run build
npm start
```

### Backend
```bash
cd apps/api
npm run build
npm start
```

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `apps/web`
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main

### Backend (Railway/Render)

#### Railway
1. Create a new project in Railway
2. Connect your GitHub repository
3. Set the root directory to `apps/api`
4. Configure environment variables
5. Deploy automatically on push to main

#### Render
1. Create a new Web Service
2. Connect your GitHub repository
3. Set the root directory to `apps/api`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Configure environment variables
7. Deploy

## Environment Variables

See `.env.example` for all required and optional environment variables.

### Required Variables
- `ADMIN_PASSWORD` - Admin authentication
- `GATEWAY_HMAC_SECRET` - API security
- `DATABASE_URL` - Database connection

### Optional Variables
- API keys for third-party services
- Email service configuration (SMTP)

## Testing

### Frontend
```bash
cd apps/web
npm test
```

### Backend
```bash
cd apps/api
npm test
```

## CI/CD

GitHub Actions automatically:
- Builds both applications
- Runs tests
- Validates code quality

See `.github/workflows/build.yml` for details.

## License

MIT
