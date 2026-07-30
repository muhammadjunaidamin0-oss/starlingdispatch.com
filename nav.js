// STARLING DISPATCH INTERACTIVE FREIGHT ENGINE & CALCULATOR

document.addEventListener('DOMContentLoaded', function () {
  // 1. Mobile Navigation Toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav');
  var headerCta = document.querySelector('.header-cta');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('nav-open');
      if (headerCta) headerCta.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? '✕' : '☰';
    });
  }

  // 2. DAT iQ & Truckstop Spot Rate Data Engine
  // Benchmarking real-time highest spot market rates across DAT One and Truckstop RateMate
  var spotMarketData = {
    'dry-van': {
      dat: 2.85,
      truckstop: 2.92,
      bestSource: 'Truckstop'
    },
    'reefer': {
      dat: 3.45,
      truckstop: 3.52,
      bestSource: 'Truckstop'
    },
    'flatbed': {
      dat: 3.70,
      truckstop: 3.65,
      bestSource: 'DAT iQ'
    },
    'step-deck': {
      dat: 3.80,
      truckstop: 3.88,
      bestSource: 'Truckstop'
    },
    'power-only': {
      dat: 2.75,
      truckstop: 2.70,
      bestSource: 'DAT iQ'
    },
    'box-truck': {
      dat: 2.50,
      truckstop: 2.45,
      bestSource: 'DAT iQ'
    }
  };

  var activeRateSource = 'highest'; // 'highest', 'dat', or 'truckstop'

  var calcTruck = document.getElementById('calc-truck');
  var calcMiles = document.getElementById('calc-miles');
  var calcMilesVal = document.getElementById('calc-miles-val');
  var calcGross = document.getElementById('calc-gross');
  var calcNet = document.getElementById('calc-net');
  var calcSourceBtns = document.querySelectorAll('.calc-source-btn');

  function getEffectiveRPM(equipmentKey) {
    var data = spotMarketData[equipmentKey] || spotMarketData['dry-van'];
    if (activeRateSource === 'dat') return data.dat;
    if (activeRateSource === 'truckstop') return data.truckstop;
    // Default to 'highest' / best rate between DAT & Truckstop
    return Math.max(data.dat, data.truckstop);
  }

  function updateCalculator() {
    if (!calcTruck || !calcMiles || !calcGross || !calcNet) return;
    
    var truckType = calcTruck.value || 'dry-van';
    var miles = parseInt(calcMiles.value, 10) || 2500;
    var rpm = getEffectiveRPM(truckType);

    if (calcMilesVal) {
      calcMilesVal.textContent = miles.toLocaleString() + ' miles';
    }

    var grossWeekly = Math.round(miles * rpm);
    var fee = Math.round(grossWeekly * 0.05); // 5% Starling Dispatch Fee
    var netWeekly = grossWeekly - fee;

    var dataObj = spotMarketData[truckType] || spotMarketData['dry-van'];
    var bestSource = dataObj.bestSource;

    calcGross.textContent = '$' + grossWeekly.toLocaleString();
    calcNet.textContent = '$' + netWeekly.toLocaleString() + '/wk after 5% dispatch (' + bestSource + ' Peak Rate @ $' + rpm.toFixed(2) + '/mi)';
  }

  if (calcSourceBtns.length > 0) {
    calcSourceBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        calcSourceBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeRateSource = btn.getAttribute('data-source') || 'highest';
        updateCalculator();
      });
    });
  }

  if (calcTruck && calcMiles) {
    calcTruck.addEventListener('change', updateCalculator);
    calcMiles.addEventListener('input', updateCalculator);
    updateCalculator(); // Initialize on load
  }

  // 3. Live Freight Ticker Duplication & Continuous Scroll
  var tickerContent = document.querySelector('.ticker-content');
  if (tickerContent && tickerContent.children.length > 0) {
    // Clone children for infinite seamless marquee loop
    tickerContent.innerHTML += tickerContent.innerHTML;
  }

  // 4. FAQ Search Filter Logic
  var faqSearch = document.getElementById('faq-search-input');
  var faqItems = document.querySelectorAll('.faq-item');

  if (faqSearch && faqItems.length > 0) {
    faqSearch.addEventListener('input', function (e) {
      var query = e.target.value.toLowerCase().trim();
      faqItems.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        if (text.includes(query)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
});
