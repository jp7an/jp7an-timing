# Jp7an-timing

Molnbaserad tidtagning för Impinj R420 med Neon (Postgres), Render (API/Web), och en liten gateway-app på Windows-laptopen.

Viktigt:
- Enda lokala komponenten: gateway på Windows (krävs för att prata LLRP med R420). Allt annat (API, DB, web) körs i molnet.
- Gratisnivåer: Neon (DB), Render (API/Web). 
- Realtid via SSE/WebSocket.

## Arkitektur

- apps/api: Express API + SSE, Prisma (Postgres/Neon)
- apps/web: Next.js 14 (App Router), publik live + speakerview + admin sidor
- apps/gateway: Node-app på Windows, tar LLRP (eller simulatorläge) och postar till API
- prisma: Prisma schema och migreringar
- packages/shared: delad logik (åldersklasser, pace etc.)

## Snabbstart (moln-deploy, utan lokal körning)

1) Skapa Neon-databas
- Skapa konto på https://neon.tech
- Skapa projekt, kopiera din Postgres-URL (t.ex. postgresql://user:pass@host/db)
- Aktivera psql-funktioner (standard)

2) Skapa Render-tjänster
- Skapa ett nytt repo med denna kod på GitHub (t.ex. jp7an/jp7an-timing)
- På https://render.com:
  - Skapa “Web Service” för API:
    - Repo: ditt repo, root: apps/api
    - Build Command: `npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
    - Start Command: `npm start`
    - Environment:
      - DATABASE_URL = din Neon-URL
      - ADMIN_PASSWORD = ett starkt lösenord
      - GATEWAY_HMAC_SECRET = en hemlig nyckel (för gateway-signering)
      - NODE_ENV = production
  - Skapa “Web Service” för web (Next.js):
    - Repo: samma, root: apps/web
    - Build Command: `npm ci && npm run build`
    - Start Command: `npm start`
    - Environment:
      - NEXT_PUBLIC_API_URL = API-bas-URL från Render (t.ex. https://jp7an-api.onrender.com)
      - NODE_ENV = production

Tips: Du kan även köra webben på Vercel (gratis), sätt då NEXT_PUBLIC_API_URL till Render-API:et.

3) Kör migrering
- Render byggsteget kör `prisma migrate deploy`. Bekräfta att API:n startar (Render-loggar visar “API listening”).

4) Konfigurera admin-lösen
- ADMIN_PASSWORD satt i API:ets env. Använd detta i admininloggningen.

5) Gateway på Windows (enda lokala delen)
- Installera Node.js LTS.
- Koppla R420 och Windows-laptopen via Ethernet (laptop kan ha internet via Wi-Fi/4G).
- Ställ R420 IP (t.ex. 192.168.1.2) så laptopen når den.
- I mappen apps/gateway:
  - Kopiera `.env.example` till `.env`, fyll i:
    - API_URL = din Render API-url (t.ex. https://jp7an-api.onrender.com)
    - EVENT_ID = event-id du skapar i admin
    - READER_HOST = R420 IP (t.ex. 192.168.1.2)
    - GATEWAY_HMAC_SECRET = exakt samma som i API
  - Kör `npm ci` och sedan `npm start`
- Simulatorläge: sätt `DRIVER=simulator` i `.env` så kan du generera testpassager utan läsare.

6) Skapa ett event i admin
- Gå till web-appen (Render/Vercel) -> /admin
- Logga in med ADMIN_PASSWORD
- Skapa event (välj läge Normal/Backyard/Varv/Tid)
- Importera deltagare (CSV semikolon; UTF‑8/CP1252 stöds) eller registrera via formulär
- Tilldela bib/EPC i admin (USB-läsare som keyboard wedge stöds)

7) Live
- Publik länk: /live/{event-slug}
- Speakerview: /live/{event-slug}/speakerview
- För tidslopp: aktivera “senaste varvningar överst”-läge direkt i livekomponenten (standard för tidsloppsskärmen 20 m efter mattan)


## Tävlingsklasser (Class Management)
- Hantera tävlingsklasser för varje event via: `/admin/event/{eventId}/classes`
- Skapa klasser med namn, typ (distans/varv/tid/annat), värde och beskrivning
- Exempel: "10 km" (distans: 10000 m), "M21" (åldersklass), "100 varv" (varv: 100)
- Full CRUD via API: GET/POST/PUT/DELETE `/event/:eventId/class[/:classId]`
- Se TEST_INSTRUCTIONS.md och FEATURES.md för detaljerad info
## Anmälan & betalning (översikt)
- Obligatoriskt: förnamn, efternamn, kön (M/K), födelsedatum, e‑post, nationalitet (ISO3), klubb valfri
- Swish QR: alias + anmälningsnummer i meddelande (admin ställer pris). Manuell verifiering i admin.

## Exporter
- PDF: tabell med fälten som i live (snygg enkel layout)
- CSV (detaljerad): samtliga varvtider per löpare
- Svensk Friidrott CSV:
  - Header: type;race_name;city;date;organizer;distance;gender;course_measurer;date_of_measurement;placing;agegroup;agegroupplacing;extra;firstname;lastname;country;club;birthday;yb;result;netto;5kmsplit
  - Admin fyller A,B,C,D,E,F,H,I
  - G (gender): “M” eller “K” per rad (från deltagarens kön)
  - M (extra): tom under header
  - R (birthday): tom under header (integritet)
  - P (country): tom för Sverige, annars ISO3 (t.ex. FIN)
  - K (agegroup): UM20/UK20 (≤20), M21/K21 (21–34), M35/K35 i 5-årssteg
  - L (agegroupplacing): beräknas klassvis
  - U (netto): chip time för Normal/Varvlopp

## Miljövariabler

API:
- DATABASE_URL
- ADMIN_PASSWORD
- GATEWAY_HMAC_SECRET
- PORT (valfri; Render sätter själv)
- NODE_ENV=production

Web:
- NEXT_PUBLIC_API_URL
- NODE_ENV=production

Gateway (.env i apps/gateway):
- API_URL
- EVENT_ID
- READER_HOST
- DRIVER=llrp|simulator (börja med simulator)
- ANTI_DUP_MS=2000
- GATEWAY_HMAC_SECRET

## Windows NTP
- Säkerställ att Windows klocka är synkad (Standard: time.windows.com). Det räcker för robust tidsstämpling.

## Nästa steg
- Byt DRIVER=llrp när vi testar mot R420 (lägger in faktisk LLRP-klient)
- Utöka ranking-service för full logik per läge (grunden finns)