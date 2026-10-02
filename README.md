# Strona internetowa — Ignacy Mikołajczak, psycholog sportu

Prosta strona-wizytówka: jeden plik HTML, styl, skrypt i kilka plików z danymi. Nie trzeba niczego
instalować ani „budować”. Każda zmiana zapisana w repozytorium po 1–2 minutach pojawia się na stronie.

> **Uwaga:** wszystkie treści (kariera, edukacja, doświadczenie, opisy) są na razie **przykładowe**.
> Przed udostępnieniem strony podmień je na prawdziwe (patrz punkt 7).

## Co gdzie jest

| Plik / folder | Co zawiera |
|---|---|
| `data/career.json` | Kariera sportowa (oś czasu) |
| `data/education.json` | Edukacja |
| `data/experience.json` | Doświadczenie zawodowe (karty ze zdjęciem) |
| `img/` | Zdjęcia: `portrait.svg` (portret), `experience/` (zdjęcia do kart) |
| `index.html` | Teksty stałe: filozofia, problemy, współpraca, kontakt (e-mail) |
| `css/style.css` | Wygląd (kolory, fonty). Kolory są na samej górze pliku |
| `js/main.js` | Skrypt wczytujący dane. Nie trzeba go ruszać |

---

## 1. Jak dodać lub edytować wpis (pliki JSON)

Każdy plik w folderze `data/` to lista wpisów w nawiasach kwadratowych `[ ... ]`. Jeden wpis to blok
w nawiasach klamrowych `{ ... }`. Wpisy wyświetlają się w takiej kolejności, w jakiej są w pliku,
więc najnowszy wpis dodawaj na górze.

### Edycja bezpośrednio na github.com (najprościej)

1. Wejdź na stronę repozytorium na github.com i otwórz folder `data`.
2. Kliknij plik, np. `experience.json`.
3. Kliknij ikonę ołówka (**Edit this file**) w prawym górnym rogu podglądu pliku.
4. Wprowadź zmiany (instrukcja niżej).
5. Kliknij zielony przycisk **Commit changes…**, opcjonalnie wpisz krótki opis („Dodano nowy klub”)
   i potwierdź **Commit changes**.
6. Po 1–2 minutach odśwież stronę.

### Dodanie nowego wpisu: skopiuj jeden blok

Przykład dla `data/experience.json`. Skopiuj **cały** blok od `{` do `}` razem z przecinkiem
i wklej go zaraz po otwierającym nawiasie `[`:

```json
[
  {
    "role": "Psycholog sportu",
    "organization": "Klub XYZ",
    "period": "2025 – obecnie",
    "image": "img/experience/klub-xyz.jpg",
    "description": "Dwa do czterech zdań o tym, czym się zajmujesz w tym miejscu."
  },
  {
    "role": "… wcześniejszy wpis …",
    ...
  }
]
```

Pola w pozostałych plikach:

- `career.json`: `period` (lata), `club` (klub), `league` (liga), `position` (pozycja), `description` (opis)
- `education.json`: `period` (lata), `degree` (kierunek / kurs), `school` (uczelnia), `description` (opis, może być pusty: `""`)

Jeśli nie chcesz jakiegoś pola, zostaw puste cudzysłowy (`""`). Wtedy ta linijka się nie wyświetli.

Jeśli plik zawiera pustą listę `[]`, cała podsekcja razem z nagłówkiem jest ukryta. Tak jest teraz
z edukacją: wystarczy dodać do `education.json` pierwszy wpis, a sekcja się pojawi:

```json
[
  {
    "period": "2019 – 2024",
    "degree": "Psychologia, studia magisterskie",
    "school": "Nazwa uczelni",
    "description": ""
  }
]
```

### Zasady, których trzeba pilnować

- **Przecinek między wpisami**: po każdym `}` stoi przecinek, **oprócz ostatniego wpisu** w pliku.
- **Przecinek między polami**: po każdej linijce `"pole": "wartość"` stoi przecinek, oprócz ostatniej w bloku.
- **Cudzysłowy**: używaj zwykłych prostych `"`, nie „drukarskich”. Jeśli w treści potrzebujesz
  cudzysłowu, użyj polskich „…” albo apostrofu.
- Jeśli po zmianie zamiast listy zobaczysz na stronie komunikat o **błędzie składni**, prawie zawsze
  chodzi o brakujący lub nadmiarowy przecinek. Plik możesz sprawdzić na https://jsonlint.com
  (wklej treść i kliknij „Validate JSON”).

## 2. Jak podmienić zdjęcie

1. Przygotuj zdjęcie w formacie `.jpg` (albo `.png`, `.webp`):
   - **zdjęcia do kart doświadczenia**: proporcje **4:3**, np. 1200 × 900 px,
   - **portret**: proporcje **4:5**, np. 1200 × 1500 px.
   Waga najlepiej poniżej 300 KB (zmniejszysz ją np. na https://squoosh.app).
2. Nazwij plik bez polskich znaków i spacji, np. `klub-xyz.jpg`.
3. Na github.com wejdź do folderu `img/experience/` → **Add file** → **Upload files** → przeciągnij plik → **Commit changes**.
4. W pliku `data/experience.json` wpisz nazwę pliku w polu `image`, np. `"image": "img/experience/klub-xyz.jpg"`.

**Portret:** wgraj zdjęcie do folderu `img/`, a w pliku `index.html` znajdź linijkę z `img/portrait.svg`
i zmień ją na nazwę swojego pliku, np. `img/portret.jpg`.

Przykładowe szare obrazki (`.svg`) możesz potem usunąć.

## 3. Jak zmienić adres e-mail

Kontakt to okno, które otwiera się po kliknięciu „Kontakt” (w menu) albo „Umów konsultację”.
Otwórz `index.html` i wyszukaj `kontakt@przyklad.pl` (na github.com w trybie edycji: Ctrl+F).
Zmień **wszystkie** wystąpienia, czyli dwa w linijce z `contact-mail` i jedno przy przycisku „Napisz e-mail”.

**LinkedIn:** link do profilu to ikona w stopce, w `index.html`. Wyszukaj `linkedin.com` i zmień adres.

## 4. Jak opublikować stronę na GitHub Pages

1. W repozytorium na github.com wejdź w **Settings** → w menu po lewej **Pages**.
2. W sekcji **Build and deployment** → **Source** wybierz **Deploy from a branch**.
3. W polu **Branch** wybierz `main` i folder `/ (root)`, kliknij **Save**.
4. Po 1–2 minutach na górze tej samej strony pojawi się adres, np.
   `https://nazwa-uzytkownika.github.io/ignacy/`.

GitHub Pages na darmowym koncie działa tylko dla **publicznych** repozytoriów.

## 5. Jak podpiąć własną domenę (np. kupioną w home.pl)

1. **Na GitHubie:** **Settings** → **Pages** → **Custom domain**, wpisz domenę, np. `www.ignacymikolajczak.pl`,
   i kliknij **Save**. GitHub sam doda do repozytorium plik `CNAME` z tą domeną (nie usuwaj go).
2. **U rejestratora domeny** (w home.pl: panel klienta → Domeny → wybrana domena → **Strefa DNS**) dodaj rekordy:

   | Typ | Nazwa (host) | Wartość |
   |---|---|---|
   | `CNAME` | `www` | `nazwa-uzytkownika.github.io.` |
   | `A` | `@` (domena główna) | `185.199.108.153` |
   | `A` | `@` | `185.199.109.153` |
   | `A` | `@` | `185.199.110.153` |
   | `A` | `@` | `185.199.111.153` |

   Usuń wcześniejsze rekordy `A` / `CNAME` dla `@` i `www`, jeśli wskazywały gdzie indziej (np. na
   stronę „parkingową” rejestratora).
3. Zmiany DNS rozchodzą się od kilku minut do 24–48 godzin. Gdy domena zacznie działać, wróć do
   **Settings → Pages** i zaznacz **Enforce HTTPS**.

Aktualne adresy IP GitHuba: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site

## 6. Jak uruchomić stronę lokalnie (na własnym komputerze)

Sekcje z plików JSON **nie wczytają się**, jeśli otworzysz `index.html` dwuklikiem (adres zaczyna się
wtedy od `file://`). Przeglądarki blokują w tym trybie wczytywanie plików, więc strona pokaże w tych
miejscach komunikat. Trzeba uruchomić prosty serwer:

1. Zainstaluj Pythona (https://www.python.org/downloads/), jeśli go nie masz.
2. Otwórz terminal (Windows: PowerShell) w folderze ze stroną.
3. Wpisz: `python -m http.server 8000`
   (na Windowsie, jeśli pojawi się komunikat „nie znaleziono Python”, wpisz `py -m http.server 8000`)
4. Wejdź w przeglądarce na http://localhost:8000
5. Zatrzymanie serwera: Ctrl+C w terminalu.

## 7. Zanim strona trafi do ludzi

- Podmień treści przykładowe w plikach `data/*.json` i teksty w `index.html` (filozofia, problemy, współpraca).
- Podmień zdjęcia i adres e-mail.
- W `index.html` usuń linijkę `<meta name="robots" content="noindex">`. Dopóki tam jest, Google nie
  pokazuje strony w wynikach wyszukiwania.
