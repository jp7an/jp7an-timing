# Vanliga produktionsproblem och lösningar

Detta dokument innehåller snabba lösningar för de vanligaste problemen i produktion.

## 🔴 Problem: "Kunde inte skapa evenemang"

Detta är det vanligaste felet och har oftast med felkonfiguration att göra.

### Diagnos 1: Kontrollera vad felet egentligen säger

1. Öppna webbläsaren DevTools (F12)
2. Gå till Console-fliken
3. Försök skapa ett evenemang igen
4. Leta efter röda fel-meddelanden

#### Om du ser "Network Error" eller "Failed to fetch"
**Problem:** Frontend kan inte nå backend

**Lösning:**
```
1. Kontrollera Vercel → Settings → Environment Variables
2. Hitta NEXT_PUBLIC_API_URL
3. Verifiera att värdet är din Railway/Render URL
4. Format: https://your-api.railway.app (INTE localhost!)
5. Om fel: Uppdatera och redeploy
```

#### Om du ser "401 Unauthorized"
**Problem:** Admin autentisering fungerar inte

**Lösning:**
```
1. Kontrollera Railway/Render → Variables
2. Hitta ADMIN_PASSWORD
3. Verifiera att det är satt
4. Logga ut och in igen med korrekt lösenord
```

#### Om du ser "500 Internal Server Error"
**Problem:** Backend-fel, troligen database connection

**Lösning:** Se nästa sektion 👇

### Diagnos 2: Kontrollera backend logs

**Railway:**
1. Gå till Railway dashboard
2. Klicka på din API-service
3. Klicka "Deployments"
4. Klicka på senaste deployment
5. Se "View Logs"

**Render:**
1. Gå till Render dashboard
2. Klicka på din API-service
3. Klicka "Logs"

**Leta efter dessa fel:**

#### "Can't reach database server"
```
Error creating event: PrismaClientInitializationError: 
Can't reach database server at ep-xxx.neon.tech:5432
```

**Problem:** Database connection fungerar inte

**Lösning:**
1. Kontrollera Railway/Render → Variables → DATABASE_URL
2. Verifiera connection string är korrekt
3. Logga in på Neon:
   - Dashboard → Project → Connection Details
   - Kopiera "Connection String"
   - Uppdatera DATABASE_URL i Railway/Render
4. Vänta på redeploy
5. Försök igen

#### "Admin-lösenord inte konfigurerat"
```
Error: Admin-lösenord inte konfigurerat
```

**Problem:** ADMIN_PASSWORD environment variable saknas

**Lösning:**
1. Gå till Railway/Render → Variables
2. Lägg till: ADMIN_PASSWORD = ditt-lösenord
3. Vänta på redeploy
4. Försök igen

#### "CORS policy blocked"
```
Access to XMLHttpRequest at 'https://your-api.railway.app/api/events' 
from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Problem:** FRONTEND_URL är fel konfigurerad i backend

**Lösning:**
1. Kontrollera Railway/Render → Variables → FRONTEND_URL
2. Ska vara: https://your-app.vercel.app (din exakta Vercel URL)
3. Inkludera https://
4. Ingen trailing slash
5. Uppdatera om fel
6. Vänta på redeploy

### Diagnos 3: Testa API direkt med curl

Detta testar om problemet är i backend eller frontend.

```bash
# 1. Testa health endpoint
curl https://your-api.railway.app/health

# Förväntat: {"status":"ok","timestamp":"..."}
# Om du får timeout eller connection error → Backend är nere
```

```bash
# 2. Testa login
curl -X POST https://your-api.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"ditt-lösenord"}'

# Förväntat: {"token":"...","message":"Inloggning lyckades"}
# Om 403: Fel lösenord
# Om 500: Kontrollera backend logs
```

```bash
# 3. Testa skapa evenemang
curl -X POST https://your-api.railway.app/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ditt-lösenord" \
  -d '{
    "name": "Test Event",
    "slug": "test-event",
    "mode": "NORMAL",
    "date": "2025-12-01T10:00:00Z",
    "modeSettings": {}
  }'

# Förväntat: JSON med det skapade eventet
# Om fel: Se error message för detaljer
```

## 🔴 Problem: Frontend visar tom sida eller "Loading..."

### Diagnos: Kontrollera browser console

1. Öppna DevTools (F12)
2. Console-fliken
3. Leta efter fel

#### "Unexpected token '<'"
**Problem:** Vercel build misslyckades eller NEXT_PUBLIC_API_URL returnerar HTML

**Lösning:**
1. Kontrollera Vercel → Deployments
2. Se till att senaste deployment lyckades
3. Om failed: Kolla error logs och fixa build-fel
4. Om successful men problemet kvarstår:
   - Kontrollera NEXT_PUBLIC_API_URL
   - Ska vara API URL, inte en HTML-sida

## 🔴 Problem: "localhost" i produktion

### Symptom
- Frontend försöker ansluta till localhost:3001
- Backend försöker ansluta till localhost:3000
- Ingenting fungerar i produktion

### Lösning

**Frontend (Vercel):**
```
1. Vercel → Settings → Environment Variables
2. NEXT_PUBLIC_API_URL måste vara: https://your-api.railway.app
3. INTE: http://localhost:3001
4. Spara och redeploy
```

**Backend (Railway/Render):**
```
1. Railway/Render → Variables
2. FRONTEND_URL måste vara: https://your-app.vercel.app
3. INTE: http://localhost:3000
4. Spara (deployer automatiskt)
```

**Verifiering:**
```javascript
// I webbläsarens DevTools Console:
console.log(process.env.NEXT_PUBLIC_API_URL)
// Ska INTE vara localhost i produktion!
```

## 🔴 Problem: Email skickas inte

### Symptom
- Registreringar fungerar
- Men inga bekräftelse-emails kommer fram

### Lösning

**Kontrollera SMTP-konfiguration:**
1. Railway/Render → Variables
2. Verifiera alla är satta:
   - SMTP_HOST=smtp.gmail.com
   - SMTP_PORT=587
   - SMTP_USER=din-email@gmail.com
   - SMTP_PASSWORD=app-password (16 tecken)
   - EMAIL_FROM=din-email@gmail.com

**Gmail App Password:**
1. Gå till Google Account → Security
2. Aktivera 2-Step Verification
3. Sök "App passwords"
4. Skapa nytt för "Mail"
5. Kopiera 16-siffrig kod (utan mellanslag)
6. Använd som SMTP_PASSWORD

## 📋 Snabb checklista när något går fel

Gå igenom denna lista i ordning:

### 1. Backend Health
- [ ] Backend deployd utan fel
- [ ] `/health` endpoint svarar: `curl https://your-api.railway.app/health`
- [ ] Inga fel i backend logs

### 2. Backend Environment
- [ ] DATABASE_URL korrekt (Neon connection string)
- [ ] ADMIN_PASSWORD satt
- [ ] FRONTEND_URL = Vercel URL (https://...)
- [ ] Alla SMTP-variabler satta om email krävs

### 3. Frontend Health  
- [ ] Frontend deployd utan fel
- [ ] Sidan laddas i browser
- [ ] Inga röda fel i DevTools Console

### 4. Frontend Environment
- [ ] NEXT_PUBLIC_API_URL = Railway/Render URL (https://...)
- [ ] INTE localhost!

### 5. Database
- [ ] Neon project är aktivt
- [ ] Connection string är valid
- [ ] Kan köra: `DATABASE_URL="..." npx prisma db push` lokalt

### 6. CORS
- [ ] FRONTEND_URL i backend matchar exakt Vercel URL
- [ ] Inkluderar https://
- [ ] Ingen trailing slash

## 🆘 När allt annat misslyckas

1. **Redeploy both services:**
   - Vercel: Deployments → ⋯ → Redeploy
   - Railway: Förändring i repo triggar automatisk deploy

2. **Starta från scratch:**
   - Ta bort projekt i Railway/Vercel
   - Skapa ny med korrekt konfiguration
   - Följ DEPLOYMENT_CHECKLIST.md exakt

3. **Testa lokalt:**
   - Klona repo lokalt
   - Konfigurera .env filer
   - Kör `npm run dev` i både api och web
   - Om fungerar lokalt → Produktionsproblem är config-relaterat

4. **Kontrollera dokumentation:**
   - README.md
   - DEPLOYMENT_CHECKLIST.md
   - TEST_PROTOCOL.md

## 📞 Debug-information att samla

Om du behöver hjälp, samla denna information:

1. **Backend logs** (senaste 100 rader)
2. **Browser console errors** (screenshot)
3. **Environment variables** (censurerade känsliga värden!)
4. **Curl test results** (health, login, create event)
5. **Deployment URLs** (backend och frontend)

## ✅ Verifiering att allt fungerar

När alla problem är lösta, verifiera:

```bash
# 1. Backend health
curl https://your-api.railway.app/health
# → {"status":"ok",...}

# 2. Events endpoint
curl https://your-api.railway.app/api/events
# → [] eller lista med events

# 3. Frontend
# Öppna https://your-app.vercel.app
# → Sida laddas utan fel

# 4. Admin login
# Gå till /admin, logga in
# → Redirectar till /admin/dashboard

# 5. Skapa evenemang
# Admin → Nytt evenemang → Fyll i → Skapa
# → Lyckas, syns i listan
```

Om alla dessa fungerar → Systemet är korrekt konfigurerat! 🎉

---

För mer detaljer, se:
- [TEST_PROTOCOL.md](./TEST_PROTOCOL.md)
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- [README.md](./README.md)
