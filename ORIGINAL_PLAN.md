# Ursprungsplan för jp7an-timing systemet
# Original System Plan for jp7an-timing

Detta dokument beskriver den ursprungliga visionen, planen och specifikationerna för jp7an-timing systemet - ett modernt tidtagningssystem för löpartävlingar.

## 📋 Innehållsförteckning

1. [Vision och Mål](#vision-och-mål)
2. [Systemöversikt](#systemöversikt)
3. [Funktionella Krav](#funktionella-krav)
4. [Tekniska Krav](#tekniska-krav)
5. [Arkitektur](#arkitektur)
6. [Lopp-modes (Race Modes)](#lopp-modes-race-modes)
7. [Implementeringsfaser](#implementeringsfaser)
8. [Status](#status)

---

## 🎯 Vision och Mål

### Huvudvision
Skapa ett komplett, produktionsklart tidtagningssystem för löpartävlingar som stödjer flera tävlingsformat och kan användas för allt från lokala lopp till större evenemang.

### Primära Mål

1. **Användarvänlighet**
   - Enkel publik anmälan med minimal friktion
   - Intuitiv admin-gränssnitt för eventorganisatörer
   - Live resultat som uppdateras i realtid

2. **Flexibilitet**
   - Stöd för 4 olika tävlingsformat (Normal, Backyard, Varvlopp, Tidslopp)
   - Anpassningsbar för olika eventtyper
   - Modulär arkitektur för framtida utökningar

3. **Teknisk Excellens**
   - Modern tech stack (Next.js 14, Express, Prisma)
   - Skalbar arkitektur
   - Deployment-ready för produktion
   - Säker och robust

4. **Integration**
   - RFID-chip integration via HMAC gateway
   - Email-notifieringar
   - Swish-integration för betalningar
   - CSV import/export för Swedish Athletics format

---

## 🏗️ Systemöversikt

### Komponenter

```
┌─────────────────────────────────────────────────────────┐
│                    ANVÄNDARE                             │
├──────────────┬─────────────────┬─────────────────────────┤
│   Publik     │  Deltagare      │    Administratör        │
└──────┬───────┴─────┬───────────┴──────────┬──────────────┘
       │             │                      │
       │             │                      │
┌──────▼─────────────▼──────────────────────▼──────────────┐
│              FRONTEND (Next.js 14)                        │
│  ┌────────────┬──────────────┬─────────────────────┐    │
│  │   Hem      │   Anmälan    │    Admin Panel      │    │
│  │   Live     │              │    Chiputlämning    │    │
│  └────────────┴──────────────┴─────────────────────┘    │
└───────────────────────────┬───────────────────────────────┘
                            │ API Calls (REST + WebSocket)
┌───────────────────────────▼───────────────────────────────┐
│              BACKEND (Express + Socket.IO)                │
│  ┌─────────────────────────────────────────────────┐     │
│  │  Routes:  Events, Classes, Participants,        │     │
│  │           Passages, Results, Admin, CSV         │     │
│  ├─────────────────────────────────────────────────┤     │
│  │  Modes:   Normal, Backyard, Varvlopp, Tidslopp │     │
│  ├─────────────────────────────────────────────────┤     │
│  │  Utils:   Email, QR Codes, CSV Parser          │     │
│  └─────────────────────────────────────────────────┘     │
└───────────────────────────┬───────────────────────────────┘
                            │ Prisma ORM
┌───────────────────────────▼───────────────────────────────┐
│              DATABASE (PostgreSQL - Neon)                 │
│  Tables: Event, Class, Participant, Passage,              │
│          Result, AuditLog                                 │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│              EXTERNA SYSTEM                               │
│  • RFID Gateway (HMAC-säkrad)                            │
│  • SMTP Server (Email-notifieringar)                     │
│  • Swish (Betalning QR-koder)                            │
└───────────────────────────────────────────────────────────┘
```

### Deployment Modell

- **Frontend**: Vercel (Next.js optimerat)
- **Backend**: Railway eller Render
- **Databas**: Neon (PostgreSQL)
- **Domäner**: Anpassningsbara

---

## ✨ Funktionella Krav

### 1. Publik Funktionalitet

#### 1.1 Hemsida (`/`)
- Visa lista över kommande och aktiva evenemang
- Kort beskrivning av varje event
- CTA-knappar för anmälan och live resultat
- Responsiv design (mobil, surfplatta, desktop)

#### 1.2 Anmälningssida (`/anmalan`)
- Formulär för deltagarregistrering med fält:
  - Namn (förnamn + efternamn)
  - Email
  - Telefon
  - Kön
  - Födelsedatum
  - Klubb/lag
  - Klass (baserat på ålder/kön)
  - GDPR-samtycke (obligatoriskt)
- Validering av alla fält
- Email-bekräftelse efter anmälan
- Swish QR-kod för betalning (om aktiverat)

#### 1.3 Live Resultat (`/live/[slug]`)
- Realtidsuppdatering via WebSocket
- Visa resultat per klass
- Sortering: position, namn, tid, distans
- Filter per klass
- Auto-refresh när nya passager registreras
- Responsiv tabell

### 2. Admin Funktionalitet

#### 2.1 Login (`/admin`)
- Enkel lösenordsbaserad autentisering
- "Håll mig inloggad" i 14 dagar
- Token-baserad session
- Skydd mot obehörig åtkomst

#### 2.2 Dashboard (`/admin/dashboard`)
- Översikt över alla evenemang
- Snabbåtgärder:
  - Skapa nytt evenemang
  - Chiputlämning
  - Hantera deltagare
- Lista alla evenemang (aktiva + inaktiva)
- Redigera befintliga evenemang

#### 2.3 Event Management
**Skapa Event (`/admin/events/new`)**:
- Namn (obligatoriskt)
- Slug (auto-genererad, redigerbar)
- Beskrivning
- Datum och tid
- Plats
- Tävlingsformat (mode)
- Mode-specifika inställningar
- Aktiv/Inaktiv status

**Redigera Event (`/admin/events/[id]`)**:
- Alla fält redigerbara
- Pre-ifyllda värden
- Spara ändringar
- Ta bort event (med bekräftelse)

#### 2.4 Deltagarhantering
- Lista alla deltagare per event
- Sök deltagare (namn, email, startnummer)
- Filtrera per klass
- Lägg till deltagare manuellt
- Redigera deltagarinformation
- Ta bort deltagare
- CSV Import:
  - Stöd för UTF-8 och CP1252
  - Swedish Athletics format
  - Semicolon-separated
  - Validering och felhantering
- CSV Export:
  - Alla deltagare
  - Resultat per klass
  - Samma format som import

#### 2.5 Klasshantering
- Skapa klasser (baserat på ålder/kön)
- Redigera klassnamn och kategorier
- Ta bort klasser (om inga deltagare)
- Automatisk klasstilldelning vid import

#### 2.6 Chiputlämning (`/chiputlamning`)
- Tilldela EPC (chip) och startnummer
- Sök deltagare
- USB-läsare support
- Dublettdetektering
- Visa tilldelade chips

#### 2.7 Passageregistrering
- Manuell registrering via admin
- Automatisk via HMAC gateway
- Tidsstämpel
- EPC-nummer
- Validation

### 3. Resultatberäkning

Systemet beräknar resultat automatiskt baserat på tävlingsformat:

#### 3.1 Normal Mode
- Start- och måltid
- Tid = Mål - Start
- Sortering: snabbaste vinner

#### 3.2 Backyard Mode
- Yard-baserade rundor (t.ex. varje timme)
- Sista person som klarar ett varv vinner
- DNF om missar deadline
- Tracking av antal yards

#### 3.3 Varvlopp Mode
- Fast antal varv
- Snabbaste totaltid vinner
- Tracking av varvtider
- Split times

#### 3.4 Tidslopp Mode
- Fast tidslimit (t.ex. 6 timmar)
- Längsta distans vinner
- Tracking av varv och distans
- Realtidsuppdatering

---

## 🔧 Tekniska Krav

### 1. Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS / DaisyUI
- Socket.IO client

**Backend**:
- Node.js 20+
- Express.js
- TypeScript
- Prisma ORM
- Socket.IO
- Nodemailer

**Databas**:
- PostgreSQL (Neon)

**Deployment**:
- Vercel (Frontend)
- Railway/Render (Backend)
- Neon (Database)

### 2. Säkerhet

- **Autentisering**: Token-baserad admin-auth
- **HMAC**: Säker gateway för RFID-data
- **CORS**: Konfigurerad för production domains
- **Environment Variables**: Känslig data i env vars
- **Input Validation**: Alla API endpoints
- **SQL Injection**: Skyddad via Prisma ORM

### 3. Performance

- **WebSocket**: Realtidsuppdateringar utan polling
- **Database Indexing**: Optimerade queries
- **Caching**: Next.js static generation där möjligt
- **CDN**: Vercel edge network
- **Lazy Loading**: Komponenter och data

### 4. Kodkvalitet

- **TypeScript**: Strikt typning
- **ESLint**: Kod linting
- **Prettier**: Kod formattering (om konfigurerad)
- **Error Handling**: Try-catch blocks, felmeddelanden
- **Logging**: Console.log för debug, audit log i DB

---

## 🏛️ Arkitektur

### Backend Struktur

```
apps/api/
├── src/
│   ├── index.ts              # Server entry point
│   ├── routes/
│   │   ├── admin.ts          # Admin login/verify
│   │   ├── events.ts         # Event CRUD
│   │   ├── classes.ts        # Class management
│   │   ├── participants.ts   # Participant CRUD + CSV
│   │   ├── passages.ts       # Passage recording + HMAC gateway
│   │   └── results.ts        # Results calculation
│   ├── modes/
│   │   ├── base.ts           # Interface för race modes
│   │   ├── normal.ts         # Normal mode calculator
│   │   ├── backyard.ts       # Backyard mode calculator
│   │   ├── varvlopp.ts       # Varvlopp mode calculator
│   │   └── tidslopp.ts       # Tidslopp mode calculator
│   ├── middleware/
│   │   ├── auth.ts           # Token verification
│   │   └── hmac.ts           # HMAC verification
│   ├── utils/
│   │   ├── email.ts          # Email sending
│   │   ├── qr.ts             # QR code generation
│   │   ├── csv.ts            # CSV parsing/generation
│   │   └── audit.ts          # Audit logging
│   └── config/
│       └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma         # Database schema
└── package.json
```

### Frontend Struktur

```
apps/web/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Hemsida
│   │   ├── anmalan/
│   │   │   └── page.tsx                # Anmälning
│   │   ├── live/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Live resultat
│   │   ├── admin/
│   │   │   ├── page.tsx                # Admin login
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Dashboard
│   │   │   └── events/
│   │   │       ├── new/
│   │   │       │   └── page.tsx        # Nytt event
│   │   │       └── [id]/
│   │   │           └── page.tsx        # Redigera event
│   │   └── chiputlamning/
│   │       └── page.tsx                # Chip distribution
│   ├── components/
│   │   ├── Navbar.tsx                  # Navigation
│   │   ├── EventCard.tsx               # Event card
│   │   ├── ParticipantForm.tsx         # Registration form
│   │   ├── ResultsTable.tsx            # Results display
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts                      # API client
│   │   └── socket.ts                   # WebSocket client
│   └── hooks/
│       └── useAuth.ts                  # Auth hook
└── package.json
```

### Database Schema

```prisma
model Event {
  id            String        @id @default(cuid())
  name          String
  slug          String        @unique
  description   String?
  date          DateTime
  location      String?
  mode          RaceMode
  modeSettings  Json
  isActive      Boolean       @default(true)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  classes       Class[]
  participants  Participant[]
  passages      Passage[]
  results       Result[]
}

model Class {
  id            String        @id @default(cuid())
  name          String
  eventId       String
  event         Event         @relation(fields: [eventId], references: [id])
  participants  Participant[]
  results       Result[]
}

model Participant {
  id            String        @id @default(cuid())
  firstName     String
  lastName      String
  email         String
  phone         String?
  gender        String
  birthDate     DateTime
  club          String?
  epc           String?       @unique
  bibNumber     Int?
  classId       String
  class         Class         @relation(fields: [classId], references: [id])
  eventId       String
  event         Event         @relation(fields: [eventId], references: [id])
  gdprConsent   Boolean       @default(false)
  createdAt     DateTime      @default(now())
  
  passages      Passage[]
  results       Result[]
}

model Passage {
  id              String      @id @default(cuid())
  participantId   String
  participant     Participant @relation(fields: [participantId], references: [id])
  eventId         String
  event           Event       @relation(fields: [eventId], references: [id])
  timestamp       DateTime
  epc             String
  type            PassageType @default(FINISH)
  createdAt       DateTime    @default(now())
}

model Result {
  id              String      @id @default(cuid())
  participantId   String
  participant     Participant @relation(fields: [participantId], references: [id])
  eventId         String
  event           Event       @relation(fields: [eventId], references: [id])
  classId         String
  class           Class       @relation(fields: [classId], references: [id])
  position        Int?
  time            Int?        // milliseconds
  laps            Int?
  distance        Int?        // meters
  status          ResultStatus @default(RUNNING)
  updatedAt       DateTime    @updatedAt
}

model AuditLog {
  id            String      @id @default(cuid())
  action        String
  entity        String
  entityId      String
  userId        String?
  details       Json?
  timestamp     DateTime    @default(now())
}

enum RaceMode {
  NORMAL
  BACKYARD
  VARVLOPP
  TIDSLOPP
}

enum PassageType {
  START
  FINISH
  LAP
}

enum ResultStatus {
  RUNNING
  FINISHED
  DNF
  DNS
  DQ
}
```

---

## 🏃 Lopp-modes (Race Modes)

### 1. Normal Mode

**Koncept**: Traditionell tävling med start och mål.

**Inställningar**:
```json
{
  "trackLength": 5000,  // meter
  "laps": 1
}
```

**Beräkning**:
- Start-passage registreras
- Mål-passage registreras
- Tid = Mål - Start
- Position baserat på tid (snabbaste vinner)

**Användningsfall**: Traditionella lopp (5K, 10K, halvmaraton, maraton)

---

### 2. Backyard Ultra Mode

**Koncept**: "Last person standing" format där deltagare måste klara ett yard (rundor) inom utsatt tid (vanligtvis 1 timme).

**Inställningar**:
```json
{
  "yardLength": 6706,      // meter (4.167 miles)
  "yardTimeLimit": 3600,   // sekunder (1 timme)
  "startTime": "2025-01-01T10:00:00Z"
}
```

**Beräkning**:
- Varje yard måste klaras innan deadline
- Deadline = StartTime + (yardNummer * yardTimeLimit)
- Om deltagare missar deadline = DNF
- Vinnare = sista person som klarar ett yard

**Användningsfall**: Backyard Ultra, ultralopp

---

### 3. Varvlopp Mode

**Koncept**: Fast antal varv, snabbaste totaltid vinner.

**Inställningar**:
```json
{
  "totalLaps": 10,
  "lapLength": 400  // meter
}
```

**Beräkning**:
- Registrera varje varvpassage
- Beräkna varvtider
- Total tid = summa av alla varv
- Position baserat på total tid
- Status = RUNNING tills alla varv klara

**Användningsfall**: Banlöpning, 5000m på bana

---

### 4. Tidslopp Mode

**Koncept**: Fast tidslimit, längsta distans vinner.

**Inställningar**:
```json
{
  "timeLimit": 21600,   // sekunder (6 timmar)
  "lapLength": 400,     // meter
  "startTime": "2025-01-01T08:00:00Z"
}
```

**Beräkning**:
- Räkna antal varv innan tidslimit
- Distans = antal varv * lapLength
- Position baserat på distans (längst vinner)
- Efter tidslimit: status = FINISHED

**Användningsfall**: 6-timmarslopp, 12-timmarslopp, 24-timmarslopp

---

## 📅 Implementeringsfaser

### Fas 1: Grundläggande Infrastructure ✅ KLAR
- [x] Repository setup
- [x] Backend Express server
- [x] Frontend Next.js app
- [x] Database schema (Prisma)
- [x] Deployment configuration
- [x] Environment variables setup

### Fas 2: Core Backend API ✅ KLAR
- [x] Admin authentication
- [x] Event CRUD endpoints
- [x] Class management
- [x] Participant CRUD
- [x] Passage recording
- [x] Results calculation (alla modes)
- [x] CSV import/export
- [x] Email notifications
- [x] Swish QR generation
- [x] WebSocket setup
- [x] HMAC gateway

### Fas 3: Frontend Pages ✅ KLAR
- [x] Hemsida
- [x] Anmälningssida
- [x] Live resultat
- [x] Admin login
- [x] Admin dashboard
- [x] Event management (create/edit)
- [x] Chiputlämning
- [x] Navigation
- [x] Responsiv design

### Fas 4: Integration & Testing ✅ KLAR
- [x] WebSocket integration
- [x] Email testing
- [x] CSV import/export testing
- [x] Alla race modes testing
- [x] Production deployment
- [x] Bug fixes
- [x] Documentation

### Fas 5: Dokumentation & Support ✅ KLAR
- [x] README.md
- [x] API documentation
- [x] DEPLOYMENT_CHECKLIST.md
- [x] TROUBLESHOOTING.md
- [x] TEST_PROTOCOL.md
- [x] CONTRIBUTING.md
- [x] QUICKFIX.md
- [x] DOCS_INDEX.md
- [x] START_HERE.md

---

## ✅ Status

### Vad som är Implementerat

**Backend (100%)**:
- ✅ Alla API endpoints
- ✅ Alla 4 race modes
- ✅ Authentication & authorization
- ✅ CSV import/export
- ✅ Email notifications
- ✅ Swish QR generation
- ✅ WebSocket support
- ✅ HMAC gateway
- ✅ Audit logging
- ✅ Error handling

**Frontend (100%)**:
- ✅ Alla sidor implementerade
- ✅ Responsiv design
- ✅ Admin panel
- ✅ Event management
- ✅ Participant registration
- ✅ Live results
- ✅ Chip distribution
- ✅ WebSocket integration

**Dokumentation (100%)**:
- ✅ Omfattande README
- ✅ Deployment guides
- ✅ Troubleshooting guides
- ✅ Test protocols
- ✅ API documentation
- ✅ Quick fixes
- ✅ Contributing guide

**Deployment (100%)**:
- ✅ Vercel configuration
- ✅ Railway/Render configuration
- ✅ Environment variables documented
- ✅ Database migrations
- ✅ CI/CD setup (om konfigurerad)

### Produktionsklart

Systemet är **fullt funktionellt och produktionsklart**. Alla ursprungliga krav är uppfyllda och testade.

### Framtida Förbättringar (Valfria)

Dessa är **inte** del av ursprungsplanen men kan övervägas för framtida versioner:

1. **Enhanced Features**:
   - Multi-event support (flera simultana events)
   - Team/relay race support
   - Age-graded results
   - Advanced analytics dashboard
   - Photo finish integration

2. **UX Improvements**:
   - Progressive Web App (PWA)
   - Mobile app (React Native)
   - Dark mode
   - Multi-language support
   - Accessibility improvements (WCAG)

3. **Admin Tools**:
   - Bulk operations
   - Advanced filtering/search
   - Export to multiple formats (PDF, Excel)
   - Custom report builder
   - Email template editor

4. **Integration**:
   - SMS notifications
   - Social media sharing
   - Payment gateways (Stripe, PayPal)
   - Calendar integration (Google, Outlook)
   - Strava integration

5. **Performance**:
   - Redis caching
   - GraphQL API
   - Serverless functions
   - Image optimization
   - CDN for static assets

---

## 📞 Support & Kontakt

För frågor eller problem:
- Se [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) för vanliga problem
- Se [DOCS_INDEX.md](./DOCS_INDEX.md) för dokumentationsöversikt
- Se [START_HERE.md](./START_HERE.md) för snabbstart

---

## 📄 Licens

Detta projekt är utvecklat för jp7an och används enligt överenskommelse.

---

**Dokument Version**: 1.0  
**Senast Uppdaterad**: 2025-10-10  
**Status**: Systemet är komplett och produktionsklart enligt ursprungsplanen
