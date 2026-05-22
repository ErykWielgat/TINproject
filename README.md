# Serwis Muzyczny (MusicRank)

Aplikacja webowa pozwalająca na przeglądanie rankingów albumów muzycznych, dodawanie własnych recenzji oraz ocenianie recenzji innych użytkowników.

## Uruchomienie projektu
Z racji wykorzystania modułów ES6 (import/export) oraz funkcji `fetch`, aplikacja wymaga uruchomienia na lokalnym serwerze WWW.
Najprostszy sposób uruchomienia to:
1. Otwarcie projektu w edytorze z wbudowanym serwerem (np. PhpStorm / WebStorm).
2. Kliknięcie ikony przeglądarki w prawym górnym rogu podglądu pliku `index.html`.
   *Alternatywnie: Użycie wtyczki Live Server w VS Code.*

## Zrealizowane funkcjonalności
- Podział na klasy i moduły ES6 (`Storage`, `API`, `UI`).
- Rejestracja i logowanie użytkowników (dane trzymane w `localStorage` / `sessionStorage`).
- Pobieranie listy albumów w sposób asynchroniczny (`fetch`, `async/await` z pliku JSON).
- Wyszukiwarka albumów wyposażona w mechanizm **debounce** (300ms).
- Delegacja zdarzeń obsługująca dynamicznie generowane listy albumów i recenzji.
- Walidacja formularzy (HTML5: `required`, `minlength`).
- Dodawanie recenzji oraz lajkowanie/dislajkowanie opinii innych użytkowników.
- Responsywny interfejs oparty na bibliotece Bootstrap 5.