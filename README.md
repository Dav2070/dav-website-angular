# dav website · Angular

Angular-Portierung von `../dav-website`, mit den ursprünglichen deutschen und englischen Inhalten, Bildern, Seiten und API-Funktionen. Die Angular-/Lit-SSR-Integration orientiert sich an PocketLib.

## Starten

Node.js 24.15 oder neuer innerhalb von Node 24 verwenden (alternativ eine von Angular 22 unterstützte Node-Version).

```sh
npm ci
npm run dev
```

Die App läuft auf **http://localhost:3000**. Für einen Produktionsbuild mit SSR:

```sh
npm run build
npm start
```

`npm run dev` und `npm start` lesen eine vorhandene `.env` automatisch ein. Eine Vorlage liegt in `.env.example`. Die öffentlichen Informationsseiten funktionieren ohne Zugangsdaten. Für Anmeldung, Registrierung, Passwortänderungen und die Konto-/Entwicklerfunktionen die vorhandene Serverkonfiguration des bisherigen Projekts übernehmen:

- `ENV`: `development`, `staging` oder `production`; bestimmt die dav-API-Umgebung. Ohne Angabe wird die lokale API auf Port 4000 verwendet.
- `BASE_URL`: erlaubte Website-Ursprünge, kommasepariert, einschließlich Protokoll und Port. Lokal: `http://localhost:3000`. Wird auch für die SSR-Hostprüfung verwendet.
- `DAV_API_KEY`, `DAV_SECRET_KEY`, `DAV_UUID`: serverseitige Authentifizierung bei dav.
- `STRIPE_SECRET_KEY`, `STRIPE_DAV_PLUS_EUR_PLAN_ID`, `STRIPE_DAV_PRO_EUR_PLAN_ID`: bestehende Stripe-Konfiguration für Abos. Die Plan-IDs werden mit dem aktuellen Stripe-SDK als `price` übergeben.
- `PORT`: Port des gebauten Express-Servers, standardmäßig 3000.

Keine `.env` oder Zugangsdaten in die Versionsverwaltung aufnehmen. Für Änderungen an lokalen Ports auch `BASE_URL` anpassen. Bei `ENV=production` werden Sitzungscookies ausschließlich über HTTPS übertragen.

## Umsetzung

- Standalone-Komponenten, Angular Router, Signals und HttpClient; zonenlos.
- Angular 22.1.7, CLI/SSR 22.1.8, `dav-ui-components` 1.19, `dav-js` 3.2.3 und `@dav-apps/ssr-angular` 0.1.1. Die Git-Abhängigkeiten sind auf veröffentlichte Tags festgelegt; `package-lock.json` fixiert die Installation. TypeScript 6.0 ist die neueste von Angular 22.1 unterstützte Reihe, deshalb kein TypeScript 7.
- Express 5 und `AngularNodeAppEngine` rendern die Angular-Seiten pro Anfrage. Lit-Komponenten werden einschließlich ihres Shadow DOM gerendert und anschließend hydriert. Der explizite `outputMode: server` bindet dieselben Express-Routen auch unter `ng serve` ein.
- `src/server/backend.ts` enthält die übernommenen dav-/Stripe-Funktionen. Statt EJS liefert derselbe Code serialisierbare Seitendaten an SSR oder `/api/page?path=…`; dadurch bleiben Berechtigungsprüfungen und Weiterleitungen bei Browsernavigation erhalten.
- Anfragebezogene Seitendaten werden über Angular TransferState zur Hydrierung übertragen. Zugangstokens bleiben in HttpOnly-Cookies; Server-Schlüssel gelangen nicht ins Frontend. Personalisierte Antworten werden nicht gecacht.
- Deutsch/Englisch werden serverseitig über `Accept-Language` ausgewählt. Alle ursprünglichen Texte einschließlich Datenschutz und PocketLib-Nutzungsbedingungen sind übernommen.
- Dark Mode folgt standardmäßig dem System. Der Schalter in der Navigation wechselt zwischen System, Dunkel und Hell; die Auswahl wird als Cookie gespeichert und bereits beim SSR berücksichtigt. CSS-Farbvariablen sorgen auch vor der Hydrierung für passende dav-Komponentenfarben.
- Responsives CSS Grid/Flexbox ersetzt Bootstrap. Formulare, Buttons, Karten, Meldungen, Dialoge, Toggles und Ladeanzeigen stammen aus `dav-ui-components`. Semantische HTML-Elemente werden für Inhalt, Links und die Preisvergleichstabelle verwendet. Kein Office UI Fabric, Bootstrap oder Font Awesome Pro.
- Chart.js 4 und Cropper.js 2 werden erst für Statistikdiagramme bzw. den Profilbild-Zuschnitt geladen. Diese browserabhängigen Funktionen werden nach dem Rendern initialisiert.

## Seiten

`/`, `/apps`, `/pricing`, `/contact`, `/privacy`, `/pocketlib/terms`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/user`, `/dev`, `/dev/statistics`, `/dev/:appId`, `/dev/:appId/statistics`.

Die bisherigen `/email-link`- und `/logout`-Routen sowie `/api/*` bleiben erhalten. App-Anmeldungen unterstützen weiterhin `appId`, `apiKey` und `redirectUrl`; Website-Anmeldungen unterstützen `redirect`. Kontoeinstellungen öffnen die Abos auch über `/user#plans`. Unbekannte Seiten liefern HTTP 404.

## Prüfung

Wie gewünscht sind keine Tests und kein Test-Framework angelegt. Die Portierung wird über den Produktionsbuild und direkte HTTP-/SSR-Prüfungen verifiziert. Für die abschließende Sichtprüfung im Browser sind insbesondere mobile Navigation, Formularvalidierung und Theme-Wechsel relevant; echte Konto- und Stripe-Abläufe benötigen eine konfigurierte API und ein passendes Testkonto.

Geprüft wurden der Produktionsbuild, SSR einschließlich Lit-Shadow-DOM in Produktion und unter `ng serve`, deutsche/englische Seitenausgabe, Dark-Mode-Cookie, öffentliche Routen, 404-Antworten, Login-Weiterleitungen und die JSON-Seitendaten-API. Ohne laufende dav-API zeigt `/apps` eine serverseitig gerenderte Fehlermeldung mit HTTP 503. Ein verbundener Browser stand während der Portierung nicht zur Verfügung; visuelle Prüfung und echte Login-/Stripe-Abläufe sind deshalb noch offen.

Das aktuelle dav-js-SDK enthält weiterhin ältere transitive CommonJS-Abhängigkeiten; die Portierung nutzt das neueste veröffentlichte dav-js-Release. Diese SDK-Abhängigkeiten werden ausschließlich serverseitig benötigt.
