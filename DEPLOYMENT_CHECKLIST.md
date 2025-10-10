# Deployment Checklist för jp7an-timing

Detta dokument beskriver steg-för-steg hur man deployer jp7an-timing till produktion och verifierar att allt fungerar korrekt.

## 🎯 Mål

Systemet ska köras helt på webben (deployed):
- Backend på Railway eller Render
- Frontend på Vercel
- Gateway kan köras lokalt (undantag)

❌ **INGEN localhost, cmd eller PowerShell för huvudsystemet i produktion!**

## 📋 Förberedelser

### 1. Databas (Neon PostgreSQL)

1. Gå till https://neon.tech
2. Skapa nytt projekt: `jp7an-timing`
3. Kopiera connection string (börjar med `postgresql://`)
4. Spara för senare användning

### 2. Email (Gmail App Password)

1. Gå till Google Account → Security
2. Aktivera 2-Step Verification
3. Gå till App passwords
4. Skapa nytt app password för "Mail"
5. Kopiera 16-siffrig kod
6. Spara för senare användning

### 3. Secrets

Generera säkra secrets:
```bash
# GATEWAY_HMAC_SECRET (minst 32 tecken)
openssl rand -hex 32

# ADMIN_PASSWORD (välj ett starkt lösenord)
# Exempel: kl4ddkAk@ (eller generera eget)
```

## 🚀 Deploy Backend (Railway)

### Steg 1: Skapa Railway-projekt

1. Gå till https://railway.app
2. Klicka "New Project"
3. Välj "Deploy from GitHub repo"
4. Välj `jp7an/jp7an-timing`
5. Klicka på project → Settings

### Steg 2: Konfigurera projekt

**Root Directory:**
```
apps/api
```

**Build Command:** (lämna tom, använder package.json)
```
npm install && npm run build
```

**Start Command:** (lämna tom, använder package.json)
```
npm start
```

### Steg 3: Konfigurera miljövariabler

Gå till Variables tab och lägg till:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require

# Admin
ADMIN_PASSWORD=kl4ddkAk@

# Security
GATEWAY_HMAC_SECRET=xxx (genererad ovan)

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=paltmilen@gmail.com
SMTP_PASSWORD=xxx (app password från Gmail)
EMAIL_FROM=paltmilen@gmail.com

# Environment
NODE_ENV=production
PORT=3001

# Frontend URL (lägg till senare när Vercel är deploy:ad)
FRONTEND_URL=https://your-app.vercel.app
```

### Steg 4: Deploy och verifiera

1. Railway deployer automatiskt
2. Vänta tills deployment är klar (grönt ✓)
3. Kopiera public URL (ex: `https://jp7an-timing-production.up.railway.app`)
4. Testa health endpoint:

```bash
curl https://your-api.railway.app/health
```

**Förväntat svar:**
```json
{"status":"ok","timestamp":"2025-10-10T04:43:49.785Z"}
```

5. Testa events endpoint:
```bash
curl https://your-api.railway.app/api/events
```

**Förväntat svar:**
```json
[]
```

✅ **Backend är nu deployad!** Spara URL:en för nästa steg.

## 🎨 Deploy Frontend (Vercel)

### Steg 1: Skapa Vercel-projekt

1. Gå till https://vercel.com
2. Klicka "Add New..." → Project
3. Import från GitHub: `jp7an/jp7an-timing`
4. Konfigurera projekt:

### Steg 2: Konfigurera projekt

**Framework Preset:**
```
Next.js
```

**Root Directory:**
```
apps/web
```

**Build Command:** (lämna default)
```
npm run build
```

**Output Directory:** (lämna default)
```
.next
```

**Install Command:** (lämna default)
```
npm install
```

### Steg 3: Konfigurera miljövariabler

Under "Environment Variables" lägg till:

```bash
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

⚠️ **VIKTIGT:**
- Använd din Railway URL (inte localhost!)
- UTAN `/api` i slutet
- INKLUDERA `https://`

### Steg 4: Deploy och verifiera

1. Klicka "Deploy"
2. Vänta tills deployment är klar
3. Kopiera production URL (ex: `https://jp7an-timing.vercel.app`)
4. Öppna URL i browser
5. Kontrollera att sidan laddas

✅ **Frontend är nu deployad!** Spara URL:en.

### Steg 5: Uppdatera Backend FRONTEND_URL

1. Gå tillbaka till Railway
2. Öppna ditt projekt
3. Gå till Variables tab
4. Uppdatera `FRONTEND_URL` till din Vercel URL:
   ```
   FRONTEND_URL=https://jp7an-timing.vercel.app
   ```
5. Railway deployer om automatiskt

## ✅ Verifiering

### Test 1: Health Check

```bash
curl https://your-api.railway.app/health
```

**Förväntat:** `{"status":"ok",...}`

### Test 2: Frontend laddas

1. Öppna `https://your-app.vercel.app`
2. Kontrollera att startsidan visas
3. Öppna DevTools (F12) → Console
4. Kontrollera inga fel (röda meddelanden)

### Test 3: Admin Login

1. Gå till `https://your-app.vercel.app/admin`
2. Ange lösenord (ex: `kl4ddkAk@`)
3. Klicka "Logga in"

**Förväntat:**
- ✅ Redirectar till `/admin/dashboard`
- ✅ Ser "Admin Dashboard" som rubrik

**Om det inte fungerar:**
- Öppna DevTools → Network tab
- Försök logga in igen
- Leta efter failed request
- Kontrollera error message

### Test 4: Skapa Evenemang

1. I admin dashboard, klicka "Nytt evenemang"
2. Fyll i:
   - Namn: `Test Event 2025`
   - Slug: `test-event-2025` (auto-genereras)
   - Beskrivning: `Detta är ett test`
   - Tävlingsläge: `Normal`
   - Datum: Välj framtida datum
   - Plats: `Stockholm`
3. Klicka "Skapa evenemang"

**Förväntat:**
- ✅ Meddelande: "Evenemang skapat"
- ✅ Redirectar till dashboard
- ✅ Nytt evenemang syns i listan

**Om "Kunde inte skapa evenemang":**

Se felsökningsguiden nedan 👇

## 🐛 Felsökningsguide

### Problem: "Kunde inte skapa evenemang"

#### Steg 1: Kontrollera Browser Console

Öppna DevTools (F12) → Console och Network tab

Leta efter:
- `Failed to fetch` → Backend är ej nåbar
- `401 Unauthorized` → Admin password problem
- `500 Internal Server Error` → Backend-fel
- `CORS error` → FRONTEND_URL är fel

#### Steg 2: Kontrollera NEXT_PUBLIC_API_URL

```bash
# I DevTools Console, kör:
console.log(process.env.NEXT_PUBLIC_API_URL)
```

**Ska vara:** `https://your-api.railway.app`
**INTE:** `http://localhost:3001`

Om det är fel:
1. Gå till Vercel → Project Settings → Environment Variables
2. Kontrollera `NEXT_PUBLIC_API_URL`
3. Uppdatera till korrekt Railway URL
4. Redeploy: Deployments → ⋯ → Redeploy

#### Steg 3: Kontrollera Backend Logs

**Railway:**
1. Gå till Railway dashboard
2. Välj ditt projekt
3. Klicka på API-servicen
4. Gå till "Deployments" tab
5. Klicka på senaste deployment
6. Se "View Logs"

**Leta efter:**
- `Error creating event:` följt av felmeddelande
- `Prisma error` → Database problem
- `Admin-lösenord inte konfigurerat` → ADMIN_PASSWORD saknas

#### Steg 4: Testa API Direkt

```bash
# 1. Logga in
curl -X POST https://your-api.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"kl4ddkAk@"}'

# Förväntat svar: {"token":"...","message":"Inloggning lyckades"}

# 2. Skapa evenemang
curl -X POST https://your-api.railway.app/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer kl4ddkAk@" \
  -d '{
    "name": "Curl Test Event",
    "slug": "curl-test",
    "mode": "NORMAL",
    "date": "2025-12-01T10:00:00Z",
    "modeSettings": {}
  }'

# Förväntat: JSON med det skapade eventet
```

Om detta fungerar men webappen inte gör det → Problem i frontend/CORS

#### Steg 5: Kontrollera Database Connection

**Railway:**
```bash
# I Railway dashboard
# Service → Variables → DATABASE_URL
```

**Testa connection:**
```bash
# Lokalt, med Railway DATABASE_URL
DATABASE_URL="postgresql://..." npx prisma db push
```

Om connection error:
- Kontrollera Neon dashboard att databasen är igång
- Kontrollera connection string är korrekt
- Kontrollera IP whitelist i Neon (ska vara disabled eller allow all)

### Problem: CORS Error

**Symptom:** Console visar "CORS policy blocked"

**Lösning:**
1. Kontrollera Railway → Variables → `FRONTEND_URL`
2. Ska matcha exakt din Vercel URL (inkl. https://)
3. Uppdatera om fel
4. Vänta på redeploy
5. Testa igen

### Problem: 401 Unauthorized

**Symptom:** Kan inte logga in eller skapa evenemang

**Lösning:**
1. Kontrollera Railway → Variables → `ADMIN_PASSWORD`
2. Kontrollera att du använder samma lösenord i login
3. Testa login med curl (se ovan)
4. Om curl fungerar → Kolla localStorage i browser:
   ```javascript
   // I DevTools Console
   localStorage.getItem('adminToken')
   ```
5. Token ska vara ditt lösenord

### Problem: Frontend visar "Loading..." forever

**Symptom:** Dashboard eller pages stannar på "Loading..." eller "Laddar..."

**Lösning:**
1. Öppna DevTools → Network tab
2. Se vilken request som hänger
3. Om request till `/api/events` går till localhost → `NEXT_PUBLIC_API_URL` är fel
4. Uppdatera i Vercel och redeploy

## 📝 Checklist för Fullständig Deploy

Använd denna checklist för att säkerställa allt är korrekt:

### Backend (Railway)
- [ ] Projekt skapat
- [ ] Root directory: `apps/api`
- [ ] Environment variables:
  - [ ] `DATABASE_URL` (från Neon)
  - [ ] `ADMIN_PASSWORD`
  - [ ] `GATEWAY_HMAC_SECRET`
  - [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`
  - [ ] `FRONTEND_URL` (Vercel URL)
  - [ ] `NODE_ENV=production`
- [ ] Deployment lyckad (grönt ✓)
- [ ] `/health` endpoint svarar

### Frontend (Vercel)
- [ ] Projekt skapat
- [ ] Root directory: `apps/web`
- [ ] Framework: Next.js
- [ ] Environment variable:
  - [ ] `NEXT_PUBLIC_API_URL` (Railway URL)
- [ ] Deployment lyckad (grönt ✓)
- [ ] Startsida laddas

### Funktionalitet
- [ ] Kan öppna startsida
- [ ] Kan logga in som admin
- [ ] Kan se admin dashboard
- [ ] Kan skapa evenemang
- [ ] Evenemang visas i dashboard
- [ ] Publik kan se aktiva evenemang
- [ ] Anmälningsformulär fungerar

### INGEN localhost i produktion!
- [ ] `NEXT_PUBLIC_API_URL` är INTE localhost
- [ ] `FRONTEND_URL` är INTE localhost
- [ ] Inga hardcoded localhost i kod (verifierat)
- [ ] Systemet körs helt på webben

## 🎉 Klar!

När alla checklist-items är markerade är systemet fullständigt deployat och funktionellt.

**URLs att spara:**
- Backend: https://your-api.railway.app
- Frontend: https://your-app.vercel.app
- Admin: https://your-app.vercel.app/admin
- Anmälan: https://your-app.vercel.app/anmalan

För support och mer information, se `TEST_PROTOCOL.md` och `README.md`.
