# Tävlingsklasser - Översikt för icke-programmerare

## Vad har lagts till?

Detta PR lägger till en ny funktion för att hantera **tävlingsklasser** i Jp7an-timing systemet. En tävlingsklass är en kategori som löpare kan tävla i, till exempel:
- **10 km** - en 10 kilometer distans
- **M21** - män i åldersgrupp 21-34 år
- **100 varv** - en tävling med 100 varv
- **6 timmars lopp** - löp så långt du kan på 6 timmar

## Vad kan du göra?

Som administratör kan du nu:

1. **Se alla klasser** för ett specifikt tävlingsevent
2. **Lägga till nya klasser** med namn, typ och beskrivning
3. **Redigera befintliga klasser** om något behöver ändras
4. **Ta bort klasser** som inte längre behövs

## Var finns funktionen?

Gå till adminpanelen och följ länken eller navigera direkt till:
```
/admin/event/[ditt-event-id]/classes
```

## Hur funkar det tekniskt?

### För dig som inte programmerar:
- Dina klasser sparas i databasen
- Varje klass är kopplad till ett specifikt event
- Du kan ha obegränsat antal klasser per event
- Klasserna påverkar inte befintliga funktioner som deltagare, resultat eller live-vy

### För dig som är lite teknisk:

**Databasändring:**
- En ny tabell `Class` har lagts till med följande kolumner:
  - `id` - unik identifierare
  - `eventId` - vilket event klassen tillhör
  - `name` - namn på klassen (t.ex. "10 km")
  - `type` - typ av klass ("distance", "laps", "time", "other")
  - `value` - numeriskt värde (t.ex. 10000 för 10 km)
  - `description` - beskrivning av klassen
  - `createdAt` och `updatedAt` - tidsstämplar

**API-endpoints:**
- `GET /event/:eventId/class` - Hämta alla klasser
- `POST /event/:eventId/class` - Skapa ny klass
- `GET /event/:eventId/class/:classId` - Hämta en specifik klass
- `PUT /event/:eventId/class/:classId` - Uppdatera klass
- `DELETE /event/:eventId/class/:classId` - Ta bort klass

**Gränssnitt:**
- En ny sida i Next.js under `/admin/event/[eventId]/classes`
- Formulär för att lägga till och redigera klasser
- Tabell som visar alla klasser med knappar för redigera/ta bort

## Säkerhet och stabilitet

✅ **Inga breaking changes** - Alla befintliga funktioner fortsätter fungera precis som förut

✅ **Validering** - Du kan inte skapa en klass utan namn och typ

✅ **Bekräftelse** - Systemet frågar dig innan en klass raderas

✅ **Isolerat** - Klasserna påverkar inte deltagare, resultat eller annan data

## Testa funktionen

Se filen **TEST_INSTRUCTIONS.md** för detaljerade testinstruktioner.

### Snabbtest:
1. Logga in på `/admin`
2. Gå till `/admin/event/{ditt-event-id}/classes`
3. Klicka "+ Lägg till ny klass"
4. Fyll i namn (t.ex. "10 km") och välj typ (t.ex. "Distans")
5. Spara - klassen ska nu visas i listan
6. Testa att redigera och ta bort

## Framtida utveckling

Denna funktion är grunden för:
- Koppling av deltagare till specifika klasser
- Separata resultatlistor per klass
- Statistik och jämförelser mellan klasser
- Automatisk klassificering baserat på ålder/kön

## Frågor?

Om något är oklart eller om du hittar problem:
1. Läs TEST_INSTRUCTIONS.md för detaljerade instruktioner
2. Kontrollera att du har rätt event-ID
3. Titta i browser console för felmeddelanden
4. Kontakta utvecklaren med en beskrivning av problemet
