---
name: publikacja-zosia
description: Każdy nowy materiał do nauki (ściąga, quiz, opracowanie, interaktywna strona, zadania) trafia na stronę zosia.fotonacja.net przez to repozytorium. Użyj zawsze, gdy użytkownik prosi o nową rzecz do nauki lub o zmianę istniejącej, zamiast publikować ją tylko jako artefakt.
---

# Publikacja na zosia.fotonacja.net

Zasada: **każda nowa rzecz trafia na zosia.fotonacja.net.** Nie kończ na artefakcie ani pliku
w scratchpadzie – materiał musi wylądować w tym repozytorium i trafić na gałąź `main`.

## Jak działa publikacja

- Repozytorium `fotonacjanet/wesele` to statyczna strona (HTML/CSS/JS, bez budowania).
- Workflow `.github/workflows/deploy.yml` wysyła stronę przez FTP na zosia.fotonacja.net
  po każdym pushu na `main` (tylko zmienione pliki).
- Pracuj na wyznaczonej gałęzi roboczej, wypchnij ją i otwórz PR do `main`.
- Użytkownik zgodził się na automatyczne scalanie: po sprawdzeniu, że PR nie ma konfliktów,
  czerwonych testów ani otwartych uwag, scal go sam (squash) bez pytania.
  Po scaleniu sprawdź, czy przebieg workflow „Publikacja” na `main` zakończył się sukcesem.

## Gdzie co kłaść

```
index.html                       – strona główna: kafelki przedmiotów
<przedmiot>/index.html           – lista tematów przedmiotu (np. jezyk-polski/, matematyka/)
<przedmiot>/<temat>/index.html   – strona tematu
assets/css/style.css, assets/js/quiz.js – wspólne style i skrypt quizu lektur
```

- Lektury: wzoruj się na `jezyk-polski/chlopi/` (wprowadzenie / opracowanie / quiz + `data/*.json`).
- Interaktywne strony z własnym wyglądem (np. `matematyka/trygonometria/index.html`) mogą mieć
  własne style w pliku, ale muszą być pełnym dokumentem HTML (`<!DOCTYPE html>`, `lang="pl"`,
  meta viewport) i mieć u góry ścieżkę: Ściągi › Przedmiot › Temat (linki względne).
- Nowy przedmiot: utwórz `<przedmiot>/index.html` wzorowany na `jezyk-polski/index.html`
  i dodaj jego kafelek na stronie głównej (przed kafelkiem „Wkrótce”).
- Nowy temat: dodaj kafelek w `<przedmiot>/index.html`.
- Tylko linki względne i zasoby z CDN/Google Fonts – strona leży w podkatalogu serwera.

## Kroki przy każdej nowej rzeczy

1. Zbuduj materiał w odpowiednim katalogu (patrz wyżej).
2. Dodaj kafelek/link, żeby dało się do niego dojść ze strony głównej.
3. Sprawdź lokalnie: `python3 -m http.server`, otwórz stronę, przeklikaj quiz, brak błędów w konsoli.
4. Zaktualizuj `README.md`, jeśli zmienia się struktura.
5. Commit, push gałęzi roboczej, PR do `main`, scal go i sprawdź publikację. Podaj użytkownikowi adres,
   pod którym materiał jest widoczny, np. `https://zosia.fotonacja.net/matematyka/trygonometria/`.
6. Artefakt na claude.ai jest opcjonalny (do szybkiego podglądu) – nie zastępuje publikacji.
