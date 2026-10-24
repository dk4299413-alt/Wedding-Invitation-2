const intro = document.getElementById('introScreen');
const openButton = document.getElementById('openInvite');
const audio = document.getElementById('weddingAudio');
const musicToggle = document.getElementById('musicToggle');
const musicLabel = document.getElementById('musicLabel');

document.body.classList.add('locked');
openButton.addEventListener('click', () => {
  intro.classList.add('opening');
  setTimeout(() => {
    intro.classList.add('closed');
    document.body.classList.remove('locked');
  }, 420);
  /* Music is started by this user gesture below. */
  // Browsers permit audio after a direct user gesture.
  audio.play().then(() => {
    musicLabel.textContent = 'Pause music';
    musicToggle.classList.add('playing');
  }).catch(() => {
    musicLabel.textContent = 'Play music';
  });
});

musicToggle.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
      musicLabel.textContent = 'Pause music';
      musicToggle.classList.add('playing');
    } catch (error) {
      musicLabel.textContent = 'Tap to play';
    }
  } else {
    audio.pause();
    musicLabel.textContent = 'Play music';
    musicToggle.classList.remove('playing');
  }
});

// Wedding muhurtham: 29 November 2026, 7:30 AM IST (UTC+05:30).
const weddingTime = new Date('2026-11-29T07:30:00+05:30').getTime();
function updateCountdown() {
  const remaining = weddingTime - Date.now();
  const note = document.getElementById('countdownNote');
  if (remaining <= 0) {
    ['days','hours','minutes','seconds'].forEach(id => document.getElementById(id).textContent = '00');
    note.textContent = 'Our wedding day has arrived. Thank you for celebrating with us!';
    return;
  }
  const day = Math.floor(remaining / 86400000);
  const hour = Math.floor((remaining % 86400000) / 3600000);
  const minute = Math.floor((remaining % 3600000) / 60000);
  const second = Math.floor((remaining % 60000) / 1000);
  document.getElementById('days').textContent = String(day).padStart(2,'0');
  document.getElementById('hours').textContent = String(hour).padStart(2,'0');
  document.getElementById('minutes').textContent = String(minute).padStart(2,'0');
  document.getElementById('seconds').textContent = String(second).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Reveal cards and sections as they enter the viewport.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}


// Scratch-to-reveal wedding and reception date cards (mouse, touch, and stylus).
document.querySelectorAll('.scratch-date-card').forEach(card => {
  const canvas = card.querySelector('.scratch-surface');
  const ctx = canvas.getContext('2d');
  let isScratching = false;
  let lastPoint = null;
  let revealed = false;

  function paintSurface() {
    const rect = card.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#b78a48');
    gradient.addColorStop(.45, '#e3c37f');
    gradient.addColorStop(1, '#a97134');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Decorative foil grain and traditional kolam-inspired motifs.
    for (let i = 0; i < 95; i++) {
      const x = (i * 37.17) % rect.width;
      const y = (i * 19.73) % rect.height;
      ctx.fillStyle = i % 2 ? 'rgba(255,244,207,.18)' : 'rgba(93,48,17,.12)';
      ctx.beginPath();
      ctx.arc(x, y, i % 4 === 0 ? 1.4 : .7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,239,192,.72)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, rect.width - 16, rect.height - 16);
    ctx.fillStyle = '#fff0c9';
    ctx.font = '22px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('✦  ❈  ✦', rect.width / 2, 35);
    ctx.font = '600 12px Arial';
    ctx.letterSpacing = '2px';
    ctx.fillText('SCRATCH TO REVEAL', rect.width / 2, rect.height / 2 + 5);
    ctx.font = '20px Georgia';
    ctx.fillText('✧', rect.width / 2, rect.height - 17);
    ctx.globalCompositeOperation = 'destination-out';
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function scratch(event) {
    if (!isScratching || revealed) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 25;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (lastPoint) {
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
    } else {
      ctx.arc(point.x, point.y, 13, 0, Math.PI * 2);
    }
    ctx.stroke();
    lastPoint = point;
    checkProgress();
  }

  function checkProgress() {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    // Sample alpha pixels for performance on mobile.
    for (let i = 3; i < pixels.length; i += 4 * 24) {
      if (pixels[i] < 30) clear++;
    }
    if (clear / (pixels.length / (4 * 24)) > 0.36) {
      revealed = true;
      card.classList.add('scratched');
    }
  }

  canvas.addEventListener('pointerdown', event => {
    if (revealed) return;
    isScratching = true;
    lastPoint = null;
    try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
    scratch(event);
  });
  canvas.addEventListener('pointermove', scratch);
  const stopScratch = () => { isScratching = false; lastPoint = null; };
  canvas.addEventListener('pointerup', stopScratch);
  canvas.addEventListener('pointercancel', stopScratch);
  canvas.addEventListener('pointerleave', stopScratch);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
      if (!revealed) paintSurface();
    });
    resizeObserver.observe(card);
  } else {
    window.addEventListener('resize', () => { if (!revealed) paintSurface(); });
  }
  paintSurface();
});

// Allow the opening gesture from a tap/click anywhere on the opening screen.
intro.addEventListener('click', event => {
  if (event.target.closest('button') || intro.classList.contains('closed')) return;
  openButton.click();
});
