# Render Deployment Verifieringschecklista

Detta dokument innehåller en steg-för-steg checklista för att verifiera korrekt Render-deployment konfiguration för jp7an-timing backend API.

## ✅ Fullständig verifieringschecklista

### Steg 1: Kontrollera devDependencies i apps/api/package.json

Öppna filen `apps/api/package.json` och verifiera att ALLA dessa paket finns i `devDependencies`:

```json
{
  "devDependencies": {
    "@types/express": "^4.17.23",
    "@types/papaparse": "^5.3.16", 
    "@types/nodemailer": "^7.0.2",
    "@types/qrcode": "^1.5.5",
    "@types/multer": "^2.0.0",
    "@types/node": "^20.10.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/ws": "^8.18.1"
  }
}
```

**Varför är detta viktigt?**
- TypeScript kräver dessa type definitions för att kompilera koden
- Om de saknas får du "Cannot find module '@types/express'" fel under build
- De MÅSTE vara i `devDependencies`, inte `dependencies`

**Hur verifierar jag?**
```bash
# Lokalt:
cat apps/api/package.json | grep -A 15 "devDependencies"

# Eller öppna filen i din editor och kolla manuellt
```

✅ **Status:** Alla paket finns korrekt i devDependencies

---

### Steg 2: Kontrollera Render Root Directory-inställning

Render måste köra `npm install` i rätt mapp för att hitta `package.json`.

**Gå till Render Dashboard:**

1. Logga in på https://render.com
2. Klicka på din Backend Web Service
3. Gå till **Settings**
4. Hitta **"Root Directory"**

**Korrekt värde:**
```
apps/api
```

**INTE:**
- Tom/blank (då körs npm install i projektroten)
- `/apps/api` (leading slash kan orsaka problem)
- `api` (för kort, projektet är i apps/api)
- Någon annan sökväg

**Varför är detta viktigt?**
- Om Root Directory är fel kommer Render att köra `npm install` i fel mapp
- Den hittar då inte `apps/api/package.json`
- Build kommer att misslyckas

**Screenshot från Render Settings:**
```
Root Directory: [apps/api]
```

✅ **Status:** Korrekt konfigurerat enligt dokumentationen

---

### Steg 3: Kontrollera Build & Start Commands

I Render Settings, verifiera:

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Varför är detta viktigt?**
- `npm install` installerar ALLA dependencies, inklusive devDependencies (behövs för TypeScript)
- `npm run build` kör TypeScript-kompilering (`tsc`)
- `npm start` startar den kompilerade servern

**Vanliga misstag:**
- ❌ Build Command saknar `npm install` → devDependencies installeras inte
- ❌ Build Command är bara `npm run build` → fungerar inte utan installation först
- ✅ Build Command är `npm install && npm run build` → Korrekt!

✅ **Status:** Commands är korrekt konfigurerade

---

### Steg 4: Kontrollera .gitignore

Öppna `.gitignore` i projektroten och verifiera:

**Måste innehålla:**
```
node_modules/
```

**Måste INTE innehålla:**
```
# Dessa får INTE ignoreras:
# package.json
# package-lock.json
# !node_modules/
```

**Varför är detta viktigt?**
- `node_modules/` ska ignoreras (innehåller installerade paket, behöver inte committas)
- `package.json` och `package-lock.json` MÅSTE committas (beskriver dependencies)
- Utan dessa filer kan Render inte veta vilka paket som ska installeras

**Verifiera lokalt:**
```bash
# Kolla .gitignore innehåll:
cat .gitignore | grep node_modules

# Förväntat resultat: node_modules/

# Verifiera att package.json är committad:
git ls-files apps/api/package.json
# Förväntat resultat: apps/api/package.json

# Verifiera att package-lock.json är committad:
git ls-files apps/api/package-lock.json
# Förväntat resultat: apps/api/package-lock.json
```

✅ **Status:** .gitignore är korrekt konfigurerad

---

### Steg 5: Verifiera package.json och package-lock.json är committade

**Kontrollera att filerna finns i Git:**

```bash
# Från projektroten:
git ls-files | grep apps/api/package

# Förväntat resultat:
# apps/api/package-lock.json
# apps/api/package.json
```

**Om filerna INTE finns i output:**

```bash
cd apps/api
git add package.json package-lock.json
git commit -m "Add package files for Render deployment"
git push
```

**Varför är detta viktigt?**
- package.json berättar vilka dependencies som behövs
- package-lock.json låser exakta versioner för reproducerbara builds
- Utan dessa kan Render inte installera rätt paket

✅ **Status:** Båda filerna är committade

---

## 📊 Sammanfattning av konfiguration

### apps/api/package.json

**devDependencies som krävs:**
- ✅ @types/express (^4.17.23)
- ✅ @types/papaparse (^5.3.16)
- ✅ @types/nodemailer (^7.0.2)
- ✅ @types/qrcode (^1.5.5)
- ✅ @types/multer (^2.0.0)

### Render Settings

**Root Directory:**
```
apps/api
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

### .gitignore

**Innehåll:**
```
node_modules/
```

**Committade filer:**
- ✅ apps/api/package.json
- ✅ apps/api/package-lock.json

---

## 🔍 Felsökning

### Problem: "Cannot find module '@types/express'"

**Orsak:** TypeScript type definitions saknas

**Lösning:**
1. Verifiera att @types/express finns i devDependencies (Steg 1)
2. Verifiera att Build Command inkluderar `npm install` (Steg 3)
3. Verifiera att Root Directory är `apps/api` (Steg 2)

### Problem: "package.json not found"

**Orsak:** Render kör npm install i fel mapp

**Lösning:**
1. Verifiera Root Directory är `apps/api` (Steg 2)
2. Verifiera att package.json är committad (Steg 5)

### Problem: Build lyckas men olika versioner än förväntat

**Orsak:** package-lock.json saknas eller är inte committad

**Lösning:**
1. Verifiera att package-lock.json finns lokalt
2. Committa den till Git (Steg 5)
3. Redeploy på Render

---

## ✅ Fullständig verifiering

När alla steg är klara, deploy på Render och verifiera:

```bash
# 1. Vänta på att deployment slutförs i Render Dashboard

# 2. Testa health endpoint:
curl https://your-service.onrender.com/health

# Förväntat resultat:
# {"status":"ok","timestamp":"..."}

# 3. Om det fungerar - SUCCESS! 🎉
```

---

## 📚 Relaterad dokumentation

- [README.md](./README.md) - Översikt och setup
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Felsökning
- [apps/api/README.md](./apps/api/README.md) - Backend API dokumentation

---

**Senast uppdaterad:** 2025-10-10
**Version:** 1.0
