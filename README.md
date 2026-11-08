# Ściągi Maturalne

Statyczna strona (czysty HTML/CSS/JS, bez budowania) z opracowaniami do matury.

## Struktura

```
index.html                    – strona główna: lista przedmiotów
jezyk-polski/index.html       – lista lektur
jezyk-polski/<lektura>/
    index.html                – wprowadzenie
    opracowanie.html          – opracowanie
    quiz.html                 – quiz (losuje 5 pytań)
    data/pytania.json         – baza pytań do quizu
assets/css/style.css          – wspólne style
assets/css/motywy/*.css       – opcjonalne motywy kolorystyczne lektur
assets/js/quiz.js             – wspólny skrypt quizu
```

Każda podstrona ma u góry ścieżkę (np. „Ściągi › Język polski › Chłopi”),
a strony lektury mają własne menu: Wprowadzenie / Opracowanie / Quiz.

## Jak dodać lekturę

1. Skopiuj katalog istniejącej lektury, np. `jezyk-polski/chlopi/` → `jezyk-polski/lalka/`.
2. Podmień tytuł, nazwę w ścieżce (breadcrumb), treść opracowania i pytania w `data/pytania.json`
   (`question`, `options`, `answer` = indeks poprawnej odpowiedzi od 0).
3. W `quiz.html` ustaw komunikaty wyniku w `window.QUIZ_MESSAGES`.
4. Dodaj kafelek w `jezyk-polski/index.html`.
5. Opcjonalnie: własny motyw w `assets/css/motywy/` (nadpisanie zmiennych z `:root`).

## Jak dodać przedmiot

Utwórz katalog (np. `historia/`) z plikiem `index.html` wzorowanym na `jezyk-polski/index.html`
i zamień kafelek „Wkrótce” na stronie głównej na link.

## Podgląd lokalny

Quiz wczytuje pytania przez `fetch`, więc stronę trzeba otworzyć przez serwer, np.:

    python3 -m http.server

## Publikacja (zosia.fotonacja.net)

Strona publikuje się sama przez GitHub Actions (`.github/workflows/deploy.yml`) po każdej zmianie
na gałęzi `main`. Można ją też uruchomić ręcznie: zakładka **Actions → Publikacja → Run workflow**.

Jednorazowa konfiguracja w **Settings → Secrets and variables → Actions**:

| Rodzaj   | Nazwa            | Przykład                 |
|----------|------------------|--------------------------|
| Secret   | `FTP_SERVER`     | `ftp.fotonacja.net`      |
| Secret   | `FTP_USERNAME`   | login FTP                |
| Secret   | `FTP_PASSWORD`   | hasło FTP                |
| Variable | `FTP_SERVER_DIR` | `public_html/zosia/` (ze `/` na końcu; domyślnie `./`) |
| Variable | `FTP_PROTOCOL`   | `ftps` (domyślnie), `ftp` lub `ftps-legacy` |
| Variable | `FTP_PORT`       | `21` (domyślnie)         |

Wysyłane są tylko zmienione pliki. Na serwerze pojawi się plik `.ftp-deploy-sync-state.json`,
w którym narzędzie zapisuje, co już wgrało; nie należy go usuwać.
