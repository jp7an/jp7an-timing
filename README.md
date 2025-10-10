# jp7an-timing

Modern timing system for running events with support for multiple race modes (Normal, Backyard, Varvlopp, Tidslopp).

## Features

### Race Modes
- **Normal**: Traditional race with start and finish times
- **Backyard**: Last person standing format (yard-based loops)
- **Varvlopp**: Fixed number of laps, winner is fastest
- **Tidslopp**: Fixed time limit, winner covers most distance

### Core Functionality
- **Registration**: Public registration form with GDPR consent
- **Admin Panel**: Full event management, participant management, CSV import/export
- **Live Results**: Real-time results with WebSocket updates
- **Chip Distribution**: EPC/Bib assignment with USB reader support
- **Email Notifications**: Automatic confirmation emails
- **Swish Integration**: QR code generation for payments
- **Audit Logging**: Track all critical changes
- **CSV Import/Export**: Support for both UTF-8 and CP1252 encoding

## Repository Structure

```
jp7an-timing/
├── apps/
│   ├── web/          # Next.js 14 frontend (Vercel)
│   │   ├── src/
│   │   │   ├── app/           # Pages (Next.js App Router)
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # API client & utilities
│   │   │   └── hooks/         # Custom React hooks
│   │   └── ...
│   └── api/          # Express backend API (Railway/Render)
│       ├── src/
│       │   ├── routes/        # API endpoints
│       │   ├── modes/         # Race mode calculators
│       │   ├── middleware/    # Auth & HMAC verification
│       │   ├── utils/         # Email, QR, CSV utilities
│       │   └── config/        # Prisma configuration
│       ├── prisma/
│       │   └── schema.prisma  # Database schema
│       └── ...
├── .github/
│   └── workflows/    # CI/CD workflows
├── .env.example      # Environment variables template
└── README.md         # This file
```

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- PostgreSQL database (Neon recommended)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jp7an/jp7an-timing.git
cd jp7an-timing
```

### 2. Setup environment variables

#### Backend API
```bash
cp .env.example apps/api/.env
```

Edit `apps/api/.env` with your actual values:
- `ADMIN_PASSWORD` - Password for admin access
- `GATEWAY_HMAC_SECRET` - Secret for HMAC validation from passage gateway
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `SMTP_USER` and `SMTP_PASSWORD` - Email service credentials
- `EMAIL_FROM` - Email address to send from (paltmilen@gmail.com)

#### Frontend
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
- `NEXT_PUBLIC_API_URL` - API URL (http://localhost:3001 for development)

### 3. Setup database

#### Generate Prisma Client
```bash
cd apps/api
npm install
npx prisma generate
```

#### Push schema to database
```bash
npx prisma db push
```

### 4. Install dependencies

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

### 5. Development

#### Start Backend
```bash
cd apps/api
npm run dev
```
The API will be available at http://localhost:3001

#### Start Frontend
```bash
cd apps/web
npm run dev
```
The frontend will be available at http://localhost:3000

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

⚠️ **VIKTIGT: Systemet ska köras på webben, inte localhost i produktion!**

Se detaljerad deployment-guide i:
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Steg-för-steg deployment guide
- **[TEST_PROTOCOL.md](./TEST_PROTOCOL.md)** - Testning och felsökning

### Snabbstart: Nödvändig konfiguration

#### Miljövariabler som MÅSTE konfigureras:

**Backend (Railway/Render):**
- `DATABASE_URL` - PostgreSQL från Neon
- `ADMIN_PASSWORD` - Ditt admin-lösenord
- `FRONTEND_URL` - Din Vercel URL (**INTE localhost!**)
- Alla SMTP-variabler för email

**Frontend (Vercel):**
- `NEXT_PUBLIC_API_URL` - Din Railway/Render URL (**INTE localhost!**)

### Database Setup (Neon)

1. Create a Neon PostgreSQL database at https://neon.tech
2. Copy the connection string
3. Add to `DATABASE_URL` in backend `.env`
4. Run `npx prisma db push` to create tables

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. **Important**: In project settings, set the root directory to `apps/web`
3. Framework Preset: Next.js (should be auto-detected)
4. Build Command: `npm run build` (default)
5. Output Directory: `.next` (default)
6. Install Command: `npm install` (default)
7. Configure environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
8. Deploy automatically on push to main

**Note**: This is a monorepo. Do NOT add `.vercelignore` files in subdirectories as they can interfere with the build process. The root directory setting (`apps/web`) is sufficient to isolate the frontend deployment.

### Backend (Railway) **← DEPLOY API HERE, NOT ON VERCEL!**

⚠️ **Important**: The API backend uses Express + Socket.IO and **must NOT be deployed to Vercel**. Use Railway, Render, or any platform that supports long-running Node.js processes.

1. Create a new project in Railway
2. Connect your GitHub repository
3. Set the root directory to `apps/api`
4. Configure all environment variables from .env.example
5. Deploy automatically on push to main

### Backend (Render - Alternative)

1. Create a new Web Service
2. Connect your GitHub repository
3. Set the root directory to `apps/api`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Configure all environment variables
7. Deploy

## Usage Guide

### For Organizers

1. **Create an Event**:
   - Login to `/admin` with admin password
   - Go to admin dashboard
   - Create new event with race mode settings
   - Create classes if needed

2. **Manage Registrations**:
   - Share registration link: `/anmalan?event=your-event-slug`
   - View participants in admin dashboard
   - Import participants from CSV if needed

3. **Chip Distribution**:
   - Login to admin first at `/admin`
   - Use `/chiputlamning` page (requires admin authentication)
   - Search for participants
   - Assign EPC chips and bib numbers
   - USB RFID reader supported

4. **Live Results**:
   - Share live results link: `/live/your-event-slug`
   - Results update in real-time via WebSocket
   - Sortable columns, clickable names

### For Participants

1. **Registration**:
   - Go to `/anmalan`
   - Select event and fill in details
   - Accept GDPR policy
   - Receive confirmation email with registration number

2. **Live Results**:
   - Watch live results at `/live/event-slug`
   - See your position, time, laps, distance
   - Click on name for detailed passage history

## Race Mode Configuration

### Normal Mode
```json
{
  "mode": "NORMAL",
  "settings": {}
}
```

### Backyard Mode
```json
{
  "mode": "BACKYARD",
  "settings": {
    "yardDistance": 6706,
    "yardTimeLimit": 3600000
  }
}
```

### Varvlopp Mode
```json
{
  "mode": "VARVLOPP",
  "settings": {
    "totalLaps": 10
  }
}
```

### Tidslopp Mode
```json
{
  "mode": "TIDSLOPP",
  "settings": {
    "timeLimit": 3600000,
    "lapDistance": 400
  }
}
```

## CSV Import Format

### Supported Headers (Swedish/English)
- Förnamn / FirstName
- Efternamn / LastName
- E-post / Email
- Kön / Gender (M/Man/Male, F/Kvinna/Female)
- Födelsedatum / BirthDate (YYYY-MM-DD)
- Klubb / Club (optional)
- Nationalitet / Nationality (optional, default: SE)
- Klass / Class (optional, will be created if not exists)

### Encoding Support
- UTF-8 (with BOM)
- CP1252 (Windows-1252)
- Delimiter: semicolon (;)

## Design System

### Colors
- Primary: Black (#000000)
- Secondary: White (#FFFFFF)
- Accent: Orange (#ff6b35)
- Success: Green (#16a34a)
- Error: Red (#dc2626)

### Typography
- System fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, etc.
- All text in Swedish (Svenska)

## Environment Variables

### Backend (.env)

#### Required Variables
- `ADMIN_PASSWORD` - Admin authentication password
- `GATEWAY_HMAC_SECRET` - Secret for HMAC validation from passage gateway
- `DATABASE_URL` - PostgreSQL connection string

#### Email Configuration (Required for registration confirmations)
- `SMTP_HOST` - SMTP server (default: smtp.gmail.com)
- `SMTP_PORT` - SMTP port (default: 587)
- `SMTP_USER` - Email account (e.g., paltmilen@gmail.com)
- `SMTP_PASSWORD` - Email password
- `EMAIL_FROM` - From address (e.g., paltmilen@gmail.com)

#### Optional Variables
- `PORT` - API port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `SWISH_PHONE_NUMBER` - Swish payment phone number
- `NODE_ENV` - Environment (development/production)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (http://localhost:3001 for development)

## API Endpoints

### Public Endpoints
- `GET /api/events` - List all active events
- `GET /api/events/:slug` - Get event by slug
- `GET /api/results/event/:slug` - Get live results
- `POST /api/participants/register` - Register for event
- `POST /api/passages/gateway` - Receive passage from gateway (HMAC protected)

### Admin Endpoints (require Bearer token)
- `POST /api/admin/login` - Admin login
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/reset` - Reset event data
- `GET /api/classes/event/:eventId` - Get classes
- `POST /api/classes` - Create class
- `POST /api/participants` - Create participant
- `POST /api/participants/import` - Import participants from CSV
- `GET /api/participants/export/:eventId` - Export participants to CSV
- `POST /api/participants/:id/assign-epc` - Assign EPC chip
- `POST /api/passages` - Manually create passage
- `GET /api/passages/event/:eventId` - Get passages for event

## Pages

### Public Pages
- `/` - Home page with event list
- `/anmalan` - Registration form (query param: `?event=event-slug`)
- `/live/:slug` - Live results with real-time updates
- `/chiputlamning` - Chip distribution (EPC/Bib assignment)

### Admin Pages
- `/admin` - Admin login
- `/admin/dashboard` - Admin dashboard with event management

## Database Schema

### Main Models
- **Event**: Race events with mode configuration
- **Class**: Age/gender classes for events
- **Participant**: Registered participants
- **Passage**: Timing passages from RFID readers
- **AuditLog**: Audit trail for critical changes

See `apps/api/prisma/schema.prisma` for complete schema.

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

## Troubleshooting

### "Kunde inte skapa evenemang" (Cannot create event)

This error usually indicates a configuration issue. Check:

1. **Backend logs** - Look for detailed error messages
2. **Environment variables** - Ensure all are set correctly:
   - `DATABASE_URL` must be valid PostgreSQL connection
   - `ADMIN_PASSWORD` must be configured
   - In production: `FRONTEND_URL` must match your Vercel deployment
3. **Frontend configuration**:
   - `NEXT_PUBLIC_API_URL` must point to your deployed backend (not localhost in production!)
4. **Database connection** - Run `npx prisma db push` to ensure database is accessible

For detailed troubleshooting, see [TEST_PROTOCOL.md](./TEST_PROTOCOL.md).

### CORS Errors

If you see CORS errors in browser console:
- Verify `FRONTEND_URL` in backend matches your Vercel URL exactly
- Include `https://` protocol
- No trailing slash

## CI/CD

GitHub Actions automatically:
- Builds both applications
- Runs tests
- Validates code quality

See `.github/workflows/build.yml` for details.

## License

MIT
