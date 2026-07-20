<?php
session_start();

// Читаем пароль из .env или используем дефолтный
$env_path = __DIR__ . '/.env';
$generator_password = 'WyciekiPro2026!'; // Дефолтный пароль

if (file_exists($env_path)) {
    $lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            if (trim($key) === 'GENERATOR_PASSWORD') {
                $generator_password = trim($value);
            }
        }
    }
}

// Обработка выхода
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: generator.php");
    exit;
}

// Обработка авторизации
$error = '';
if (isset($_POST['password'])) {
    if ($_POST['password'] === $generator_password) {
        $_SESSION['authorized'] = true;
        header("Location: generator.php");
        exit;
    } else {
        $error = 'Niepoprawne hasło!';
    }
}

// Если не авторизован — показываем форму входа
if (!isset($_SESSION['authorized']) || $_SESSION['authorized'] !== true) {
    ?>
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Logowanie — WyciekiPro</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="css/base/reset.css">
      <link rel="stylesheet" href="css/base/variables.css">
      <link rel="stylesheet" href="css/base/typography.css">
      <style>
        body {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: var(--color-bg-alt, #f4f4f9);
          font-family: 'Inter', sans-serif;
          padding: 20px;
        }
        .login-card {
          background: #fff;
          padding: 40px;
          border-radius: var(--radius-xl, 12px);
          box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
          border: 1px solid var(--color-border-light, #e2e8f0);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #0d2137;
          margin-bottom: 20px;
        }
        .logo span {
          color: #23b5ed;
        }
        h2 {
          font-size: 18px;
          margin-bottom: 20px;
          color: var(--color-text, #333);
        }
        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 14px;
        }
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--color-border, #cbd5e1);
          border-radius: var(--radius-md, 8px);
          font-size: 16px;
        }
        .form-group input:focus {
          outline: none;
          border-color: #23b5ed;
        }
        .btn-submit {
          width: 100%;
          padding: 12px;
          background-color: #23b5ed;
          color: #fff;
          border: none;
          border-radius: var(--radius-md, 8px);
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-submit:hover {
          background-color: #009ad4;
        }
        .error-msg {
          color: #ef4444;
          margin-bottom: 15px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="login-card">
        <div class="logo">Wycieki<span>Pro</span></div>
        <h2>Panel Autoryzacji</h2>
        <?php if ($error): ?>
          <div class="error-msg"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        <form method="POST" action="generator.php">
          <div class="form-group">
            <label for="password">Wpisz hasło dostępu</label>
            <input type="password" id="password" name="password" required autofocus placeholder="••••••••">
          </div>
          <button type="submit" class="btn-submit">Zaloguj się</button>
        </form>
      </div>
    </body>
    </html>
    <?php
    exit;
}
?>
<!DOCTYPE html>
<html lang="pl">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Generator Protokołów — WyciekiPro</title>
  <link rel="icon" type="image/png" sizes="32x32" href="images/favicon/favicon-32x32.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- CSS -->
  <link rel="stylesheet" href="css/base/reset.css">
  <link rel="stylesheet" href="css/base/variables.css">
  <link rel="stylesheet" href="css/base/typography.css">
  <link rel="stylesheet" href="css/layout/grid.css">
  <link rel="stylesheet" href="css/layout/responsive.css">
  <link rel="stylesheet" href="css/components/header.css">
  <link rel="stylesheet" href="css/components/footer.css">
  <link rel="stylesheet" href="css/components/buttons.css">
  <link rel="stylesheet" href="css/components/generator.css">
</head>

<body class="always-scrolled">

  <!-- ═══ HEADER ═══ -->
  <header class="header" id="header">
    <div class="container header__inner">
      <a href="index.html" class="header__logo" id="logo">
        <span class="header__logo-icon">
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M10 0C10 0 1 10.5 1 15.5C1 20.194 5.03 24 10 24C14.97 24 19 20.194 19 15.5C19 10.5 10 0 10 0Z" fill="white" />
            <path d="M13.5 18C13.5 16.07 12.43 14.4 10.83 13.56" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="header__logo-text">Wycieki<span>Pro</span></span>
      </a>
      <nav class="nav" id="main-nav">
        <a href="index.html" class="nav__link">Strona Główna</a>
        <a href="generator.php?logout=true" class="nav__link" style="color: #ef4444 !important; font-weight: 600; margin-left: 15px;">Wyloguj</a>
      </nav>
    </div>
  </header>

  <!-- ═══ WIZARD APP ═══ -->
  <main class="generator-app">
    <div class="container">
      <div class="wizard-card">
        <div class="wizard-header">
          <h1>Generator Protokołów Technicznych</h1>
          <p>Wypełnij formularz krok po kroku, aby wygenerować profesjonalną umowę i protokół PDF.</p>
          
          <!-- Progress Bar -->
          <div class="stepper">
            <div class="step-item active" data-step="1">
              <div class="step-number">1</div>
              <div class="step-label">Dane Klienta</div>
            </div>
            <div class="step-item" data-step="2">
              <div class="step-number">2</div>
              <div class="step-label">Prace & Wilgoć</div>
            </div>
            <div class="step-item" data-step="3">
              <div class="step-number">3</div>
              <div class="step-label">Próby Ciśnieniowe</div>
            </div>
            <div class="step-item" data-step="4">
              <div class="step-number">4</div>
              <div class="step-label">Wyniki i Opis</div>
            </div>
            <div class="step-item" data-step="5">
              <div class="step-number">5</div>
              <div class="step-label">Podpisy & PDF</div>
            </div>
          </div>
        </div>

        <form id="protocol-form" onsubmit="event.preventDefault();">
          
          <!-- STEP 1: CLIENT AND BASIC INFO -->
          <div class="wizard-step active" id="step-1">
            <h2>Krok 1: Dane podstawowe i klient</h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="nr_sprawy">Numer Sprawy / Umowy</label>
                <input type="text" id="nr_sprawy" name="nr_sprawy" placeholder="np. 07/06/26">
              </div>
              <div class="form-group">
                <label for="data_sprawy">Data sporządzenia</label>
                <input type="date" id="data_sprawy" name="data_sprawy">
              </div>
              <div class="form-group">
                <label for="miejscowosc">Miejscowość</label>
                <input type="text" id="miejscowosc" name="miejscowosc" placeholder="np. Warszawa">
              </div>
              <div class="form-group">
                <label for="klient_nazwa">Imię i Nazwisko / Nazwa Firmy</label>
                <input type="text" id="klient_nazwa" name="klient_nazwa" placeholder="np. Anna Zakrzewska" required>
              </div>
              <div class="form-group">
                <label for="klient_nip">NIP / PESEL (opcjonalnie)</label>
                <input type="text" id="klient_nip" name="klient_nip" placeholder="np. 1234567890">
              </div>
              <div class="form-group">
                <label for="klient_adres">Adres Lokalizacji</label>
                <input type="text" id="klient_adres" name="klient_adres" placeholder="np. ul. Jagiellońska 79 m. 96, Warszawa" required>
              </div>
              <div class="form-group">
                <label for="klient_email">Adres E-mail</label>
                <input type="email" id="klient_email" name="klient_email" placeholder="np. klient@gmail.com">
              </div>
              <div class="form-group">
                <label for="klient_telefon">Telefon</label>
                <input type="tel" id="klient_telefon" name="klient_telefon" placeholder="np. 600356973" required>
              </div>
              <div class="form-group">
                <label>Forma Płatności</label>
                <div class="radio-group">
                  <label><input type="radio" name="forma_platnosci" value="GOTÓWKA" checked> Gotówka</label>
                  <label><input type="radio" name="forma_platnosci" value="PRZELEW"> Przelew</label>
                </div>
              </div>
              <div class="form-group">
                <label for="przedmiot_szkody">Przedmiot Szkody</label>
                <input type="text" id="przedmiot_szkody" name="przedmiot_szkody" placeholder="np. Zawilgocone ściany przy wejściu do mieszkania">
              </div>
              <div class="form-group">
                <label for="wielkosc_mieszkania">Wielkość mieszkania/domu (m²)</label>
                <input type="number" id="wielkosc_mieszkania" name="wielkosc_mieszkania" placeholder="np. 27">
              </div>
              <div class="form-group">
                <label for="pietro">Piętro</label>
                <input type="number" id="pietro" name="pietro" placeholder="np. 7">
              </div>
            </div>
          </div>

          <!-- STEP 2: WORKS AND MOISTURE -->
          <div class="wizard-step" id="step-2">
            <h2>Krok 2: Wykonane prace i pomiary wilgotności</h2>
            
            <div class="section-block">
              <h3>Użyty miernik wilgotności</h3>
              <div class="checkbox-group">
                <label><input type="checkbox" name="miernik_tramex" id="miernik_tramex"> Tramex ME5/MEX5</label>
                <label><input type="checkbox" name="miernik_gann" id="miernik_gann" checked> Gann Compact B2</label>
              </div>
            </div>

            <div class="section-block">
              <h3>Pomiary wilgotności (wartości w digits)</h3>
              <div class="form-grid-three">
                <div class="form-group">
                  <label for="wilgoc_sciany">Ściany</label>
                  <input type="number" id="wilgoc_sciany" name="wilgoc_sciany" placeholder="np. 160">
                </div>
                <div class="form-group">
                  <label for="wilgoc_sufitu">Sufit</label>
                  <input type="number" id="wilgoc_sufitu" name="wilgoc_sufitu" placeholder="np. 40">
                </div>
                <div class="form-group">
                  <label for="wilgoc_posadzki">Posadzka</label>
                  <input type="number" id="wilgoc_posadzki" name="wilgoc_posadzki" placeholder="np. 80">
                </div>
              </div>
            </div>

            <div class="section-block">
              <h3>Stopień/Powierzchnia zalania</h3>
              <div class="radio-group radio-group--grid">
                <label><input type="radio" name="stopien_zalania" value="do 5 % powierzchni"> do 5% powierzchni</label>
                <label><input type="radio" name="stopien_zalania" value="do 40 % powierzchni" checked> do 40% powierzchni</label>
                <label><input type="radio" name="stopien_zalania" value="pow. 40 % powierzchni"> pow. 40% powierzchni</label>
                <label><input type="radio" name="stopien_zalania" value="pow. 80 % powierzchni"> pow. 80% powierzchni</label>
                <label><input type="radio" name="stopien_zalania" value="Brak zalania"> Brak zalania</label>
              </div>
            </div>

            <div class="section-block">
              <h3>Wykonane prace diagnostyczne</h3>
              <div class="works-list">
                
                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_termowizja" id="prac_termowizja" checked>
                    <span>Badanie kamerą termowizyjną</span>
                  </label>
                  <input type="hidden" name="prac_termowizja_val" value="">
                </div>

                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_endoskop" id="prac_endoskop">
                    <span>Sprawdzenie kamerą endoskopową</span>
                  </label>
                  <div class="qty-input">
                    <input type="number" name="prac_endoskop_val" id="prac_endoskop_val" placeholder="0"> <span>punkty</span>
                  </div>
                </div>

                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_geofon" id="prac_geofon" checked>
                    <span>Geofon / badanie akustyczne</span>
                  </label>
                  <div class="qty-input">
                    <input type="number" name="prac_geofon_val" id="prac_geofon_val" placeholder="0" value="1"> <span>punkty</span>
                  </div>
                </div>

                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_barwnik" id="prac_barwnik">
                    <span>Barwnik fluorescencyjny UV</span>
                  </label>
                  <div class="qty-input">
                    <input type="number" name="prac_barwnik_val" id="prac_barwnik_val" placeholder="0"> <span>punkty</span>
                  </div>
                </div>

                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_gaz" id="prac_gaz">
                    <span>Gaz znacznikowy</span>
                  </label>
                  <div class="qty-input">
                    <input type="number" name="prac_gaz_val" id="prac_gaz_val" placeholder="0"> <span>punkty</span>
                  </div>
                </div>

                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_silikony" id="prac_silikony">
                    <span>Sprawdzenie silikonów</span>
                  </label>
                  <input type="hidden" name="prac_silikony_val" value="">
                </div>

                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_wc" id="prac_wc">
                    <span>Demontaż przycisków WC</span>
                  </label>
                  <div class="qty-input">
                    <input type="number" name="prac_wc_val" id="prac_wc_val" placeholder="0"> <span>szt.</span>
                  </div>
                </div>

                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_zawory" id="prac_zawory">
                    <span>Zakręcenie/odkręcenie zaworów (CO, ZWU, CWU)</span>
                  </label>
                  <div class="qty-input">
                    <input type="number" name="prac_zawory_val" id="prac_zawory_val" placeholder="0"> <span>szt.</span>
                  </div>
                </div>

                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_spuszczenie_zwu" id="prac_spuszczenie_zwu">
                    <span>Spuszczenie/napełnienie z instalacji ZWU, CWU</span>
                  </label>
                  <div class="qty-input">
                    <input type="number" name="prac_spuszczenie_zwu_val" id="prac_spuszczenie_zwu_val" placeholder="0"> <span>szt.</span>
                  </div>
                </div>

                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_spuszczenie_co" id="prac_spuszczenie_co">
                    <span>Spuszczenie/napełnienie z instalacji CO</span>
                  </label>
                  <div class="qty-input">
                    <input type="number" name="prac_spuszczenie_co_val" id="prac_spuszczenie_co_val" placeholder="0"> <span>szt.</span>
                  </div>
                </div>

                <div class="work-item-row">
                  <label class="checkbox-container">
                    <input type="checkbox" name="prac_meble" id="prac_meble">
                    <span>Demontaż/montaż mebli, sanitariatów</span>
                  </label>
                  <div class="qty-input">
                    <input type="number" name="prac_meble_val" id="prac_meble_val" placeholder="0"> <span>szt.</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- STEP 3: PRESSURE TESTS -->
          <div class="wizard-step" id="step-3">
            <h2>Krok 3: Próby Ciśnieniowe</h2>
            <div class="table-container">
              <table class="pressure-table">
                <thead>
                  <tr>
                    <th width="50">Użyj</th>
                    <th>Instalacja</th>
                    <th>Ciśnienie (bar)</th>
                    <th>Czas (min)</th>
                    <th>Spadek (bar)</th>
                    <th width="180">Wynik</th>
                  </tr>
                </thead>
                <tbody>
                  
                  <tr data-test="cwu">
                    <td><input type="checkbox" name="test_cwu_active" id="test_cwu_active" checked></td>
                    <td><strong>CWU</strong></td>
                    <td><input type="number" step="0.1" name="test_cwu_cisnienie" id="test_cwu_cisnienie" value="8"></td>
                    <td><input type="number" name="test_cwu_czas" id="test_cwu_czas" value="30"></td>
                    <td><input type="number" step="0.1" name="test_cwu_spadek" id="test_cwu_spadek" value="0"></td>
                    <td>
                      <select name="test_cwu_wynik" id="test_cwu_wynik">
                        <option value="pozytywny" selected>Pozytywny</option>
                        <option value="negatywny">Negatywny</option>
                      </select>
                    </td>
                  </tr>

                  <tr data-test="zwu">
                    <td><input type="checkbox" name="test_zwu_active" id="test_zwu_active" checked></td>
                    <td><strong>ZWU</strong></td>
                    <td><input type="number" step="0.1" name="test_zwu_cisnienie" id="test_zwu_cisnienie" value="8"></td>
                    <td><input type="number" name="test_zwu_czas" id="test_zwu_czas" value="30"></td>
                    <td><input type="number" step="0.1" name="test_zwu_spadek" id="test_zwu_spadek" value="0"></td>
                    <td>
                      <select name="test_zwu_wynik" id="test_zwu_wynik">
                        <option value="pozytywny" selected>Pozytywny</option>
                        <option value="negatywny">Negatywny</option>
                      </select>
                    </td>
                  </tr>

                  <tr data-test="co">
                    <td><input type="checkbox" name="test_co_active" id="test_co_active" checked></td>
                    <td><strong>CO</strong></td>
                    <td><input type="number" step="0.1" name="test_co_cisnienie" id="test_co_cisnienie" value="6"></td>
                    <td><input type="number" name="test_co_czas" id="test_co_czas" value="30"></td>
                    <td><input type="number" step="0.1" name="test_co_spadek" id="test_co_spadek" value="0"></td>
                    <td>
                      <select name="test_co_wynik" id="test_co_wynik">
                        <option value="pozytywny" selected>Pozytywny</option>
                        <option value="negatywny">Negatywny</option>
                      </select>
                    </td>
                  </tr>

                  <tr data-test="zewn">
                    <td><input type="checkbox" name="test_zewn_active" id="test_zewn_active"></td>
                    <td>Instalacja zewnętrzna</td>
                    <td><input type="number" step="0.1" name="test_zewn_cisnienie" id="test_zewn_cisnienie"></td>
                    <td><input type="number" name="test_zewn_czas" id="test_zewn_czas"></td>
                    <td><input type="number" step="0.1" name="test_zewn_spadek" id="test_zewn_spadek"></td>
                    <td>
                      <select name="test_zewn_wynik" id="test_zewn_wynik">
                        <option value="pozytywny" selected>Pozytywny</option>
                        <option value="negatywny">Negatywny</option>
                      </select>
                    </td>
                  </tr>

                  <tr data-test="bateria1">
                    <td><input type="checkbox" name="test_bateria1_active" id="test_bateria1_active"></td>
                    <td>Instalacja baterii podt. (1)</td>
                    <td><input type="number" step="0.1" name="test_bateria1_cisnienie" id="test_bateria1_cisnienie"></td>
                    <td><input type="number" name="test_bateria1_czas" id="test_bateria1_czas"></td>
                    <td><input type="number" step="0.1" name="test_bateria1_spadek" id="test_bateria1_spadek"></td>
                    <td>
                      <select name="test_bateria1_wynik" id="test_bateria1_wynik">
                        <option value="pozytywny" selected>Pozytywny</option>
                        <option value="negatywny">Negatywny</option>
                      </select>
                    </td>
                  </tr>

                  <tr data-test="bateria2">
                    <td><input type="checkbox" name="test_bateria2_active" id="test_bateria2_active"></td>
                    <td>Instalacja baterii podt. (2)</td>
                    <td><input type="number" step="0.1" name="test_bateria2_cisnienie" id="test_bateria2_cisnienie"></td>
                    <td><input type="number" name="test_bateria2_czas" id="test_bateria2_czas"></td>
                    <td><input type="number" step="0.1" name="test_bateria2_spadek" id="test_bateria2_spadek"></td>
                    <td>
                      <select name="test_bateria2_wynik" id="test_bateria2_wynik">
                        <option value="pozytywny" selected>Pozytywny</option>
                        <option value="negatywny">Negatywny</option>
                      </select>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          <!-- STEP 4: RESULTS AND OPINION -->
          <div class="wizard-step" id="step-4">
            <h2>Krok 4: Wyniki prac i uwagi</h2>
            <div class="form-grid form-grid--single">
              
              <div class="form-group">
                <label for="roboty_dodatkowe">Roboty Dodatkowe</label>
                <textarea id="roboty_dodatkowe" name="roboty_dodatkowe" placeholder="np. Demontaż mebli kuchennych, odkucie cokołów." rows="3"></textarea>
              </div>

              <div class="form-group">
                <label for="metoda_lokalizacji">Metoda Lokalizacji</label>
                <textarea id="metoda_lokalizacji" name="metoda_lokalizacji" placeholder="np. Próby ciśnieniowe, miernik wilgotności" rows="2"></textarea>
              </div>

              <div class="form-group">
                <label for="miejsce_wycieku">Miejsce Wycieku</label>
                <textarea id="miejsce_wycieku" name="miejsce_wycieku" placeholder="np. Brak wycieku w obrębie mieszkania. Źródło wycieku znajduje się w szafce technicznej w korytarzu wspólnoty." rows="3"></textarea>
              </div>

              <div class="form-group">
                <label for="uwagi">Uwagi / Oświadczenia</label>
                <textarea id="uwagi" name="uwagi" placeholder="np. Zaleca się wymianę zaworu głównego." rows="3"></textarea>
              </div>

            </div>
          </div>

          <!-- STEP 5: SIGNATURES AND EXPORT -->
          <div class="wizard-step" id="step-5">
            <h2>Krok 5: Podpisy i generowanie PDF</h2>
            
            <div class="signatures-grid">
              
              <!-- Signature 1: Zleceniobiorca (Sławek) -->
              <div class="signature-box">
                <label>Podpis Zleceniobiorcy (WyciekiPro)</label>
                <div class="canvas-container">
                  <canvas id="sig-zleceniobiorca" width="350" height="150"></canvas>
                </div>
                <button type="button" class="btn btn--sm btn--ghost btn-clear" data-canvas="sig-zleceniobiorca">Wyczyść</button>
              </div>

              <!-- Signature 2: Zleceniodawca (Klient) -->
              <div class="signature-box">
                <label>Podpis Zleceniodawcy (Klient)</label>
                <div class="canvas-container">
                  <canvas id="sig-zleceniodawca" width="350" height="150"></canvas>
                </div>
                <button type="button" class="btn btn--sm btn--ghost btn-clear" data-canvas="sig-zleceniodawca">Wyczyść</button>
              </div>

            </div>

            <div class="generate-actions" style="margin-top: 40px; display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
              <button type="button" class="btn btn--primary btn--lg" id="btn-generate-pdf">💾 Pobierz Protokół PDF</button>
              <button type="button" class="btn btn--accent btn--lg" id="btn-open-pdf" style="background-color: #23b5ed; color: #fff; border-color: #23b5ed;">👁️ Otwórz PDF w nowej karcie</button>
              <button type="button" class="btn btn--secondary btn--lg" id="btn-reset-form">🔄 Wyczyść Formularz</button>
            </div>
          </div>

        </form>

        <!-- Wizard Navigation Footer -->
        <div class="wizard-footer">
          <button type="button" class="btn btn--ghost" id="btn-prev" disabled>Poprzedni</button>
          <button type="button" class="btn btn--primary" id="btn-next">Dalej</button>
        </div>
      </div>
    </div>
  </main>

  <!-- ═══ FOOTER ═══ -->
  <footer class="footer">
    <div class="container">
      <div class="footer__bottom">
        <span>© 2026 WyciekiPro. Panel Generatora. Wszelkie prawa zastrzeżone.</span>
      </div>
    </div>
  </footer>

  <!-- ══════════════════════════════════════════════════════════════════════════
       PRINT TEMPLATE BLOCK (HIDDEN ON SCREEN, DESIGNED SPECIFICALLY FOR html2pdf)
       ══════════════════════════════════════════════════════════════════════════ -->
  <div id="print-template" class="pdf-container">
    
    <!-- PAGE 1: UMOWA -->
    <div class="pdf-page" id="pdf-page-1">
      
      <!-- Top header layout -->
      <table class="pdf-table pdf-header-table">
        <tr>
          <td width="30%" class="pdf-center font-bold">
            Lokalizacja wycieków<br>
            Likwidacja szkód wodnych
          </td>
          <td width="40%" class="pdf-center pdf-logo-cell">
            <div class="pdf-logo-text">Wycieki<span>Pro</span></div>
          </td>
          <td width="30%" class="pdf-center font-bold">
            NIP 5243065918<br>
            Myśliborska 70B/120, 03-185<br>
            Warszawa
          </td>
        </tr>
      </table>

      <!-- Main Document Meta Header -->
      <table class="pdf-table pdf-meta-table">
        <tr class="pdf-title-row">
          <td width="30%" rowspan="2" class="pdf-center font-bold pdf-title-cell">
            Umowa o lokalizację<br>przyczyny szkody
          </td>
          <td width="23%" class="pdf-center pdf-data-val font-bold" id="pdf-val-nr_sprawy-1"></td>
          <td width="23%" class="pdf-center pdf-data-val font-bold" id="pdf-val-data-1"></td>
          <td width="24%" class="pdf-center pdf-data-val font-bold" id="pdf-val-miejscowosc-1"></td>
        </tr>
        <tr class="pdf-label-row">
          <td class="pdf-center">Nr Sprawy</td>
          <td class="pdf-center">Data</td>
          <td class="pdf-center">Miejscowość</td>
        </tr>
      </table>

      <!-- Client Details Fields -->
      <table class="pdf-table pdf-details-table">
        <tr>
          <td width="25%" class="pdf-label">Imię i nazwisko / nazwa Firmy</td>
          <td width="45%" class="pdf-value font-bold" id="pdf-val-klient_nazwa"></td>
          <td width="10%" class="pdf-label">NIP / Pesel</td>
          <td width="20%" class="pdf-value" id="pdf-val-klient_nip"></td>
        </tr>
        <tr>
          <td class="pdf-label">Adres Lokalizacji</td>
          <td colspan="3" class="pdf-value font-bold" id="pdf-val-klient_adres"></td>
        </tr>
        <tr>
          <td class="pdf-label">Adres Mail</td>
          <td class="pdf-value" id="pdf-val-klient_email"></td>
          <td class="pdf-label">Telefon</td>
          <td class="pdf-value font-bold" id="pdf-val-klient_telefon"></td>
        </tr>
        <tr>
          <td class="pdf-label">Forma Płatności</td>
          <td colspan="3" class="pdf-value">
            <span class="checkbox-icon" id="pdf-val-pay-gotowka">☐</span> GOTÓWKA
            <span class="checkbox-icon" id="pdf-val-pay-przelew" style="margin-left: 60px;">☐</span> PRZELEW
          </td>
        </tr>
        <tr>
          <td class="pdf-label">Przedmiot szkody</td>
          <td colspan="3" class="pdf-value" id="pdf-val-przedmiot_szkody"></td>
        </tr>
        <tr>
          <td class="pdf-label">Wielkość mieszkania / domu</td>
          <td class="pdf-value">
            <span id="pdf-val-wielkosc_mieszkania"></span> <span style="margin-left: 20px;">m2</span>
          </td>
          <td class="pdf-label">Piętro</td>
          <td class="pdf-value" id="pdf-val-pietro"></td>
        </tr>
      </table>

      <!-- Contract Paragraphs Legal text -->
      <div class="pdf-legal-text">
        <p class="font-bold">§ 1. Przedmiot umowy</p>
        <p>Zleceniodawca zleca, a Zleceniobiorca zobowiązuje się do wykonania usługi polegającej na poszukiwaniu przyczyny powstałej szkody wodnej.</p>
        
        <p class="font-bold">§ 2. Zakres i zasady wykonania</p>
        <p>1. Zleceniobiorca nie gwarantuje wskazania dokładnej przyczyny szkody podczas pierwszej vizyty.<br>
        2. Za zgodą Stron mogą być stosowane metody inwazyjne lub bezinwazyjne.<br>
        3. Po wykonaniu usługi sporządzony zostanie protokół z prac.<br>
        4. Usługa rozliczana jest ryczałtowo; technik dobiera metody według potrzeb.</p>
        
        <p class="font-bold">§ 3. Odpowiedzialność</p>
        <p>Zleceniobiorca nie ponosi odpowiedzialności za szkody powstałe po wykonaniu usługi, jeśli nie są one bezpośrednim skutkiem jej realizacji.</p>
        
        <p class="font-bold">§ 4. Oświadczenia</p>
        <p>Zleceniodawca oświadcza, że został poinformowany i przeszkolony w zakresie samodzielnego sprawdzania szczelności silikonowych uszczelnień przy urządzeniach sanitarnych.</p>
        
        <p class="font-bold">§ 5. Rozliczenie</p>
        <p>1. Możliwość rozliczenia bezgotówkowego z towarzystwem ubezpieczeniowym zależy od przyczyny szkody, zakresu ubezpieczenia oraz warunków polisy.<br>
        2. Decyzja o rozliczeniu bezgotówkowym zostanie podjęta po zlokalizowaniu przyczyny szkody.<br>
        3. Na potrzeby rozliczenia z Towarzystwem Ubezpieczeniowym Zleceniobiorca sporządza kosztorys w oparciu o Katalogi Nakładów Rzeczowych (KNR).</p>
        
        <p class="font-bold">§ 6. Postanowienia końcowe</p>
        <p>1. Umowa ma charakter umowy zlecenia w rozumieniu art. 734 i nast. Kodeksu cywilnego.<br>
        2. W sprawach nieuregulowanych stosuje się przepisy prawa polskiego.</p>
      </div>

      <!-- Signatures Footer -->
      <table class="pdf-table pdf-signature-table">
        <tr>
          <td width="50%" class="pdf-center">
            <div class="pdf-sig-wrapper">
              <img id="pdf-img-sig-zleceniobiorca-1" class="pdf-signature-img" src="" alt="">
            </div>
            <div class="pdf-sig-line">Zleceniobiorca</div>
          </td>
          <td width="50%" class="pdf-center">
            <div class="pdf-sig-wrapper">
              <img id="pdf-img-sig-zleceniodawca-1" class="pdf-signature-img" src="" alt="">
            </div>
            <div class="pdf-sig-line">Zleceniodawca</div>
          </td>
        </tr>
      </table>

      <!-- Bottom header layout -->
      <table class="pdf-table pdf-footer-table">
        <tr>
          <td width="30%" class="pdf-center font-bold">
            Lokalizacja wycieków<br>
            Likwidacja szkód wodnych
          </td>
          <td width="40%" class="pdf-center pdf-logo-cell">
            <div class="pdf-logo-text">Wycieki<span>Pro</span></div>
          </td>
          <td width="30%" class="pdf-center font-bold">
            NIP 5243065918<br>
            Myśliborska 70B/120, 03-185<br>
            Warszawa
          </td>
        </tr>
      </table>

    </div>

    <!-- PAGE 2: PROTOKÓŁ -->
    <div class="pdf-page" id="pdf-page-2">
      
      <!-- Protocol header table -->
      <table class="pdf-table pdf-meta-table">
        <tr class="pdf-title-row">
          <td width="30%" rowspan="2" class="pdf-center font-bold pdf-title-cell">
            Protokół wykonania lokalizacji<br>przyczyny szkody
          </td>
          <td width="23%" class="pdf-center pdf-data-val font-bold" id="pdf-val-nr_sprawy-2"></td>
          <td width="23%" class="pdf-center pdf-data-val font-bold" id="pdf-val-data-2"></td>
          <td width="24%" class="pdf-center pdf-data-val font-bold" id="pdf-val-miejscowosc-2"></td>
        </tr>
        <tr class="pdf-label-row">
          <td class="pdf-center">Nr Sprawy</td>
          <td class="pdf-center">Data</td>
          <td class="pdf-center">Miejscowość</td>
        </tr>
      </table>

      <!-- Work done details section -->
      <div class="pdf-work-header font-bold">Wykonane Prace</div>

      <table class="pdf-table pdf-works-table">
        <tr>
          <td width="55%" class="font-bold">Użyto miernik wilgotności</td>
          <td width="45%">
            <span class="checkbox-icon" id="pdf-val-miernik-tramex">☐</span> Tramex ME5/MEX5
            <span class="checkbox-icon" id="pdf-val-miernik-gann" style="margin-left: 30px;">☐</span> Gann Compact B2
          </td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-sciany">☐</span> Pomiary wilgotności ścian</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-sciany"></span> digits</td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-sufitu">☐</span> Pomiary wilgotności sufitu</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-sufitu"></span> digits</td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-posadzki">☐</span> Pomiary wilgotności posadzki</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-posadzki"></span> digits</td>
        </tr>
        <tr>
          <td colspan="2">
            <span class="checkbox-icon" id="pdf-check-zalanie-5">☐</span> Zalanie do 5 % powierzchni
            <span class="checkbox-icon" id="pdf-check-zalanie-40" style="margin-left: 20px;">☐</span> Zalanie do 40 % powierzchni
            <span class="checkbox-icon" id="pdf-check-zalanie-pow40" style="margin-left: 20px;">☐</span> Zalanie pow. 40 % powierzchni
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <span class="checkbox-icon" id="pdf-check-zalanie-pow80">☐</span> Zalanie pow. 80 % powierzchni
            <span class="checkbox-icon" id="pdf-check-zalanie-brak" style="margin-left: 20px;">☐</span> Brak zalania
          </td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_termowizja">☐</span> Badanie kamerą termowizyjną</td>
          <td></td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_endoskop">☐</span> Sprawdzenie kamerą endoskopową</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-prac_endoskop"></span> punkty</td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_geofon">☐</span> Geofon/badanie akustyczne</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-prac_geofon"></span> punkty</td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_barwnik">☐</span> Barwnik fluorescencyjny UV</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-prac_barwnik"></span> punkty</td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_gaz">☐</span> Gaz zanacznikowy</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-prac_gaz"></span> punkty</td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_silikony">☐</span> Sprawdzenie silikonów</td>
          <td></td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_wc">☐</span> Demontaż przycisków WC</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-prac_wc"></span> szt</td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_zawory">☐</span> Zakręcenie/odkręcenie zaworów (CO, ZWU, CWU)</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-prac_zawory"></span> szt</td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_spuszczenie_zwu">☐</span> Spuszczenie/ napełnienie z instalacji ZWU, CWU</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-prac_spuszczenie_zwu"></span> szt</td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_spuszczenie_co">☐</span> Spuszczenie/ napełnienie z instalacji CO</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-prac_spuszczenie_co"></span> szt</td>
        </tr>
        <tr>
          <td><span class="checkbox-icon" id="pdf-check-prac_meble">☐</span> Demontaż/montaż mebli, sanitariatów</td>
          <td class="pdf-right-align"><span class="font-bold pdf-underlined-val" id="pdf-text-prac_meble"></span> szt</td>
        </tr>
      </table>

      <!-- Pressure tests section table -->
      <div class="pdf-section-title font-bold" style="margin-top: 10px;">Próby ciśnieniowe</div>
      
      <table class="pdf-table pdf-pressure-result-table">
        <thead>
          <tr>
            <th width="46%">Próby ciśnieniowe</th>
            <th width="18%">Ciśnienie</th>
            <th width="18%">Czas</th>
            <th width="18%">Spadek</th>
          </tr>
        </thead>
        <tbody>
          <!-- CWU -->
          <tr id="pdf-tr-test-cwu" class="pdf-test-row">
            <td>
              <span class="checkbox-icon" id="pdf-check-test-cwu">☐</span>
              <strong style="margin-left: 5px;">CWU</strong>
              <div style="float: right; margin-right: 5px;">
                <span class="wynik-box positive" id="pdf-res-test-cwu-pos">pozytywny</span>
                <span class="wynik-box negative" id="pdf-res-test-cwu-neg">negatywny</span>
              </div>
            </td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-cwu-cis"></span> bar</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-cwu-czas"></span> min</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-cwu-spad"></span> bar</td>
          </tr>
          <!-- ZWU -->
          <tr id="pdf-tr-test-zwu" class="pdf-test-row">
            <td>
              <span class="checkbox-icon" id="pdf-check-test-zwu">☐</span>
              <strong style="margin-left: 5px;">ZWU</strong>
              <div style="float: right; margin-right: 5px;">
                <span class="wynik-box positive" id="pdf-res-test-zwu-pos">pozytywny</span>
                <span class="wynik-box negative" id="pdf-res-test-zwu-neg">negatywny</span>
              </div>
            </td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-zwu-cis"></span> bar</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-zwu-czas"></span> min</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-zwu-spad"></span> bar</td>
          </tr>
          <!-- CO -->
          <tr id="pdf-tr-test-co" class="pdf-test-row">
            <td>
              <span class="checkbox-icon" id="pdf-check-test-co">☐</span>
              <strong style="margin-left: 5px;">CO</strong>
              <div style="float: right; margin-right: 5px;">
                <span class="wynik-box positive" id="pdf-res-test-co-pos">pozytywny</span>
                <span class="wynik-box negative" id="pdf-res-test-co-neg">negatywny</span>
              </div>
            </td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-co-cis"></span> bar</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-co-czas"></span> min</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-co-spad"></span> bar</td>
          </tr>
          <!-- Zewnętrzna -->
          <tr id="pdf-tr-test-zewn" class="pdf-test-row pdf-test-disabled">
            <td>
              <span class="checkbox-icon" id="pdf-check-test-zewn">☐</span>
              <span style="margin-left: 5px;">Instalacja zewnętrzna</span>
              <div style="float: right; margin-right: 5px;">
                <span class="wynik-box positive" id="pdf-res-test-zewn-pos">pozytywny</span>
                <span class="wynik-box negative" id="pdf-res-test-zewn-neg">negatywny</span>
              </div>
            </td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-zewn-cis"></span> bar</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-zewn-czas"></span> min</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-zewn-spad"></span> bar</td>
          </tr>
          <!-- Bateria 1 -->
          <tr id="pdf-tr-test-bateria1" class="pdf-test-row pdf-test-disabled">
            <td>
              <span class="checkbox-icon" id="pdf-check-test-bateria1">☐</span>
              <span style="margin-left: 5px;">Instalacja baterii podt.</span>
              <div style="float: right; margin-right: 5px;">
                <span class="wynik-box positive" id="pdf-res-test-bateria1-pos">pozytywny</span>
                <span class="wynik-box negative" id="pdf-res-test-bateria1-neg">negatywny</span>
              </div>
            </td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-bateria1-cis"></span> bar</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-bateria1-czas"></span> min</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-bateria1-spad"></span> bar</td>
          </tr>
          <!-- Bateria 2 -->
          <tr id="pdf-tr-test-bateria2" class="pdf-test-row pdf-test-disabled">
            <td>
              <span class="checkbox-icon" id="pdf-check-test-bateria2">☐</span>
              <span style="margin-left: 5px;">Instalacja baterii podt.</span>
              <div style="float: right; margin-right: 5px;">
                <span class="wynik-box positive" id="pdf-res-test-bateria2-pos">pozytywny</span>
                <span class="wynik-box negative" id="pdf-res-test-bateria2-neg">negatywny</span>
              </div>
            </td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-bateria2-cis"></span> bar</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-bateria2-czas"></span> min</td>
            <td class="pdf-center font-bold"><span class="pdf-underlined-val" id="pdf-val-test-bateria2-spad"></span> bar</td>
          </tr>
        </tbody>
      </table>

      <!-- Textareas findings section -->
      <table class="pdf-table pdf-findings-table" style="margin-top: 10px;">
        <tr>
          <td width="20%" class="pdf-label font-bold">Roboty dodatkowe</td>
          <td width="80%" class="pdf-value" id="pdf-val-roboty_dodatkowe"></td>
        </tr>
        <tr>
          <td class="pdf-label font-bold">Metoda lokalizacji</td>
          <td class="pdf-value font-bold" id="pdf-val-metoda_lokalizacji"></td>
        </tr>
        <tr>
          <td class="pdf-label font-bold">Miejsce wycieku</td>
          <td class="pdf-value font-bold" id="pdf-val-miejsce_wycieku"></td>
        </tr>
        <tr>
          <td class="pdf-label font-bold">Uwagi</td>
          <td class="pdf-value" id="pdf-val-uwagi"></td>
        </tr>
      </table>

      <!-- Signature section for page 2 -->
      <table class="pdf-table pdf-signature-table" style="margin-top: 15px;">
        <tr>
          <td width="50%" class="pdf-center">
            <div class="pdf-sig-wrapper">
              <img id="pdf-img-sig-zleceniobiorca-2" class="pdf-signature-img" src="" alt="">
            </div>
            <div class="pdf-sig-line">Zleceniobiorca</div>
          </td>
          <td width="50%" class="pdf-center">
            <div class="pdf-sig-wrapper">
              <img id="pdf-img-sig-zleceniodawca-2" class="pdf-signature-img" src="" alt="">
            </div>
            <div class="pdf-sig-line">Zleceniodawca</div>
          </td>
        </tr>
      </table>

    </div>

  </div>

  <!-- JS Dependencies -->
  <script src="js/html2pdf.bundle.min.js"></script>
  <script src="js/generator.js"></script>
</body>

</html>
