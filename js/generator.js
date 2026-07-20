/* ==========================================================================
   WyciekiPro — Logika Generatora Protokołów Technicznych
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  
  // ── WIZARD NAVIGATION LOGIC ──
  const steps = document.querySelectorAll('.wizard-step');
  const stepItems = document.querySelectorAll('.step-item');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  let currentStep = 1;

  function updateWizardUI() {
    // Show/hide steps
    steps.forEach(step => {
      step.classList.remove('active');
    });
    document.getElementById(`step-${currentStep}`).classList.add('active');

    // Update stepper classes
    stepItems.forEach(item => {
      const stepNum = parseInt(item.getAttribute('data-step'), 10);
      item.classList.remove('active', 'completed');
      
      if (stepNum === currentStep) {
        item.classList.add('active');
      } else if (stepNum < currentStep) {
        item.classList.add('completed');
      }
    });

    // Control buttons state
    if (currentStep === 1) {
      btnPrev.disabled = true;
    } else {
      btnPrev.disabled = false;
    }

    if (currentStep === steps.length) {
      btnNext.innerText = 'Podsumowanie';
      btnNext.style.display = 'none'; // Hide Next button on signature step, since download button is there
    } else {
      btnNext.innerText = 'Dalej';
      btnNext.style.display = 'block';
    }

    // Scroll to wizard top
    document.querySelector('.wizard-card').scrollIntoView({ behavior: 'smooth' });
  }

  function validateStep(step) {
    if (step === 1) {
      // Validate step 1 required fields
      const clientName = document.getElementById('klient_nazwa');
      const clientPhone = document.getElementById('klient_telefon');
      const clientAdres = document.getElementById('klient_adres');

      if (!clientName.value.trim() || !clientPhone.value.trim() || !clientAdres.value.trim()) {
        alert('Proszę wypełnić wymagane pola: Imię i Nazwisko, Telefon oraz Adres Lokalizacji.');
        return false;
      }
    }
    return true;
  }

  btnNext.addEventListener('click', function () {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        currentStep++;
        updateWizardUI();
      }
    }
  });

  btnPrev.addEventListener('click', function () {
    if (currentStep > 1) {
      currentStep--;
      updateWizardUI();
    }
  });

  // Allow clicking on completed stepper items to jump steps
  stepItems.forEach(item => {
    item.addEventListener('click', function () {
      const targetStep = parseInt(item.getAttribute('data-step'), 10);
      // Only allow jumping to previous steps or next step if validated
      if (targetStep < currentStep) {
        currentStep = targetStep;
        updateWizardUI();
      } else if (targetStep === currentStep + 1 && validateStep(currentStep)) {
        currentStep = targetStep;
        updateWizardUI();
      }
    });
  });


  // ── SIGNATURE PAD LOGIC (CANVAS) ──
  const sigZleceniobiorca = document.getElementById('sig-zleceniobiorca');
  const sigZleceniodawca = document.getElementById('sig-zleceniodawca');
  
  function initSignaturePad(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let drawing = false;
    let lastPos = { x: 0, y: 0 };

    function getMousePos(canvasDom, mouseEvent) {
      const rect = canvasDom.getBoundingClientRect();
      return {
        x: (mouseEvent.clientX - rect.left) * (canvasDom.width / rect.width),
        y: (mouseEvent.clientY - rect.top) * (canvasDom.height / rect.height)
      };
    }

    function getTouchPos(canvasDom, touchEvent) {
      const rect = canvasDom.getBoundingClientRect();
      if (touchEvent.touches.length === 0) return lastPos;
      return {
        x: (touchEvent.touches[0].clientX - rect.left) * (canvasDom.width / rect.width),
        y: (touchEvent.touches[0].clientY - rect.top) * (canvasDom.height / rect.height)
      };
    }

    // Mouse Events
    canvas.addEventListener('mousedown', function (e) {
      drawing = true;
      lastPos = getMousePos(canvas, e);
    });

    canvas.addEventListener('mousemove', function (e) {
      if (!drawing) return;
      const mousePos = getMousePos(canvas, e);
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      lastPos = mousePos;
      saveFormData(); // Auto-save on draw
    });

    window.addEventListener('mouseup', function () {
      drawing = false;
    });

    // Touch Events for Tablet/Phone
    canvas.addEventListener('touchstart', function (e) {
      drawing = true;
      lastPos = getTouchPos(canvas, e);
      e.preventDefault();
    });

    canvas.addEventListener('touchmove', function (e) {
      if (!drawing) return;
      const touchPos = getTouchPos(canvas, e);
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(touchPos.x, touchPos.y);
      ctx.stroke();
      lastPos = touchPos;
      e.preventDefault();
      saveFormData(); // Auto-save on draw
    });

    canvas.addEventListener('touchend', function (e) {
      drawing = false;
      e.preventDefault();
    });
  }

  if (sigZleceniobiorca) initSignaturePad(sigZleceniobiorca);
  if (sigZleceniodawca) initSignaturePad(sigZleceniodawca);

  // Clear signature button logic
  document.querySelectorAll('.btn-clear').forEach(btn => {
    btn.addEventListener('click', function () {
      const canvasId = btn.getAttribute('data-canvas');
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveFormData(); // Update storage
      }
    });
  });


  // ── AUTO-SAVE TO LOCAL STORAGE ──
  const form = document.getElementById('protocol-form');

  function saveFormData() {
    const formData = {};
    
    // Gather all inputs
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        formData[input.name] = input.checked;
      } else if (input.type === 'radio') {
        if (input.checked) {
          formData[input.name] = input.value;
        }
      } else {
        formData[input.name] = input.value;
      }
    });

    // Save canvases as data URLs
    if (sigZleceniobiorca) {
      formData['sig_zleceniobiorca_data'] = sigZleceniobiorca.toDataURL();
    }
    if (sigZleceniodawca) {
      formData['sig_zleceniodawca_data'] = sigZleceniodawca.toDataURL();
    }

    localStorage.setItem('wyciekipro_protocol_data', JSON.stringify(formData));
  }

  function loadFormData() {
    const saved = localStorage.getItem('wyciekipro_protocol_data');
    if (!saved) {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('data_sprawy').value = today;
      return;
    }

    try {
      const formData = JSON.parse(saved);
      const inputs = form.querySelectorAll('input, select, textarea');

      inputs.forEach(input => {
        if (formData[input.name] !== undefined) {
          if (input.type === 'checkbox') {
            input.checked = formData[input.name];
          } else if (input.type === 'radio') {
            if (input.value === formData[input.name]) {
              input.checked = true;
            }
          } else {
            input.value = formData[input.name];
          }
        }
      });

      // Restore signatures if they exist
      if (formData['sig_zleceniobiorca_data'] && sigZleceniobiorca) {
        const img = new Image();
        img.onload = function () {
          sigZleceniobiorca.getContext('2d').drawImage(img, 0, 0);
        };
        img.src = formData['sig_zleceniobiorca_data'];
      }

      if (formData['sig_zleceniodawca_data'] && sigZleceniodawca) {
        const img = new Image();
        img.onload = function () {
          sigZleceniodawca.getContext('2d').drawImage(img, 0, 0);
        };
        img.src = formData['sig_zleceniodawca_data'];
      }

    } catch (e) {
      console.error('Error loading form data from localStorage:', e);
    }
  }

  // Attach auto-save listener to all form fields
  form.addEventListener('input', saveFormData);
  form.addEventListener('change', saveFormData);

  // Initialize form restoration
  loadFormData();


  // ── RESET FORM BUTTON ──
  const btnReset = document.getElementById('btn-reset-form');
  btnReset.addEventListener('click', function () {
    if (confirm('Czy na pewno chcesz wyczyścić cały formularz wraz z podpisami? Te zmiany są nieodwracalne.')) {
      localStorage.removeItem('wyciekipro_protocol_data');
      form.reset();
      
      // Clear canvases
      [sigZleceniobiorca, sigZleceniodawca].forEach(canvas => {
        if (canvas) {
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }
      });

      // Reset date to today
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('data_sprawy').value = today;
      
      currentStep = 1;
      updateWizardUI();
    }
  });


  // Helper to copy all form values to the printable PDF template
  function fillPrintTemplate() {
    // 1. Copy values from form to print template
    const fieldsMap = {
      'nr_sprawy': ['pdf-val-nr_sprawy-1', 'pdf-val-nr_sprawy-2'],
      'klient_nazwa': ['pdf-val-klient_nazwa'],
      'klient_nip': ['pdf-val-klient_nip'],
      'klient_adres': ['pdf-val-klient_adres'],
      'klient_email': ['pdf-val-klient_email'],
      'klient_telefon': ['pdf-val-klient_telefon'],
      'przedmiot_szkody': ['pdf-val-przedmiot_szkody'],
      'wielkosc_mieszkania': ['pdf-val-wielkosc_mieszkania'],
      'pietro': ['pdf-val-pietro'],
      'wilgoc_sciany': ['pdf-text-sciany'],
      'wilgoc_sufitu': ['pdf-text-sufitu'],
      'wilgoc_posadzki': ['pdf-text-posadzki'],
      'prac_endoskop_val': ['pdf-text-prac_endoskop'],
      'prac_geofon_val': ['pdf-text-prac_geofon'],
      'prac_barwnik_val': ['pdf-text-prac_barwnik'],
      'prac_gaz_val': ['pdf-text-prac_gaz'],
      'prac_wc_val': ['pdf-text-prac_wc'],
      'prac_zawory_val': ['pdf-text-prac_zawory'],
      'prac_spuszczenie_zwu_val': ['pdf-text-prac_spuszczenie_zwu'],
      'prac_spuszczenie_co_val': ['pdf-text-prac_spuszczenie_co'],
      'prac_meble_val': ['pdf-text-prac_meble'],
      'roboty_dodatkowe': ['pdf-val-roboty_dodatkowe'],
      'metoda_lokalizacji': ['pdf-val-metoda_lokalizacji'],
      'miejsce_wycieku': ['pdf-val-miejsce_wycieku'],
      'uwagi': ['pdf-val-uwagi'],
      
      // Pressure Tests values
      'test_cwu_cisnienie': ['pdf-val-test-cwu-cis'],
      'test_cwu_czas': ['pdf-val-test-cwu-czas'],
      'test_cwu_spadek': ['pdf-val-test-cwu-spad'],
      'test_zwu_cisnienie': ['pdf-val-test-zwu-cis'],
      'test_zwu_czas': ['pdf-val-test-zwu-czas'],
      'test_zwu_spadek': ['pdf-val-test-zwu-spad'],
      'test_co_cisnienie': ['pdf-val-test-co-cis'],
      'test_co_czas': ['pdf-val-test-co-czas'],
      'test_co_spadek': ['pdf-val-test-co-spad'],
      'test_zewn_cisnienie': ['pdf-val-test-zewn-cis'],
      'test_zewn_czas': ['pdf-val-test-zewn-czas'],
      'test_zewn_spadek': ['pdf-val-test-zewn-spad'],
      'test_bateria1_cisnienie': ['pdf-val-test-bateria1-cis'],
      'test_bateria1_czas': ['pdf-val-test-bateria1-czas'],
      'test_bateria1_spadek': ['pdf-val-test-bateria1-spad'],
      'test_bateria2_cisnienie': ['pdf-val-test-bateria2-cis'],
      'test_bateria2_czas': ['pdf-val-test-bateria2-czas'],
      'test_bateria2_spadek': ['pdf-val-test-bateria2-spad']
    };

    // Text field copies
    for (const [inputName, pdfIds] of Object.entries(fieldsMap)) {
      const input = document.getElementById(inputName) || form.querySelector(`[name="${inputName}"]`);
      if (input) {
        pdfIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.innerText = input.value || '';
          }
        });
      }
    }

    // Special Date formatted copy
    const dateInput = document.getElementById('data_sprawy');
    const locationInput = document.getElementById('miejscowosc');
    const formattedDate = dateInput.value ? dateInput.value.split('-').reverse().join('.') : '';
    
    ['pdf-val-data-1', 'pdf-val-data-2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerText = formattedDate;
    });

    ['pdf-val-miejscowosc-1', 'pdf-val-miejscowosc-2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerText = locationInput.value || '';
    });

    // Forma płatności checkbox symbols
    const paymentVal = form.querySelector('input[name="forma_platnosci"]:checked').value;
    document.getElementById('pdf-val-pay-gotowka').innerText = paymentVal === 'GOTÓWKA' ? '☑' : '☐';
    document.getElementById('pdf-val-pay-przelew').innerText = paymentVal === 'PRZELEW' ? '☑' : '☐';

    // Miernik wilgotności checkbox symbols
    const tramexVal = document.getElementById('miernik_tramex').checked;
    const gannVal = document.getElementById('miernik_gann').checked;
    document.getElementById('pdf-val-miernik-tramex').innerText = tramexVal ? '☑' : '☐';
    document.getElementById('pdf-val-miernik-gann').innerText = gannVal ? '☑' : '☐';

    // Pomiary wilgotności checkmarks
    const isScianyActive = !!document.getElementById('wilgoc_sciany').value;
    const isSufituActive = !!document.getElementById('wilgoc_sufitu').value;
    const isPosadzkiActive = !!document.getElementById('wilgoc_posadzki').value;
    document.getElementById('pdf-check-sciany').innerText = isScianyActive ? '☑' : '☐';
    document.getElementById('pdf-check-sufitu').innerText = isSufituActive ? '☑' : '☐';
    document.getElementById('pdf-check-posadzki').innerText = isPosadzkiActive ? '☑' : '☐';

    // Stopień zalania radios checkmarks
    const stopienZalaniaInput = form.querySelector('input[name="stopien_zalania"]:checked');
    const stopienVal = stopienZalaniaInput ? stopienZalaniaInput.value : '';
    document.getElementById('pdf-check-zalanie-5').innerText = stopienVal.includes('do 5') ? '☑' : '☐';
    document.getElementById('pdf-check-zalanie-40').innerText = stopienVal.includes('do 40') ? '☑' : '☐';
    document.getElementById('pdf-check-zalanie-pow40').innerText = stopienVal.includes('pow. 40') ? '☑' : '☐';
    document.getElementById('pdf-check-zalanie-pow80').innerText = stopienVal.includes('pow. 80') ? '☑' : '☐';
    document.getElementById('pdf-check-zalanie-brak').innerText = stopienVal === 'Brak zalania' ? '☑' : '☐';

    // Wykonane prace checkboxes checkmarks
    const worksList = [
      'prac_termowizja', 'prac_endoskop', 'prac_geofon', 'prac_barwnik', 'prac_gaz',
      'prac_silikony', 'prac_wc', 'prac_zawory', 'prac_spuszczenie_zwu', 'prac_spuszczenie_co', 'prac_meble'
    ];
    worksList.forEach(work => {
      const checkbox = document.getElementById(work);
      const pdfCell = document.getElementById(`pdf-check-${work}`);
      if (pdfCell) {
        pdfCell.innerText = checkbox && checkbox.checked ? '☑' : '☐';
      }
    });

    // Próby ciśnieniowe Row styling (Active vs Disabled) and results displays
    const pressureTestsList = ['cwu', 'zwu', 'co', 'zewn', 'bateria1', 'bateria2'];
    pressureTestsList.forEach(test => {
      const isActive = document.getElementById(`test_${test}_active`).checked;
      const tr = document.getElementById(`pdf-tr-test-${test}`);
      const chkCell = document.getElementById(`pdf-check-test-${test}`);
      
      if (chkCell) {
        chkCell.innerText = isActive ? '☑' : '☐';
      }
      
      if (tr) {
        if (isActive) {
          tr.classList.remove('pdf-test-disabled');
          
          // Result
          const resultSelect = document.getElementById(`test_${test}_wynik`);
          const resultVal = resultSelect.value; // 'pozytywny' / 'negatywny'
          
          tr.classList.remove('cwu-pozytywny', 'cwu-negatywny', 'zwu-pozytywny', 'zwu-negatywny', 'co-pozytywny', 'co-negatywny', 'zewn-pozytywny', 'zewn-negatywny', 'bateria1-pozytywny', 'bateria1-negatywny', 'bateria2-pozytywny', 'bateria2-negatywny');
          tr.classList.add(`${test}-${resultVal}`);
        } else {
          tr.classList.add('pdf-test-disabled');
          tr.classList.remove('cwu-pozytywny', 'cwu-negatywny', 'zwu-pozytywny', 'zwu-negatywny', 'co-pozytywny', 'co-negatywny', 'zewn-pozytywny', 'zewn-negatywny', 'bateria1-pozytywny', 'bateria1-negatywny', 'bateria2-pozytywny', 'bateria2-negatywny');
          
          // Clear text values in PDF
          ['cis', 'czas', 'spad'].forEach(suffix => {
            const el = document.getElementById(`pdf-val-test-${test}-${suffix}`);
            if (el) el.innerText = '';
          });
        }
      }
    });

    // Signatures images setup
    const sig1Data = sigZleceniobiorca.toDataURL();
    const sig2Data = sigZleceniodawca.toDataURL();

    // Check if canvases are blank
    function isCanvasBlank(canvas) {
      const ctx = canvas.getContext('2d');
      const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
      return !buffer.some(color => color !== 0);
    }

    const imgSigZleceniobiorca1 = document.getElementById('pdf-img-sig-zleceniobiorca-1');
    const imgSigZleceniobiorca2 = document.getElementById('pdf-img-sig-zleceniobiorca-2');
    const imgSigZleceniodawca1 = document.getElementById('pdf-img-sig-zleceniodawca-1');
    const imgSigZleceniodawca2 = document.getElementById('pdf-img-sig-zleceniodawca-2');

    if (!isCanvasBlank(sigZleceniobiorca)) {
      imgSigZleceniobiorca1.src = sig1Data;
      imgSigZleceniobiorca1.style.display = 'block';
      imgSigZleceniobiorca2.src = sig1Data;
      imgSigZleceniobiorca2.style.display = 'block';
    } else {
      imgSigZleceniobiorca1.style.display = 'none';
      imgSigZleceniobiorca2.style.display = 'none';
    }

    if (!isCanvasBlank(sigZleceniodawca)) {
      imgSigZleceniodawca1.src = sig2Data;
      imgSigZleceniodawca1.style.display = 'block';
      imgSigZleceniodawca2.src = sig2Data;
      imgSigZleceniodawca2.style.display = 'block';
    } else {
      imgSigZleceniodawca1.style.display = 'none';
      imgSigZleceniodawca2.style.display = 'none';
    }
  }

  // ── PDF GENERATOR ACTIONS ──
  const btnGenerate = document.getElementById('btn-generate-pdf');
  const btnOpen = document.getElementById('btn-open-pdf');

  function getPdfOptions() {
    const caseNumber = document.getElementById('nr_sprawy').value.replace(/\//g, '-');
    const pdfFilename = `Protokol_${caseNumber || 'WyciekiPro'}.pdf`;

    return {
      margin: 0,
      filename: pdfFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        width: 794,
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
  }

  // Download PDF button
  btnGenerate.addEventListener('click', function () {
    if (!validateStep(1)) {
      currentStep = 1;
      updateWizardUI();
      return;
    }

    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    fillPrintTemplate();
    document.body.classList.add('pdf-export-mode');

    // Delay to allow browser reflow after toggling display mode
    setTimeout(function () {
      const printElement = document.getElementById('print-template');
      const opt = getPdfOptions();

      html2pdf().from(printElement).set(opt).save().then(() => {
        document.body.classList.remove('pdf-export-mode');
        window.scrollTo(0, originalScrollY);
      }).catch(err => {
        console.error('Error generating PDF:', err);
        document.body.classList.remove('pdf-export-mode');
        window.scrollTo(0, originalScrollY);
        alert('Wystąpił błąd podczas generowania pliku PDF. Spróbuj ponownie.');
      });
    }, 150);
  });

  // Open PDF in new tab button (highly compatible with mobile/tablets)
  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      if (!validateStep(1)) {
        currentStep = 1;
        updateWizardUI();
        return;
      }

      const originalScrollY = window.scrollY;
      window.scrollTo(0, 0);

      fillPrintTemplate();
      document.body.classList.add('pdf-export-mode');

      // Show loader or processing message since generation takes a second
      btnOpen.innerText = 'Generowanie...';
      btnOpen.disabled = true;

      // Delay to allow browser reflow after toggling display mode
      setTimeout(function () {
        const printElement = document.getElementById('print-template');
        const opt = getPdfOptions();

        html2pdf().from(printElement).set(opt).output('bloburl').then(function (blobUrl) {
          btnOpen.innerText = '👁️ Otwórz PDF w nowej karcie';
          btnOpen.disabled = false;
          document.body.classList.remove('pdf-export-mode');
          window.scrollTo(0, originalScrollY);
          
          // Open PDF in a new browser window/tab
          const newWindow = window.open(blobUrl, '_blank');
          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            // If popup blocker triggers, alert user with manual link
            alert('Przeglądarka zablokowała otwarcie nowej karty. Zezwól na wyskakujące okienka (Pop-ups) lub użyj przycisku Pobierz.');
          }
        }).catch(err => {
          console.error('Error opening PDF in new tab:', err);
          btnOpen.innerText = '👁️ Otwórz PDF w nowej karcie';
          btnOpen.disabled = false;
          document.body.classList.remove('pdf-export-mode');
          window.scrollTo(0, originalScrollY);
          alert('Wystąpił błąd podczas generowania pliku PDF. Spróbuj ponownie.');
        });
      }, 150);
    });
  }

  // Trigger initial UI setup
  updateWizardUI();

});
