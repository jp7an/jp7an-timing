# Testprotokoll för jp7an-timing
## Enkelt och tydligt testprotokoll med steg-för-steg instruktioner

Detta protokoll är utformat för att vara lätt att följa och ge tydlig feedback på.

---

## ✅ Del 1: Permanent Inloggning (Fixad i denna PR)

### Test 1.1: Logga in första gången
**Steg:**
1. Gå till `[DIN-URL]/admin`
2. Skriv in lösenordet
3. Klicka "Logga in"

**Förväntat resultat:**
- ✓ Du kommer till Admin Dashboard
- ✓ Du ser meddelandet "Du förblir permanent inloggad på denna enhet efter inloggning"
- ✓ Ingen checkbox för "Håll mig inloggad i 14 dagar"

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Skriv här vad som hände]
```

---

### Test 1.2: Testa om du förblir inloggad
**Steg:**
1. Efter att ha loggat in, navigera runt i systemet
2. Klicka på "Nytt event"
3. Gå tillbaka till Dashboard
4. Klicka på "Chiputlämning"
5. Stäng webbläsaren helt
6. Öppna webbläsaren igen och gå till `[DIN-URL]/admin/dashboard`

**Förväntat resultat:**
- ✓ Du navigerar fritt mellan alla sidor utan att loggas ut
- ✓ Efter att ha stängt och öppnat webbläsaren är du fortfarande inloggad
- ✓ Du behöver INTE logga in igen

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Skriv här om du blev utloggad någonstans eller om allt fungerade]
```

---

## 📋 Del 2: Förbättrad Admin Dashboard (Fixad i denna PR)

### Test 2.1: Kontrollera Admin Dashboard layout
**Steg:**
1. Logga in och gå till Admin Dashboard
2. Observera layouten och funktionerna

**Förväntat resultat:**
- ✓ Ser en "📋 Snabbåtgärder" sektion längst upp med 4 knappar:
  - ➕ Nytt evenemang
  - 🏷️ Chiputlämning  
  - 📝 Anmälningssida
  - 🏠 Startsida
- ✓ Ser en "🏁 Evenemang" sektion med tabell över alla evenemang
- ✓ Ser en "💡 Hjälp & Information" sektion längst ner
- ✓ Alla knappar har emoji-ikoner för bättre visuell orientering

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv vad du ser och om något saknas eller är otydligt]
```

---

### Test 2.2: Testa navigationsmeny i admin-läge
**Steg:**
1. När du är inloggad, titta på navigationsmenyn längst upp
2. Navigera mellan olika admin-sidor

**Förväntat resultat:**
- ✓ Ser följande länkar i navbar:
  - 📋 Dashboard
  - ➕ Nytt event
  - 🏷️ Chiputlämning
  - 🏠 Startsida
- ✓ Alla länkar fungerar och tar dig till rätt sida
- ✓ Navbar är synlig på alla admin-sidor OCH på Chiputlämning-sidan

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Testa varje länk och beskriv om något inte fungerar]
```

---

### Test 2.3: Testa alla funktioner i Dashboard
**Steg:**
1. Från Dashboard, testa varje knapp och funktion:
   - Klicka "➕ Nytt evenemang"
   - Gå tillbaka, klicka "🏷️ Chiputlämning"
   - Gå tillbaka, klicka "📝 Anmälningssida"
   - Gå tillbaka, klicka "🏠 Startsida"

**Förväntat resultat:**
- ✓ Alla knappar fungerar och tar dig till rätt sida
- ✓ "Nytt evenemang" tar dig till formulär för att skapa event
- ✓ "Chiputlämning" tar dig till chip-hanteringssidan
- ✓ "Anmälningssida" tar dig till den publika anmälningssidan
- ✓ "Startsida" tar dig till den publika startsidan

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv om någon knapp inte fungerar eller tar dig till fel ställe]
```

---

## 🏁 Del 3: Evenemang-funktionalitet

### Test 3.1: Skapa ett nytt evenemang
**Steg:**
1. Klicka "➕ Nytt evenemang" från Dashboard
2. Fyll i formuläret:
   - Namn: "Test Event 2024"
   - Beskrivning: "Detta är ett test"
   - Tävlingsläge: "Normal (Start och mål)"
   - Datum: Välj dagens datum eller framtida datum
   - Plats: "Stockholm"
3. Klicka "Skapa evenemang"

**Förväntat resultat:**
- ✓ Formuläret är lätt att förstå
- ✓ Slug genereras automatiskt från namnet
- ✓ Efter att ha klickat "Skapa", tas du tillbaka till Dashboard
- ✓ Ditt nya evenemang visas i listan

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv om något gick fel eller om något var otydligt]
```

---

### Test 3.2: Redigera ett evenemang
**Steg:**
1. Från Dashboard, hitta ett evenemang
2. Klicka "✏️ Redigera"
3. Ändra namnet till något nytt
4. Klicka "Spara ändringar"

**Förväntat resultat:**
- ✓ Redigeringsformuläret visar befintliga värden
- ✓ Du kan ändra värden
- ✓ Efter sparande, tas du tillbaka till Dashboard
- ✓ Ändringarna syns i listan

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv vad som hände]
```

---

### Test 3.3: Visa live-resultat
**Steg:**
1. Från Dashboard, klicka "📊 Live" för ett evenemang
2. En ny flik öppnas med live-sidan

**Förväntat resultat:**
- ✓ Live-sidan öppnas i ny flik
- ✓ Sidan visar evenemangsinformation
- ✓ Ingen inloggning krävs för att se live-sidan (publik)

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv vad du ser på live-sidan]
```

---

### Test 3.4: Radera ett evenemang
**Steg:**
1. Från Dashboard, klicka "🗑️ Radera" för ett test-evenemang
2. Bekräfta borttagningen

**Förväntat resultat:**
- ✓ En bekräftelsedialog visas
- ✓ Efter bekräftelse försvinner evenemanget från listan
- ✓ Sidan uppdateras automatiskt

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv om raderingen fungerade]
```

---

## 🏷️ Del 4: Chiputlämning

### Test 4.1: Sök deltagare
**Steg:**
1. Gå till Chiputlämning (via Dashboard eller navbar)
2. Sök efter en deltagare (om du har lagt till någon)

**Förväntat resultat:**
- ✓ Sidan kräver inloggning (skyddad)
- ✓ Sökfunktionen fungerar
- ✓ Om deltagare hittas, visas de i en tabell

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv vad som hände när du sökte]
```

---

## 📝 Del 5: Anmälningsfunktion

### Test 5.1: Testa anmälningsformulär
**Steg:**
1. Klicka "📝 Anmälningssida" eller gå till `[DIN-URL]/anmalan`
2. Välj ett evenemang (om det finns några)
3. Fyll i formuläret med testdata

**Förväntat resultat:**
- ✓ Formuläret visas korrekt
- ✓ Du kan välja ett evenemang från dropdown
- ✓ Du kan fylla i deltagareuppgifter
- ✓ Formuläret kan skickas

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv hur anmälningsprocessen fungerade]
```

---

## 🔒 Del 6: Säkerhet och behörigheter

### Test 6.1: Testa åtkomst utan inloggning
**Steg:**
1. Logga ut från systemet
2. Försök gå direkt till:
   - `[DIN-URL]/admin/dashboard`
   - `[DIN-URL]/chiputlamning`
   - `[DIN-URL]/admin/events/new`

**Förväntat resultat:**
- ✓ Du redirectas automatiskt till login-sidan
- ✓ Du kan INTE komma åt skyddade sidor utan inloggning

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv om du kunde komma åt något utan inloggning]
```

---

### Test 6.2: Testa åtkomst till publika sidor
**Steg:**
1. Utan att logga in, gå till:
   - `[DIN-URL]/` (startsida)
   - `[DIN-URL]/anmalan` (anmälningssida)
   - `[DIN-URL]/live/[event-slug]` (live-sida)

**Förväntat resultat:**
- ✓ Alla publika sidor är tillgängliga utan inloggning
- ✓ Inga fel eller omdirigering till login

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv om du kunde komma åt publika sidor]
```

---

## 📱 Del 7: Responsivitet och användarvänlighet

### Test 7.1: Testa på mobil/tablet
**Steg:**
1. Öppna systemet på en mobil eller tablet
2. Eller använd webbläsarens "responsive mode" (F12 → device toolbar)
3. Navigera genom Dashboard och andra sidor

**Förväntat resultat:**
- ✓ Dashboard visas korrekt på mindre skärmar
- ✓ Knappar och tabeller är läsbara
- ✓ Navigation fungerar på mobil

**Status:** ☐ OK | ☐ Fel | ☐ Ej testad

**Feedback/Kommentarer:**
```
[Beskriv hur det fungerade på mindre skärmar]
```

---

## 🎯 Sammanfattning och Övergripande Feedback

### Vad fungerar bra:
```
[Lista saker som fungerar väl]
```

### Vad behöver förbättras:
```
[Lista saker som inte fungerar eller kan förbättras]
```

### Saknade funktioner:
```
[Lista funktioner du förväntar dig men inte hittar]
```

### Förvirrande delar:
```
[Lista saker som är otydliga eller förvirrande]
```

### Övrig feedback:
```
[Lägg till annan feedback här]
```

---

## 📸 Screenshots (Valfritt)

Om möjligt, ta screenshots av:
1. Admin Dashboard
2. Navbar i admin-läge
3. Evenemangslista
4. Eventuella fel eller problem du stöter på

Bifoga dem i din feedback!

---

## ✉️ Hur du ger feedback

1. Gå igenom varje test ovan
2. Markera status: ☐ OK | ☐ Fel | ☐ Ej testad
3. Fyll i "Feedback/Kommentarer" för varje test
4. Fyll i sammanfattningen längst ner
5. Skicka tillbaka detta dokument (eller klistra in i ett issue/PR)

**Tack för att du testar! Din feedback är ovärderlig! 🙏**
