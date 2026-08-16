/* ══════════════════════════════════════════════════════
   STARLING DISPATCH — Interactive Engine v2.0
   Scroll Reveals · Stat Counters · Sticky CTA · Calculator
══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  // ── 1. Scroll Reveal (IntersectionObserver) ──
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(function (el) {
    revealObs.observe(el);
  });

  // ── 2. Stat Counter Animation ──
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (el.getAttribute('data-decimals') || '0');
    var duration = 1800;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out quad
      var eased = 1 - (1 - progress) * (1 - progress);
      var current = start + (target - start) * eased;
      if (parseInt(decimals) > 0) {
        el.textContent = prefix + current.toFixed(parseInt(decimals)) + suffix;
      } else {
        el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  var statObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        var counters = entry.target.querySelectorAll('[data-target]');
        counters.forEach(function (c) { animateCounter(c); });
        statObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.20 });

  document.querySelectorAll('.stat-card').forEach(function (el) {
    statObs.observe(el);
  });

  // ── 3. Header Scroll Effect ──
  var header = document.querySelector('header');
  var lastScroll = 0;
  window.addEventListener('scroll', function () {
    var scroll = window.pageYOffset;
    if (header) {
      if (scroll > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    lastScroll = scroll;
  }, { passive: true });

  // ── 4. Sticky CTA Bar ──
  var stickyCta = document.querySelector('.sticky-cta');
  var stickyDismissed = false;

  if (stickyCta) {
    var closeBtn = stickyCta.querySelector('.sticky-cta-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        stickyCta.classList.remove('visible');
        stickyDismissed = true;
      });
    }

    window.addEventListener('scroll', function () {
      if (stickyDismissed) return;
      if (window.pageYOffset > 500) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    }, { passive: true });
  }

  // ── 5. Mobile Navigation Toggle ──
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav');
  var headerCta = document.querySelector('.header-cta');

  function closeMobileNav() {
    if (nav && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      if (headerCta) headerCta.classList.remove('nav-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('nav-open');
      if (headerCta) headerCta.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? '✕' : '☰';
    });

    // Close menu when tapping any link inside
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });
  }

  // ── 6. Calculator Engine (DAT + Truckstop) ──
  var spotMarketData = {
    'dry-van':    { dat: 3.02, truckstop: 3.10, bestSource: 'Truckstop' },
    'reefer':     { dat: 3.65, truckstop: 3.72, bestSource: 'Truckstop' },
    'flatbed':    { dat: 3.92, truckstop: 3.85, bestSource: 'DAT iQ' },
    'step-deck':  { dat: 4.00, truckstop: 4.10, bestSource: 'Truckstop' },
    'power-only': { dat: 2.90, truckstop: 2.85, bestSource: 'DAT iQ' },
    'box-truck':  { dat: 2.65, truckstop: 2.60, bestSource: 'DAT iQ' }
  };

  var activeRateSource = 'highest';
  var calcTruck = document.getElementById('calc-truck');
  var calcMiles = document.getElementById('calc-miles');
  var calcMilesVal = document.getElementById('calc-miles-val');
  var calcGross = document.getElementById('calc-gross');
  var calcNet = document.getElementById('calc-net');
  var calcSourceBtns = document.querySelectorAll('.calc-source-btn');

  function getEffectiveRPM(key) {
    var d = spotMarketData[key] || spotMarketData['dry-van'];
    if (activeRateSource === 'dat') return d.dat;
    if (activeRateSource === 'truckstop') return d.truckstop;
    return Math.max(d.dat, d.truckstop);
  }

  function updateCalculator() {
    if (!calcTruck || !calcMiles || !calcGross || !calcNet) return;
    var truckType = calcTruck.value || 'dry-van';
    var miles = parseInt(calcMiles.value, 10) || 2500;
    var rpm = getEffectiveRPM(truckType);
    if (calcMilesVal) calcMilesVal.textContent = miles.toLocaleString() + ' miles';
    var grossWeekly = Math.round(miles * rpm);
    var fee = Math.round(grossWeekly * 0.06);
    var netWeekly = grossWeekly - fee;
    var dataObj = spotMarketData[truckType] || spotMarketData['dry-van'];
    calcGross.textContent = '$' + grossWeekly.toLocaleString();
    calcNet.textContent = '$' + netWeekly.toLocaleString() + '/wk after 6% dispatch (' + dataObj.bestSource + ' @ $' + rpm.toFixed(2) + '/mi)';
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
    updateCalculator();
  }

  // ── 7. Live Freight Ticker Duplication ──
  var tickerContent = document.querySelector('.ticker-content');
  if (tickerContent && tickerContent.children.length > 0 && !tickerContent.dataset.duplicated) {
    tickerContent.innerHTML += tickerContent.innerHTML;
    tickerContent.dataset.duplicated = 'true';
  }

  // ── 8. FAQ Search Filter ──
  var faqSearch = document.getElementById('faq-search-input');
  var faqItems = document.querySelectorAll('.faq-item');

  if (faqSearch && faqItems.length > 0) {
    faqSearch.addEventListener('input', function (e) {
      var query = e.target.value.toLowerCase().trim();
      faqItems.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  // ── 9. Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
