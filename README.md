# GS Form Updater

Aplikacja webowa do wczytywania raportów sprzedaży w formacie Excel (`.xlsx`, `.xls`, `.csv`), automatycznego mapowania kodów produktów na markę i model SKU (z wykorzystaniem podglądu oryginalnego opisu z Kolumny D) oraz zapisu danych do Google Sheets (zakładka `Form Responses 1`).

Działa w 100% po stronie klienta (Client-Side SPA) bez konieczności konfiguracji zewnętrznych serwerów.

---

## 🚀 Wdrożenie na GitHub Pages (Krok po kroku)

Repozytorium jest w pełni skonfigurowane do automatycznego hostingu na **GitHub Pages**.

### Sposób 1: Automatycznie przez GitHub Actions (Zalecany)

1. Przejdź do swojego repozytorium na **GitHubie**.
2. Kliknij zakładkę **Settings** (Ustawienia) u góry.
3. W menu po lewej stronie wybierz **Pages**.
4. W sekcji **Build and deployment**:
   - **Source**: wybierz **GitHub Actions**.
5. To wszystko! Plik workflow `.github/workflows/deploy.yml` automatycznie zbuduje i opublikuje Twoją stronę pod adresem:
   `https://<twoj-login-github>.github.io/<nazwa-repozytorium>/`

### Sposób 2: Ręczne wdrożenie z terminala (npm run deploy)

Jeśli wolisz wdrożyć stronę bezpośrednio ze swojego komputera:

```bash
# 1. Zainstaluj zależności
npm install

# 2. Zbuduj i opublikuj na gałęzi gh-pages
npm run deploy
```

Następnie w **Settings > Pages** ustaw:
- **Source**: *Deploy from a branch*
- **Branch**: *gh-pages* / *(root)*

---

## 📄 Wersja Single-File HTML (Bez instalacji Node.js/npm)

W folderze `public/` znajduje się również kompletny, samodzielny plik HTML:
- **`public/gs-form-updater.html`**

Możesz go:
1. Pobrać na dysk komputera i otworzyć w dowolnej przeglądarce podwójnym kliknięciem myszy (działa całkowicie offline bez Node.js).
2. Skopiować jako plik `index.html` do projektu **Google Apps Script** wewnątrz Arkusza Google.

---

## 🛠️ Uruchomienie lokalne (Development)

```bash
# Instalacja zależności
npm install

# Uruchomienie lokalnego serwera deweloperskiego
npm run dev

# Zbudowanie wersji produkcyjnej do folderu dist/
npm run build
```
