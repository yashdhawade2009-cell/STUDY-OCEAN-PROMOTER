/* ============================================================
   VORTEX PRIME OP — STUDY OCEAN PROMOTER
   script.js — Core Logic & Animations
   ============================================================ */

'use strict';

/* ============================================================
   INTRO CINEMATIC
   ============================================================ */
(function initIntro() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  // Build shockwave rings
  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div');
    ring.className = 'shockwave';
    overlay.prepend(ring);
  }

  // Dismiss after 5 seconds
  setTimeout(function () {
    overlay.classList.add('fade-out');
  }, 5000);

  // Remove from DOM after transition
  overlay.addEventListener('transitionend', function () {
    if (overlay.classList.contains('fade-out')) {
      overlay.remove();
    }
  });
})();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function initScrollReveal() {
  const targets = document.querySelectorAll('.scroll-reveal, .promotions-section, .admin-access-section');
  if (!targets.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(function (el) { observer.observe(el); });
})();

/* ============================================================
   PROMOTIONS GALLERY
   — Scans promotions/ folder via manifest or uses known names
   ============================================================ */
(function initGallery() {
  const grid = document.getElementById('promo-grid');
  if (!grid) return;

  // Try to load manifest first, then fall back to a probe list
  const knownImages = [];
  // Generate probe list: promo1.jpg through promo20.jpg
  const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const probeList = [];
  for (let i = 1; i <= 20; i++) {
    extensions.forEach(function (ext) {
      probeList.push('promotions/promo' + i + '.' + ext);
    });
  }

  let found = 0;
  let checked = 0;
  const total = probeList.length;

  function tryLoad(src) {
    return new Promise(function (resolve) {
      const img = new Image();
      img.onload = function () { resolve({ src: src, ok: true }); };
      img.onerror = function () { resolve({ src: src, ok: false }); };
      img.src = src;
    });
  }

  // Batch probe all images
  Promise.all(probeList.map(tryLoad)).then(function (results) {
    const validImages = results.filter(function (r) { return r.ok; });
    renderGallery(validImages.map(function (r) { return r.src; }));
  });

  function renderGallery(imagePaths) {
    grid.innerHTML = '';

    if (!imagePaths.length) {
      grid.innerHTML =
        '<div class="promo-empty">' +
        '<span class="promo-empty-icon">&#128248;</span>' +
        'NO PROMOTIONS LOADED<br>' +
        '<span style="font-size:0.72rem;opacity:0.5;margin-top:0.5rem;display:block;">' +
        'Add images to the promotions/ folder to display them here.' +
        '</span></div>';
      return;
    }

    imagePaths.forEach(function (src, idx) {
      const card = document.createElement('div');
      card.className = 'promo-card';
      card.style.animationDelay = (idx * 0.08) + 's';

      const img = document.createElement('img');
      img.src = src;
      img.alt = 'VORTEX PRIME OP Promotion ' + (idx + 1);
      img.loading = 'lazy';
      img.decoding = 'async';

      const overlay = document.createElement('div');
      overlay.className = 'promo-card-overlay';
      overlay.textContent = '&#9889; VORTEX PRIME OP &#9889;';
      // Use innerHTML to allow entity rendering
      overlay.innerHTML = '&#9889;&nbsp;VORTEX PRIME OP&nbsp;&#9889;';

      card.appendChild(img);
      card.appendChild(overlay);
      grid.appendChild(card);

      // Fade cards in sequentially
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.5s ease ' + (idx * 0.1) + 's, transform 0.5s ease ' + (idx * 0.1) + 's';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      });
    });
  }
})();

/* ============================================================
   ADMIN LOGIN LOGIC
   ============================================================ */
(function initAdminLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const passwordInput = document.getElementById('password-input');
  const warningPanel = document.getElementById('warning-panel');
  const attemptDisplay = document.getElementById('attempt-count');
  const correctPassword = 'STUDYOCEAN';
  let attempts = 0;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const val = passwordInput.value.trim();

    if (val === correctPassword) {
      // Flash green then redirect
      form.style.transition = 'opacity 0.5s';
      form.style.opacity = '0';
      setTimeout(function () {
        window.location.href = 'upload.html';
      }, 600);
    } else {
      attempts++;
      passwordInput.value = '';
      passwordInput.classList.add('form-input--shake');
      setTimeout(function () {
        passwordInput.classList.remove('form-input--shake');
      }, 600);

      if (warningPanel) {
        warningPanel.classList.add('show');
      }
      if (attemptDisplay) {
        attemptDisplay.textContent = attempts;
      }

      // Update IP display
      const ipLine = document.getElementById('ip-line');
      if (ipLine) {
        const fakeIp = generateFakeIp();
        ipLine.textContent = 'TRACING IP: ' + fakeIp + '...';
      }
    }
  });

  function generateFakeIp() {
    return [
      Math.floor(Math.random() * 200 + 50),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255)
    ].join('.');
  }
})();

/* ============================================================
   UPLOAD PANEL — DRAG & DROP UI
   ============================================================ */
(function initUploadPanel() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const statusMsg = document.getElementById('upload-status');
  if (!dropZone) return;

  dropZone.addEventListener('click', function () {
    fileInput && fileInput.click();
  });

  dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', function () {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
  });

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      handleFiles(fileInput.files);
    });
  }

  function handleFiles(files) {
    if (!files.length) return;
    const file = files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!statusMsg) return;

    if (!validTypes.includes(file.type)) {
      statusMsg.style.color = 'var(--neon-red)';
      statusMsg.innerHTML =
        '&#9888;&nbsp;INVALID FILE TYPE. Use JPG, PNG, WEBP, or GIF.';
      return;
    }

    statusMsg.style.color = 'var(--neon-blue)';
    statusMsg.innerHTML =
      '&#9654;&nbsp;FILE SELECTED: <strong>' + escapeHtml(file.name) + '</strong> (' +
      formatBytes(file.size) + ')<br>' +
      '<span style="font-size:0.72rem;color:var(--text-dim)">' +
      'Remember: manually place this file in the <strong>promotions/</strong> folder and reload the homepage.' +
      '</span>';
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();

/* ============================================================
   TYPED TEXT EFFECT (terminal lines)
   ============================================================ */
(function initTyped() {
  const targets = document.querySelectorAll('[data-typed]');
  targets.forEach(function (el) {
    const text = el.getAttribute('data-typed') || el.textContent;
    el.textContent = '';
    el.style.visibility = 'visible';
    let i = 0;
    const delay = parseInt(el.getAttribute('data-typed-delay') || '0', 10);

    setTimeout(function () {
      const interval = setInterval(function () {
        if (i < text.length) {
          el.textContent += text[i];
          i++;
        } else {
          clearInterval(interval);
          // Add cursor after done, then remove after 2s
          const cursor = document.createElement('span');
          cursor.className = 'cursor-blink';
          el.appendChild(cursor);
          setTimeout(function () { cursor.remove(); }, 2000);
        }
      }, 38);
    }, delay);
  });
})();

/* ============================================================
   PARTICLE BACKGROUND (canvas — lightweight)
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = 55;
  const particles = [];

  function randomColor() {
    const colors = ['rgba(0,229,255,', 'rgba(255,0,60,', 'rgba(179,0,255,'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      color: randomColor(),
      alpha: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   GLITCH EFFECT (heading)
   ============================================================ */
(function initGlitch() {
  const glitchEl = document.querySelector('.glitch-text');
  if (!glitchEl) return;

  setInterval(function () {
    if (Math.random() > 0.85) {
      glitchEl.classList.add('glitch-active');
      setTimeout(function () {
        glitchEl.classList.remove('glitch-active');
      }, 150);
    }
  }, 2000);
})();
