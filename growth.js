/* ══════════════════════════════════════════════════════
   STARLING DISPATCH — Growth Engine v1.0
   WhatsApp Button · Exit-Intent Popup · Social Proof Toasts
   Referral Banner · UTM Tracking
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────────── */
  var CONFIG = {
    whatsapp: {
      number: '19162090883',
      message: 'Hi Starling Dispatch! I\'m interested in your 14-day free dispatch trial. Can you tell me more?'
    },
    exitPopup: {
      delay: 8000,          // ms before exit-intent activates
      cookieKey: 'sd_exit_dismissed',
      cookieDays: 3
    },
    toasts: [
      { name: 'Marcus T.',   location: 'TX',  equipment: 'Dry Van',  action: 'just started his free trial' },
      { name: 'Darius K.',   location: 'GA',  equipment: 'Reefer',   action: 'booked his first load today' },
      { name: 'Jason R.',    location: 'OH',  equipment: 'Flatbed',  action: 'joined Starling Dispatch' },
      { name: 'Carlos M.',   location: 'FL',  equipment: 'Hotshot',  action: 'just activated his free trial' },
      { name: 'Andre W.',    location: 'NC',  equipment: 'Power Only', action: 'got his first load in 2 hours' },
      { name: 'Tyrone B.',   location: 'TN',  equipment: 'Box Truck', action: 'started his free trial' },
      { name: 'Rodrigo S.',  location: 'TX',  equipment: 'Reefer',   action: 'joined as a new carrier' },
      { name: 'Mike D.',     location: 'IL',  equipment: 'Dry Van',  action: 'booked 3 loads this week' },
    ],
    toastInterval: 28000,   // ms between toast notifications
    toastDelay:   15000     // ms before first toast appears
  };

  /* ─────────────────────────────────────────────
     INJECT SHARED STYLES
  ───────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = `

/* ── WHATSAPP BUTTON ── */
#sd-wa-btn {
  position: fixed;
  bottom: 92px;
  right: 24px;
  z-index: 9990;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #25D366, #128C7E);
  box-shadow: 0 4px 24px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s ease;
  animation: wa-pulse 2.8s ease-in-out infinite;
  text-decoration: none;
}
#sd-wa-btn:hover {
  transform: scale(1.12) translateY(-2px);
  box-shadow: 0 8px 36px rgba(37,211,102,0.60);
  animation: none;
}
#sd-wa-btn svg { width: 30px; height: 30px; fill: #fff; flex-shrink: 0; }
#sd-wa-tooltip {
  position: absolute;
  right: 68px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(7,16,32,0.95);
  border: 1px solid rgba(37,211,102,0.3);
  color: #C9D1DC;
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  padding: 7px 12px;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
#sd-wa-tooltip::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: rgba(7,16,32,0.95);
}
#sd-wa-btn:hover #sd-wa-tooltip { opacity: 1; }

@keyframes wa-pulse {
  0%, 100% { box-shadow: 0 4px 24px rgba(37,211,102,0.45), 0 0 0 0 rgba(37,211,102,0.4); }
  50% { box-shadow: 0 4px 24px rgba(37,211,102,0.45), 0 0 0 10px rgba(37,211,102,0); }
}

/* ── EXIT-INTENT POPUP ── */
#sd-exit-overlay {
  position: fixed;
  inset: 0;
  z-index: 99995;
  background: rgba(3,11,20,0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}
#sd-exit-overlay.active {
  opacity: 1;
  pointer-events: all;
}
#sd-exit-modal {
  background: linear-gradient(145deg, #071020, #0A1829);
  border: 1px solid rgba(212,160,23,0.25);
  border-radius: 20px;
  padding: 44px 40px 36px;
  max-width: 520px;
  width: 100%;
  position: relative;
  box-shadow: 0 24px 80px rgba(0,0,0,0.70), 0 0 0 1px rgba(212,160,23,0.08);
  transform: scale(0.92) translateY(16px);
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  text-align: center;
  font-family: 'Outfit', system-ui, sans-serif;
}
#sd-exit-overlay.active #sd-exit-modal {
  transform: scale(1) translateY(0);
}
#sd-exit-close {
  position: absolute;
  top: 14px;
  right: 18px;
  background: none;
  border: none;
  color: #7A8FA6;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 4px 8px;
  transition: color 0.2s;
}
#sd-exit-close:hover { color: #fff; }
.sd-exit-emoji { font-size: 48px; display: block; margin-bottom: 16px; }
.sd-exit-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #D4A017;
  margin-bottom: 10px;
}
.sd-exit-title {
  font-family: 'Montserrat', 'Arial Black', sans-serif;
  font-size: clamp(22px, 5vw, 28px);
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  margin-bottom: 14px;
}
.sd-exit-title span {
  background: linear-gradient(135deg, #F0C040, #D4A017);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.sd-exit-body {
  font-size: 14px;
  color: #7A8FA6;
  line-height: 1.65;
  margin-bottom: 28px;
}
.sd-exit-perks {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
  text-align: left;
}
.sd-exit-perk {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #C9D1DC;
  font-weight: 500;
}
.sd-exit-perk-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,200,150,0.15);
  border: 1px solid rgba(0,200,150,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
}
.sd-exit-btn-primary {
  display: block;
  width: 100%;
  padding: 15px 24px;
  background: linear-gradient(135deg, #F0C040, #D4A017);
  color: #030B14;
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  text-decoration: none;
  margin-bottom: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 24px rgba(212,160,23,0.4);
}
.sd-exit-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(212,160,23,0.55);
}
.sd-exit-dismiss {
  font-size: 12px;
  color: #3D5166;
  cursor: pointer;
  background: none;
  border: none;
  font-family: 'Outfit', system-ui, sans-serif;
  padding: 6px;
  transition: color 0.2s;
}
.sd-exit-dismiss:hover { color: #7A8FA6; }

/* ── SOCIAL PROOF TOAST ── */
#sd-toast-container {
  position: fixed;
  bottom: 90px;
  left: 20px;
  z-index: 9985;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  pointer-events: none;
}
.sd-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(7,16,32,0.96);
  border: 1px solid rgba(212,160,23,0.20);
  border-radius: 12px;
  padding: 12px 16px;
  max-width: 300px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  pointer-events: all;
  transform: translateX(-120%);
  transition: transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease;
  opacity: 0;
  font-family: 'Outfit', system-ui, sans-serif;
}
.sd-toast.show {
  transform: translateX(0);
  opacity: 1;
}
.sd-toast.hide {
  transform: translateX(-120%);
  opacity: 0;
}
.sd-toast-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D4A017, #F0C040);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  color: #030B14;
  flex-shrink: 0;
}
.sd-toast-body { flex: 1; min-width: 0; }
.sd-toast-name {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sd-toast-action {
  font-size: 11.5px;
  color: #7A8FA6;
  line-height: 1.4;
}
.sd-toast-action strong { color: #00C896; }
.sd-toast-equip {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .06em;
  color: #D4A017;
  text-transform: uppercase;
  margin-top: 3px;
}
.sd-toast-time {
  font-size: 10px;
  color: #3D5166;
  flex-shrink: 0;
  align-self: flex-start;
}

@media (max-width: 480px) {
  #sd-wa-btn { bottom: 80px; right: 16px; width: 50px; height: 50px; }
  #sd-wa-tooltip { display: none; }
  .sd-toast { max-width: 260px; }
  #sd-exit-modal { padding: 32px 22px 28px; }
}
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────────
     1. WHATSAPP FLOATING BUTTON
  ───────────────────────────────────────────── */
  function initWhatsApp() {
    var encodedMsg = encodeURIComponent(CONFIG.whatsapp.message);
    var waUrl = 'https://wa.me/' + CONFIG.whatsapp.number + '?text=' + encodedMsg;

    var btn = document.createElement('a');
    btn.id = 'sd-wa-btn';
    btn.href = waUrl;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Chat with us on WhatsApp');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span id="sd-wa-tooltip">Chat on WhatsApp</span>
    `;

    document.body.appendChild(btn);
  }

  /* ─────────────────────────────────────────────
     2. EXIT-INTENT POPUP
  ───────────────────────────────────────────── */
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }
  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  function initExitPopup() {
    if (getCookie(CONFIG.exitPopup.cookieKey)) return;

    var overlay = document.createElement('div');
    overlay.id = 'sd-exit-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Special offer before you go');
    overlay.innerHTML = `
      <div id="sd-exit-modal">
        <button id="sd-exit-close" aria-label="Close">✕</button>
        <span class="sd-exit-emoji">🚛</span>
        <div class="sd-exit-eyebrow">Wait — Don't Leave Empty-Handed</div>
        <h2 class="sd-exit-title">Get <span>14 Days FREE</span><br>Dispatch Service</h2>
        <p class="sd-exit-body">
          Before you go — activate your free trial and let us book your first high-paying load.
          No contracts, no setup fee, zero risk.
        </p>
        <div class="sd-exit-perks">
          <div class="sd-exit-perk">
            <div class="sd-exit-perk-icon">✓</div>
            <span>Dedicated dispatcher books loads within hours</span>
          </div>
          <div class="sd-exit-perk">
            <div class="sd-exit-perk-icon">✓</div>
            <span>Top DAT iQ &amp; Truckstop rates negotiated for you</span>
          </div>
          <div class="sd-exit-perk">
            <div class="sd-exit-perk-icon">✓</div>
            <span>All paperwork, rate cons &amp; factoring handled</span>
          </div>
          <div class="sd-exit-perk">
            <div class="sd-exit-perk-icon">✓</div>
            <span>Cancel anytime — no binding contract</span>
          </div>
        </div>
        <a href="contact.html" class="sd-exit-btn-primary" id="sd-exit-cta">
          🚀 Claim My 14-Day Free Trial
        </a>
        <button class="sd-exit-dismiss" id="sd-exit-no">No thanks, I'll keep hunting loads myself</button>
      </div>
    `;
    document.body.appendChild(overlay);

    function openPopup() {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closePopup(permanent) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      if (permanent) {
        setCookie(CONFIG.exitPopup.cookieKey, '1', CONFIG.exitPopup.cookieDays);
      }
    }

    document.getElementById('sd-exit-close').addEventListener('click', function () { closePopup(true); });
    document.getElementById('sd-exit-no').addEventListener('click', function () { closePopup(true); });
    document.getElementById('sd-exit-cta').addEventListener('click', function () { closePopup(true); });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePopup(true);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closePopup(true);
    });

    // Desktop: mouse leaves viewport upward
    var activated = false;
    var readyTimer = setTimeout(function () {
      document.addEventListener('mouseleave', function (e) {
        if (!activated && e.clientY <= 10) {
          activated = true;
          openPopup();
        }
      });
    }, CONFIG.exitPopup.delay);

    // Mobile: scroll back to top 80%+ rapidly
    var lastScrollY = window.pageYOffset;
    var mobileScrollHandler = function () {
      var currentY = window.pageYOffset;
      var delta = lastScrollY - currentY;
      if (!activated && currentY < 300 && delta > 60) {
        activated = true;
        openPopup();
      }
      lastScrollY = currentY;
    };
    window.addEventListener('scroll', mobileScrollHandler, { passive: true });
  }

  /* ─────────────────────────────────────────────
     3. SOCIAL PROOF TOASTS
  ───────────────────────────────────────────── */
  function initToasts() {
    var container = document.createElement('div');
    container.id = 'sd-toast-container';
    document.body.appendChild(container);

    var toasts = CONFIG.toasts.slice();
    // Shuffle
    for (var i = toasts.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = toasts[i]; toasts[i] = toasts[j]; toasts[j] = tmp;
    }

    var index = 0;

    function timeAgo() {
      var minutes = [2, 5, 8, 12, 17, 23, 31, 44];
      var m = minutes[Math.floor(Math.random() * minutes.length)];
      return m + 'm ago';
    }

    function showToast() {
      var data = toasts[index % toasts.length];
      index++;

      var toast = document.createElement('div');
      toast.className = 'sd-toast';
      toast.innerHTML = `
        <div class="sd-toast-avatar">${data.name.charAt(0)}</div>
        <div class="sd-toast-body">
          <div class="sd-toast-name">${data.name}. — ${data.location}</div>
          <div class="sd-toast-action"><strong>${data.action}</strong></div>
          <div class="sd-toast-equip">${data.equipment} Operator</div>
        </div>
        <div class="sd-toast-time">${timeAgo()}</div>
      `;

      container.appendChild(toast);

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          toast.classList.add('show');
        });
      });

      // Auto-hide after 5s
      setTimeout(function () {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 500);
      }, 5000);
    }

    // Start toasts after delay, then repeat
    setTimeout(function () {
      showToast();
      setInterval(showToast, CONFIG.toastInterval);
    }, CONFIG.toastDelay);
  }

  /* ─────────────────────────────────────────────
     4. UTM SOURCE TRACKING (saves to sessionStorage)
  ───────────────────────────────────────────── */
  function trackUTM() {
    var params = new URLSearchParams(window.location.search);
    var utm = {
      source:   params.get('utm_source'),
      medium:   params.get('utm_medium'),
      campaign: params.get('utm_campaign')
    };
    if (utm.source) {
      sessionStorage.setItem('sd_utm', JSON.stringify(utm));
    }
  }

  /* ─────────────────────────────────────────────
     INIT ALL — after DOM ready
  ───────────────────────────────────────────── */
  function init() {
    initWhatsApp();
    initExitPopup();
    initToasts();
    trackUTM();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
