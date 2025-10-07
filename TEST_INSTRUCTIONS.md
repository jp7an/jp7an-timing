# TEST_INSTRUCTIONS.md - Tävlingsklasser (Class Management)

## Översikt
Detta dokument beskriver hur man testar den nya funktionen för att hantera tävlingsklasser (Classes) för ett event i Jp7an-timing systemet.

## Vad är nytt?
En ny administrativ funktion som låter dig:
- Visa alla tävlingsklasser för ett specifikt event
- Lägga till nya klasser med namn, typ, värde och beskrivning
- Redigera befintliga klasser
- Ta bort klasser

## Tekniska förändringar
### Databas (Prisma Schema)
- **Ny tabell**: `Class` med följande fält:
  - `id` (unik identifierare)
  - `eventId` (kopplar klassen till ett event)
  - `name` (t.ex. "M21", "K40", "10km")
  - `type` (typ: "distance", "laps", "time", eller "other")
  - `value` (numeriskt värde: meter för distans, antal för varv, sekunder för tid)
  - `description` (valfri beskrivning)
  - `createdAt` och `updatedAt` (tidsstämplar)

- **Migration**: En SQL-migration skapas i `prisma/migrations/YYYYMMDDHHMMSS_add_class_model/migration.sql`

### API-ändringar (Express API)
Nya API-endpoints i `/apps/api/src/index.ts`:

1. **GET** `/event/:eventId/class`
   - Hämtar alla klasser för ett event
   - Sorteras efter skapandedatum

2. **POST** `/event/:eventId/class`
   - Skapar en ny klass
   - Kräver: `name`, `type`
   - Valfritt: `value`, `description`

3. **GET** `/event/:eventId/class/:classId`
   - Hämtar en specifik klass

4. **PUT** `/event/:eventId/class/:classId`
   - Uppdaterar en befintlig klass

5. **DELETE** `/event/:eventId/class/:classId`
   - Tar bort en klass

### Admin UI (Next.js)
Ny sida: `/admin/event/[eventId]/classes`
- React-baserad klient-komponent
- Formulär för att skapa och redigera klasser
- Tabell som visar alla klasser
- Knappar för redigera och ta bort

## Förberedelser för testning

### 1. Sätt upp miljön
```bash
# Klona repo (om du inte redan har det)
git clone <repo-url>
cd jp7an-timing

# Installera dependencies
npm install

# Konfigurera miljövariabler
# Skapa en .env-fil i root med:
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="ditt-lösenord"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 2. Kör migrations (om du har en databas)
```bash
cd prisma
npx prisma migrate deploy --schema=schema.prisma
```

### 3. Starta tjänsterna
```bash
# Terminal 1: API
cd apps/api
npm run dev

# Terminal 2: Web
cd apps/web
npm run dev
```

## Steg-för-steg testinstruktioner

### Test 1: Få tillgång till admin-sidan
1. Öppna din webbläsare och gå till: `http://localhost:3000/admin`
2. Logga in med ditt ADMIN_PASSWORD
3. Du ska komma till adminpanelen (`/admin/panel`)

### Test 2: Navigera till klasshantering
Du behöver ett existerande event ID. För att få det:
- Använd API-anropet: `GET http://localhost:3001/events/:slug`
- Eller kontrollera direkt i databasen

Navigera sedan till:
```
http://localhost:3000/admin/event/{DITT-EVENT-ID}/classes
```

Ersätt `{DITT-EVENT-ID}` med ett faktiskt event-ID (t.ex. `clxyz123...`)

### Test 3: Visa tom lista
**Förväntat resultat:**
- Sidan laddas utan fel
- Text visas: "Inga klasser har lagts till än."
- Knappen "+ Lägg till ny klass" visas

### Test 4: Lägg till en ny klass (Distans)
1. Klicka på "+ Lägg till ny klass"
2. Fyll i formuläret:
   - **Namn**: `10 km`
   - **Typ**: `Distans (meter)`
   - **Värde**: `10000`
   - **Beskrivning**: `10 kilometer sträcka för alla åldersgrupper`
3. Klicka "Skapa"

**Förväntat resultat:**
- Formuläret stängs
- Listan uppdateras och visar den nya klassen
- Tabellen visar: Namn "10 km", Typ "Distans", Värde "10000 meter"

### Test 5: Lägg till en ny klass (Varv)
1. Klicka på "+ Lägg till ny klass" igen
2. Fyll i:
   - **Namn**: `100 varv`
   - **Typ**: `Varv (antal)`
   - **Värde**: `100`
   - **Beskrivning**: `Hundra varv på banan`
3. Klicka "Skapa"

**Förväntat resultat:**
- Klassen läggs till i listan
- Värde visas som "100 varv"

### Test 6: Lägg till en ny klass (Tid)
1. Klicka på "+ Lägg till ny klass"
2. Fyll i:
   - **Namn**: `6 timmars lopp`
   - **Typ**: `Tid (sekunder)`
   - **Värde**: `21600`
   - **Beskrivning**: `Löp så långt du kan på 6 timmar`
3. Klicka "Skapa"

**Förväntat resultat:**
- Klassen läggs till
- Värde visas som "21600 sekunder"

### Test 7: Lägg till klass utan värde
1. Klicka på "+ Lägg till ny klass"
2. Fyll i:
   - **Namn**: `Öppen klass`
   - **Typ**: `Annat`
   - **Värde**: (lämna tom)
   - **Beskrivning**: `Öppen tävlingsklass`
3. Klicka "Skapa"

**Förväntat resultat:**
- Klassen skapas utan fel
- Värde-kolumnen visar "-"

### Test 8: Redigera en klass
1. Leta upp klassen "10 km" i tabellen
2. Klicka på "Redigera"
3. Ändra:
   - **Namn**: `10 kilometer`
   - **Beskrivning**: `Officiell 10km distans`
4. Klicka "Uppdatera"

**Förväntat resultat:**
- Formuläret stängs
- Listan uppdateras med de nya värdena

### Test 9: Avbryt redigering
1. Klicka "Redigera" på en klass
2. Gör några ändringar
3. Klicka "Avbryt"

**Förväntat resultat:**
- Formuläret stängs
- Inga ändringar sparas

### Test 10: Ta bort en klass
1. Leta upp en klass du vill ta bort
2. Klicka "Ta bort"
3. En bekräftelsedialog visas: "Är du säker på att du vill ta bort denna klass?"
4. Klicka "OK"

**Förväntat resultat:**
- Klassen försvinner från listan
- Listan uppdateras automatiskt

### Test 11: Ta bort - Avbryt
1. Klicka "Ta bort" på en klass
2. I bekräftelsedialogren, klicka "Avbryt"

**Förväntat resultat:**
- Ingen klass tas bort
- Listan förblir oförändrad

### Test 12: Validering - Tom namn
1. Klicka "+ Lägg till ny klass"
2. Lämna **Namn** tomt
3. Försök klicka "Skapa"

**Förväntat resultat:**
- HTML5-validering förhindrar submit
- Fältmeddelande visas: "Please fill out this field" (eller liknande på svenska)

### Test 13: API-test direkt (valfritt, för tekniska användare)

**Hämta alla klasser:**
```bash
curl http://localhost:3001/event/{EVENT_ID}/class
```

**Skapa en klass:**
```bash
curl -X POST http://localhost:3001/event/{EVENT_ID}/class \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marathon",
    "type": "distance",
    "value": 42195,
    "description": "Standard marathon distance"
  }'
```

**Uppdatera en klass:**
```bash
curl -X PUT http://localhost:3001/event/{EVENT_ID}/class/{CLASS_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Marathon",
    "value": 42200
  }'
```

**Ta bort en klass:**
```bash
curl -X DELETE http://localhost:3001/event/{EVENT_ID}/class/{CLASS_ID}
```

**Förväntat resultat:**
- Alla API-anrop fungerar korrekt
- Status codes: 200/201 för success, 204 för delete, 404 för not found, 400 för bad request

## Vanliga problem och lösningar

### Problem: "Event not found"
**Lösning**: Kontrollera att eventId är korrekt. Skapa ett event först om det inte finns.

### Problem: API-anrop misslyckas
**Lösning**: 
- Kontrollera att API:et körs på port 3001
- Verifiera att NEXT_PUBLIC_API_URL är korrekt satt
- Kontrollera CORS-inställningar

### Problem: Databas-fel
**Lösning**:
- Kör migrations: `npx prisma migrate deploy`
- Verifiera DATABASE_URL
- Kontrollera att databasen är tillgänglig

### Problem: Sidan laddar inte
**Lösning**:
- Kontrollera att Next.js dev server körs
- Titta i browser console för JavaScript-fel
- Kontrollera Network-fliken i DevTools

## Verifiering av ingen breaking change

### Testa att befintlig funktionalitet fungerar:
1. **Events**: Skapa/visa/redigera events ska fungera som tidigare
2. **Import**: CSV-import av deltagare ska fungera
3. **Live-vy**: `/live/{slug}` ska visa resultaten som vanligt
4. **Speaker-vy**: `/live/{slug}/speakerview` ska fungera
5. **Admin-panel**: Andra admin-funktioner ska vara opåverkade

### Databaskontroll:
```sql
-- Kontrollera att Class-tabellen skapades
SELECT * FROM "Class" LIMIT 10;

-- Kontrollera att andra tabeller är opåverkade
SELECT * FROM "Event" LIMIT 5;
SELECT * FROM "Participant" LIMIT 5;
```

## Support och hjälp
Om du stöter på problem:
1. Kontrollera Console-loggar (browser och terminal)
2. Verifiera att alla dependencies är installerade
3. Se till att miljövariabler är korrekt satta
4. Testa API-endpoints direkt med curl eller Postman

## Sammanfattning
När alla tester är genomförda ska du kunna:
- ✅ Skapa flera klasser för ett event
- ✅ Redigera befintliga klasser
- ✅ Ta bort klasser
- ✅ Se alla klasser i en tabell
- ✅ Bekräfta att befintliga funktioner inte påverkades
