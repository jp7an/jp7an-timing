# SNABBGUIDE: Åtgärda "Kunde inte skapa evenemang"

**🚨 Problem:** Du får felmeddelandet "Kunde inte skapa evenemang" när du försöker skapa ett evenemang.

**⏱️ Snabb lösning:** 5-10 minuter

## Steg 1: Identifiera problemet (2 min)

### A. Öppna Browser Console
1. Tryck F12 i webbläsaren
2. Klicka på "Console" tab
3. Försök skapa evenemang igen
4. Leta efter röda felmeddelanden

**Vad du ser i Console bestämmer lösningen:**

| Felmeddelande | Gå till |
|---------------|---------|
| "Network Error" eller "Failed to fetch" | Steg 2 |
| "401 Unauthorized" eller "403 Forbidden" | Steg 3 |
| "500 Internal Server Error" | Steg 4 |
| "CORS policy blocked" | Steg 5 |

### B. Ingen fel i Console?
Gå till Steg 6 - Kontrollera backend logs

---

## Steg 2: Network Error (Frontend kan inte nå Backend)

**Problem:** `NEXT_PUBLIC_API_URL` är fel eller backend är nere

### Lösning:

1. **Kontrollera backend är igång:**
   ```bash
   curl https://your-api.railway.app/health
   ```
   - ✅ Om du får `{"status":"ok"}` → Backend fungerar, gå till nästa punkt
   - ❌ Om timeout eller error → Backend är nere, kontakta Railway/Render support

2. **Kontrollera NEXT_PUBLIC_API_URL i Vercel:**
   ```
   Vercel Dashboard → Your Project → Settings → Environment Variables
   
   NEXT_PUBLIC_API_URL = ?
   
   ✅ Ska vara: https://your-api.railway.app
   ❌ FEL om: http://localhost:3001
   ```

3. **Om NEXT_PUBLIC_API_URL var fel:**
   - Uppdatera till korrekt Railway/Render URL
   - Klicka "Save"
   - Gå till "Deployments" → ⋯ → "Redeploy"
   - Vänta på deployment (2-3 min)
   - Testa igen

---

## Steg 3: Authentication Error (401/403)

**Problem:** Admin lösenord fungerar inte

### Lösning:

1. **Kontrollera ADMIN_PASSWORD i backend:**
   ```
   Railway/Render Dashboard → Your Service → Variables
   
   ADMIN_PASSWORD = ?
   
   ✅ Ska vara satt till ditt lösenord (ex: kl4ddkAk@)
   ❌ FEL om: saknas eller felaktigt
   ```

2. **Testa login direkt:**
   ```bash
   curl -X POST https://your-api.railway.app/api/admin/login \
     -H "Content-Type: application/json" \
     -d '{"password":"ditt-lösenord"}'
   ```
   - ✅ Om du får `{"token":"..."}` → Lösenord OK
   - ❌ Om `{"error":"Ogiltigt lösenord"}` → Fel lösenord

3. **Om ADMIN_PASSWORD var fel:**
   - Uppdatera till korrekt lösenord
   - Railway deployer automatiskt om
   - Vänta 1-2 min
   - Logga ut från admin
   - Logga in igen med rätt lösenord
   - Testa skapa evenemang

---

## Steg 4: Internal Server Error (500)

**Problem:** Database connection eller backend-fel

### Lösning:

1. **Kontrollera backend logs:**
   
   **Railway:**
   ```
   Dashboard → Service → Deployments → Latest → View Logs
   ```
   
   **Render:**
   ```
   Dashboard → Service → Logs
   ```

2. **Leta efter dessa fel i logs:**

   #### "Can't reach database server"
   ```
   ❌ Can't reach database server at ep-xxx.neon.tech:5432
   ```
   
   **Lösning:**
   ```
   1. Gå till Neon Dashboard (neon.tech)
   2. Project → Connection Details
   3. Kopiera "Connection String"
   4. Gå till Railway/Render → Variables
   5. Uppdatera DATABASE_URL med ny connection string
   6. Format: postgresql://user:pass@host.neon.tech/db?sslmode=require
   7. Vänta på redeploy
   8. Testa igen
   ```

   #### "Admin-lösenord inte konfigurerat"
   ```
   ❌ Admin-lösenord inte konfigurerat
   ```
   
   **Lösning:**
   Se Steg 3 ovan

3. **Testa database connection:**
   ```bash
   # Använd din DATABASE_URL från Railway/Render
   DATABASE_URL="postgresql://..." npx prisma db push
   ```
   - ✅ Om "The database is already in sync" → Database OK
   - ❌ Om connection error → DATABASE_URL är fel

---

## Steg 5: CORS Error

**Problem:** `FRONTEND_URL` i backend matchar inte din Vercel URL

### Lösning:

1. **Kontrollera FRONTEND_URL:**
   ```
   Railway/Render Dashboard → Variables
   
   FRONTEND_URL = ?
   
   ✅ Ska vara: https://your-app.vercel.app
   ❌ FEL om: http://localhost:3000 eller annan URL
   ```

2. **Hitta din Vercel URL:**
   ```
   Vercel Dashboard → Your Project → Domains
   Kopiera Production domain
   ```

3. **Uppdatera FRONTEND_URL:**
   - Sätt till exakt din Vercel URL
   - Inkludera `https://`
   - INGEN trailing slash
   - Railway deployer automatiskt om
   - Vänta 1-2 min
   - Testa igen

---

## Steg 6: Kontrollera alla miljövariabler

Om inget av ovanstående hjälpte, kontrollera ALLA miljövariabler:

### Backend (Railway/Render) - MÅSTE vara satt:
```bash
✅ DATABASE_URL = postgresql://...@....neon.tech/...?sslmode=require
✅ ADMIN_PASSWORD = ditt-lösenord
✅ GATEWAY_HMAC_SECRET = någon-lång-sträng
✅ FRONTEND_URL = https://your-app.vercel.app
✅ NODE_ENV = production
✅ SMTP_HOST = smtp.gmail.com
✅ SMTP_PORT = 587
✅ SMTP_USER = din-email@gmail.com
✅ SMTP_PASSWORD = app-password (16 tecken)
✅ EMAIL_FROM = din-email@gmail.com
```

### Frontend (Vercel) - MÅSTE vara satt:
```bash
✅ NEXT_PUBLIC_API_URL = https://your-api.railway.app
```

---

## Steg 7: Testa att allt fungerar

```bash
# 1. Backend health
curl https://your-api.railway.app/health
# → {"status":"ok","timestamp":"..."}

# 2. Admin login
curl -X POST https://your-api.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"ditt-lösenord"}'
# → {"token":"...","message":"Inloggning lyckades"}

# 3. Skapa evenemang via curl
curl -X POST https://your-api.railway.app/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ditt-lösenord" \
  -d '{"name":"Test Event","slug":"test-event-2025","mode":"NORMAL","date":"2025-12-01T10:00:00Z","modeSettings":{}}'
# → JSON med det skapade eventet
```

Om alla tre curl-kommandon fungerar men webappen inte gör det:
→ Problem är i NEXT_PUBLIC_API_URL

---

## ✅ Verifiering

När allt fungerar ska du kunna:

1. ✅ Öppna https://your-app.vercel.app
2. ✅ Klicka "Admin" och logga in
3. ✅ Se admin dashboard
4. ✅ Klicka "Nytt evenemang"
5. ✅ Fylla i formulär och klicka "Skapa evenemang"
6. ✅ Se "Evenemang skapat" (eller liknande)
7. ✅ Se det nya eventet i listan

---

## 🆘 Fortfarande problem?

1. **Läs detaljerade guider:**
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Utökad felsökning
   - [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment guide
   - [TEST_PROTOCOL.md](./TEST_PROTOCOL.md) - Test protokoll

2. **Samla debug-information:**
   - Backend logs (senaste 50 rader)
   - Browser console errors (screenshot)
   - Miljövariabler (censurerade känsliga värden)
   - Curl test results

3. **Vanligaste misstagen:**
   - ❌ Glömde sätta NEXT_PUBLIC_API_URL
   - ❌ NEXT_PUBLIC_API_URL pekar på localhost
   - ❌ DATABASE_URL är felaktig eller från annan miljö
   - ❌ FRONTEND_URL matchar inte exakt Vercel URL
   - ❌ ADMIN_PASSWORD är inte satt i backend
   - ❌ Glömde redeploy efter ändring av miljövariabler

---

## 📊 Sammanfattning av lösningar

| Problem | Snabb lösning | Tid |
|---------|---------------|-----|
| Network Error | Uppdatera NEXT_PUBLIC_API_URL i Vercel | 2 min |
| Auth Error | Sätt ADMIN_PASSWORD i Railway/Render | 2 min |
| Database Error | Uppdatera DATABASE_URL från Neon | 3 min |
| CORS Error | Uppdatera FRONTEND_URL i Railway/Render | 2 min |

**Total tid för att lösa:** Vanligtvis 2-5 minuter efter att problemet identifierats.

---

**💡 Tips:** Spara denna guide för framtida problem-solving!
