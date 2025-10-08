# JP7AN Timing System

A professional RFID-based timing system for running events, supporting multiple race formats including Normal races, Backyard Ultra, Lap races, and Time-based races.

## Features

### Race Types
- **Normal Race**: Traditional races with gun start and chip timing, optional intermediate times
- **Backyard Ultra**: Standard 6.7km laps with hourly starts and whistle warnings
- **Lap Race**: Configurable lap distance and number of laps
- **Time Race**: Fixed duration races where most laps wins

### Core Functionality
- Live results display with real-time updates
- Online registration with payment tracking (Swish integration)
- Chip distribution system with bib number assignment
- Export to PDF and CSV (including Swedish Athletics format)
- Class/category support for multiple distances in one event
- Admin interface for event management

## Technology Stack

- **Frontend/Backend**: Next.js 15 with TypeScript
- **Database**: Neon PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **RFID Hardware**: Impinj R420 with 4 panel antennas
- **Export**: jsPDF for PDF generation, PapaParse for CSV

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Impinj R420 RFID reader (for production use)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jp7an/jp7an-timing.git
cd jp7an-timing
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database connection string and other configuration.

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The system uses Prisma ORM with the following main models:

- **Event**: Race events with date, location, and description
- **Race**: Individual races within an event (Normal, Backyard, Lap, Time)
- **RaceClass**: Distance/category variations within a race
- **Participant**: Registered participants with personal info and chip assignment
- **ChipReading**: RFID chip readings from the Impinj reader
- **RaceResult**: Calculated results with times, placements, and stats

## API Routes

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event

### Races
- `GET /api/races?eventId={id}` - List races for an event
- `POST /api/races` - Create new race

### Participants
- `GET /api/participants?eventId={id}` - List participants
- `POST /api/participants` - Register new participant

### Chip Readings
- `POST /api/readings` - Process chip reading from gateway

### Live Results
- `GET /api/live/normal?raceId={id}` - Normal race live results
- `GET /api/live/backyard?raceId={id}` - Backyard Ultra live results
- `GET /api/live/lap?raceId={id}` - Lap race live results
- `GET /api/live/time?raceId={id}` - Time race live results

## Gateway Program

The gateway program (to be implemented) will:
- Connect to the Impinj R420 RFID reader
- Monitor for chip reads from the antennas
- Send chip readings to the web application API
- Handle reader configuration and antenna settings

## Deployment

The application can be deployed to:
- Vercel (recommended for Next.js)
- Any Node.js hosting platform
- Docker container

Make sure to:
1. Set production environment variables
2. Run database migrations
3. Configure the Impinj reader IP address
4. Set up SSL certificates for HTTPS

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Support

For support, email jesper@piteortenschark.se

