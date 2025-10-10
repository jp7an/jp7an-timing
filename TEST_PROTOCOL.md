# Testprotokoll för jp7an-timing

Detta testprotokoll beskriver hur man testar systemet både lokalt och i produktion.

## Förutsättningar

### För lokal testning:
- Node.js 20 eller högre installerat
- PostgreSQL databas (rekommenderas: Neon)
- npm eller yarn

### För produktionstestning:
- Backend deployad på Railway eller Render
- Frontend deployad på Vercel
- Databas konfigurerad (Neon PostgreSQL)
- Alla miljövariabler korrekt konfigurerade

## Miljövariabler Checklista

### Backend (Railway/Render)
Kontrollera att följande miljövariabler är konfigurerade i deployment-plattformen:

- [ ] `DATABASE_URL` - PostgreSQL connection string från Neon
- [ ] `ADMIN_PASSWORD` - Ditt admin-lösenord (ex: kl4ddkAk@)
- [ ] `GATEWAY_HMAC_SECRET` - HMAC secret för gateway
- [ ] `FRONTEND_URL` - URL till din Vercel deployment (ex: https://your-app.vercel.app)
- [ ] `PORT` - 3001 (eller standardport för plattformen)
- [ ] `NODE_ENV` - production
- [ ] `SMTP_HOST` - smtp.gmail.com
- [ ] `SMTP_PORT` - 587
- [ ] `SMTP_USER` - Din e-postadress
- [ ] `SMTP_PASSWORD` - Ditt e-postlösenord eller app-specific password
- [ ] `EMAIL_FROM` - Din e-postadress

### Frontend (Vercel)
Kontrollera att följande miljövariabel är konfigurerad i Vercel:

- [ ] `NEXT_PUBLIC_API_URL` - URL till din Railway/Render API (ex: https://your-api.railway.app)

⚠️ **VIKTIGT**: `NEXT_PUBLIC_API_URL` FÅR INTE vara `http://localhost:3001` i produktion!

## Test 1: Lokal utveckling

### 1.1 Starta backend
```bash
cd apps/api
cp ../../.env.example .env
# Redigera .env med dina värden
npm install
npx prisma generate
npx prisma db push
npm run dev
```

**Förväntat resultat:** 
```
API server is running on port 3001
WebSocket server is ready
```

### 1.2 Starta frontend
```bash
cd apps/web
cp .env.local.example .env.local
# Säkerställ att NEXT_PUBLIC_API_URL=http://localhost:3001
npm install
npm run dev
```

**Förväntat resultat:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 1.3 Testa att skapa evenemang lokalt
1. Öppna http://localhost:3000
2. Klicka på "Admin" i navigationen
3. Logga in med ditt admin-lösenord
4. Klicka på "Nytt evenemang"
5. Fyll i formuläret:
   - Namn: Test Evenemang
   - Slug: test-evenemang (genereras automatiskt)
   - Beskrivning: Detta är ett test
   - Tävlingsläge: Normal
   - Datum: Välj ett datum
   - Plats: Stockholm
6. Klicka "Skapa evenemang"

**Förväntat resultat:** 
- ✅ Evenemang skapas utan fel
- ✅ Redirectas till admin dashboard
- ✅ Nytt evenemang syns i listan

**Vid fel:**
- ❌ "Kunde inte skapa evenemang" → Kontrollera DATABASE_URL i backend
- ❌ "Network Error" → Kontrollera att backend körs på port 3001
- ❌ "Ogiltigt lösenord" → Kontrollera ADMIN_PASSWORD i backend .env

## Test 2: Produktionsdeploy

### 2.1 Verifiera backend deployment (Railway/Render)

**Kontrollera deployment:**
1. Gå till din Railway/Render dashboard
2. Kontrollera att senaste commit är deployad
3. Kontrollera deployment logs för fel

**Testa API endpoint:**
```bash
curl https://your-api.railway.app/health
```

**Förväntat resultat:**
```json
{"status":"ok","timestamp":"2025-10-10T04:43:49.785Z"}
```

**Testa events endpoint:**
```bash
curl https://your-api.railway.app/api/events
```

**Förväntat resultat:**
```json
[]
```
eller en lista med evenemang om det finns några.

### 2.2 Verifiera frontend deployment (Vercel)

**Kontrollera deployment:**
1. Gå till Vercel dashboard
2. Kontrollera att senaste commit är deployad
3. Kontrollera deployment logs för fel
4. Kontrollera miljövariabel: `NEXT_PUBLIC_API_URL` är satt till din backend URL

**Testa frontend:**
1. Öppna din Vercel URL: https://your-app.vercel.app
2. Kontrollera att sidan laddas utan fel
3. Öppna browser console (F12) och leta efter fel

### 2.3 Testa att skapa evenemang i produktion

**Steg för steg:**
1. Öppna https://your-app.vercel.app
2. Klicka på "Admin"
3. Logga in med ditt admin-lösenord (ex: kl4ddkAk@)
4. Klicka "Nytt evenemang"
5. Fyll i formuläret (samma som lokalt test)
6. Klicka "Skapa evenemang"

**Förväntat resultat:**
- ✅ Evenemang skapas
- ✅ Redirectas till dashboard
- ✅ Evenemang syns i listan

**Vid fel - Felsökning:**

#### Fel: "Kunde inte skapa evenemang"

**Steg 1:** Öppna browser console (F12) och leta efter felet
```
- Om "Network Error" → Backend är ej nåbar
- Om 401/403 → Authentication fel
- Om 500 → Backend-fel, kolla backend logs
```

**Steg 2:** Kontrollera NEXT_PUBLIC_API_URL
1. Öppna Vercel dashboard
2. Gå till Settings → Environment Variables
3. Kontrollera att `NEXT_PUBLIC_API_URL` är korrekt
4. Format: `https://your-api.railway.app` (UTAN /api i slutet)

**Steg 3:** Kontrollera backend miljövariabler
1. Öppna Railway/Render dashboard
2. Kontrollera alla miljövariabler enligt checklistan ovan
3. Särskilt viktigt: `DATABASE_URL`, `ADMIN_PASSWORD`, `FRONTEND_URL`

**Steg 4:** Kontrollera backend logs
1. Gå till Railway/Render dashboard
2. Öppna logs
3. Leta efter fel när du försöker skapa evenemang
4. Vanliga fel:
   - "Error creating event: Prisma error" → Database connection problem
   - "Admin-lösenord inte konfigurerat" → ADMIN_PASSWORD ej satt
   - CORS errors → FRONTEND_URL är fel

**Steg 5:** Testa direkt mot API
```bash
# Logga in och få token
curl -X POST https://your-api.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"kl4ddkAk@"}'

# Använd token för att skapa evenemang
curl -X POST https://your-api.railway.app/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer kl4ddkAk@" \
  -d '{
    "name": "Test Event",
    "slug": "test-event",
    "mode": "NORMAL",
    "date": "2025-12-01T10:00:00Z",
    "description": "Test",
    "location": "Stockholm",
    "modeSettings": {}
  }'
```

**Förväntat resultat:** JSON med det skapade eventet

## Test 3: Admin-funktionalitet

### 3.1 Admin login
- [ ] Kan logga in med korrekt lösenord
- [ ] Får felmeddelande med felaktigt lösenord
- [ ] Token sparas i localStorage
- [ ] Redirectas till dashboard efter lyckad login

### 3.2 Event management
- [ ] Kan skapa nytt evenemang
- [ ] Kan redigera befintligt evenemang
- [ ] Kan radera evenemang
- [ ] Kan återställa evenemang
- [ ] Kan se både aktiva och inaktiva evenemang

### 3.3 Chiputlämning
- [ ] Ej synlig i publik navbar
- [ ] Synlig i admin dashboard
- [ ] Kräver authentication
- [ ] Fungerar efter inloggning
- [ ] Kan söka deltagare
- [ ] Kan tilldela EPC chips

## Test 4: Publik funktionalitet

### 4.1 Startsida
- [ ] Visar aktiva evenemang
- [ ] Evenemang är klickbara
- [ ] Datum visas korrekt

### 4.2 Anmälan
- [ ] Kan välja evenemang
- [ ] Formulär validering fungerar
- [ ] GDPR-samtycke krävs
- [ ] Bekräftelseemail skickas
- [ ] Registreringsnummer genereras

### 4.3 Live-resultat
- [ ] Resultat laddas för evenemang
- [ ] WebSocket updates fungerar
- [ ] Sorterbara kolumner
- [ ] Klickbara deltagarnamn
- [ ] Detaljerad passagehistorik

## Test 5: Integration

### 5.1 Gateway-passage (om tillgänglig)
- [ ] HMAC-validering fungerar
- [ ] Passages sparas korrekt
- [ ] Real-time updates via WebSocket
- [ ] Resultat uppdateras automatiskt

### 5.2 Email
- [ ] Bekräftelseemail vid registrering
- [ ] Korrekt innehåll
- [ ] Registreringsnummer inkluderat

## Felsökningsguide

### Backend startar inte lokalt

**Problem:** Port 3001 används redan
```bash
# Hitta process som använder porten
lsof -i :3001
# Döda processen
kill -9 [PID]
```

**Problem:** Database connection error
- Kontrollera DATABASE_URL
- Testa connection: `npx prisma db push`
- Kontrollera att Neon-databas är igång

### Frontend startar inte lokalt

**Problem:** Port 3000 används redan
```bash
# Ändra port
PORT=3001 npm run dev
```

**Problem:** Cannot connect to API
- Kontrollera att backend körs
- Kontrollera NEXT_PUBLIC_API_URL i .env.local
- Kontrollera CORS-inställningar i backend

### Produktion fungerar inte

**Problem:** API returnerar 502/503
- Backend deployment misslyckades
- Kontrollera deployment logs
- Kontrollera att alla miljövariabler är satta

**Problem:** Frontend visar tom sida
- Build misslyckades
- Kontrollera build logs i Vercel
- Kontrollera att NEXT_PUBLIC_API_URL är korrekt

**Problem:** CORS error
- `FRONTEND_URL` i backend matchar inte din Vercel URL
- Lägg till korrekt URL i backend miljövariabler
- Redeploya backend

## Checklista för produktionsdeploy

Före deploy:
- [ ] Alla tester passerar lokalt
- [ ] Kod är committad till git
- [ ] Branch är pushad till GitHub

Backend (Railway/Render):
- [ ] Projekt skapat
- [ ] GitHub repo kopplat
- [ ] Root directory: `apps/api`
- [ ] Alla miljövariabler konfigurerade
- [ ] Deploy lyckad
- [ ] Health check fungerar: /health

Frontend (Vercel):
- [ ] Projekt skapat
- [ ] GitHub repo kopplat
- [ ] Root directory: `apps/web`
- [ ] Framework: Next.js
- [ ] `NEXT_PUBLIC_API_URL` konfigurerad
- [ ] Deploy lyckad
- [ ] Sida laddas korrekt

Efter deploy:
- [ ] Kan logga in som admin
- [ ] Kan skapa evenemang
- [ ] Kan se evenemang i listan
- [ ] Publik kan se aktiva evenemang
- [ ] Anmälan fungerar

## Support och debugging

### Loggar

**Backend logs (Railway):**
```bash
railway logs
```

**Backend logs (Render):**
Via Render dashboard → Logs tab

**Frontend logs (Vercel):**
Via Vercel dashboard → Deployments → [deployment] → Function Logs

### Vanliga fel och lösningar

| Fel | Orsak | Lösning |
|-----|-------|---------|
| "Kunde inte skapa evenemang" | Database connection | Kontrollera DATABASE_URL |
| "Ogiltigt lösenord" | Admin password fel | Kontrollera ADMIN_PASSWORD i backend |
| "Network Error" | Backend ej nåbar | Kontrollera backend URL och status |
| CORS error | FRONTEND_URL fel | Uppdatera FRONTEND_URL i backend |
| 401 Unauthorized | Token saknas/fel | Logga in igen |
| 500 Internal Server Error | Backend-fel | Kolla backend logs |

## Sammanfattning

Detta testprotokoll täcker:
- ✅ Lokal utveckling och testning
- ✅ Produktionsdeploy verifiering
- ✅ Event-skapande funktionalitet
- ✅ Admin-funktioner
- ✅ Publik funktionalitet
- ✅ Felsökningsguider
- ✅ Checklista för miljövariabler

För support, se dokumentation i README.md eller kontakta utvecklare.
