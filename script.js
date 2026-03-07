/* ============================================================
   REALM SCRIPT
   ============================================================ */

/* ---- NAVBAR scroll effect ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* ---- Mobile nav toggle ---- */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ---- PARTICLE CANVAS (hero background) ---- */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#c9a84c', '#6a0dad', '#00ff88', '#9b30ff'];

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.5 + .5;
    this.vx = (Math.random() - .5) * .4;
    this.vy = (Math.random() - .5) * .4;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * .5 + .1;
  };
  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(201,168,76,${.06 * (1 - dist / 100)})`;
          ctx.lineWidth = .5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ---- TYPEWRITER hero subtitle ---- */
(function initTypewriter() {
  const el = document.getElementById('heroTyped');
  const phrases = [
    'Belegarth warrior by day.',
    'Gamer by night.',
    'Ethical hacker always.',
    'Pug dad forever.',
  ];
  let pIdx = 0, cIdx = 0, deleting = false;

  function tick() {
    const current = phrases[pIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++cIdx);
      if (cIdx === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      el.textContent = current.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 40 : 70);
  }
  tick();
})();

/* ---- INTERSECTION OBSERVER for fade-in + skill/game bars ---- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');

    /* Animate skill bars */
    entry.target.querySelectorAll('.skill-fill, .game-fill').forEach(bar => {
      bar.style.width = bar.style.width; // trigger transition
    });

    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ---- COUNTER animation (about stats) ---- */
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 1500;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(ease * target);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: .3 });
const aboutSection = document.getElementById('about');
if (aboutSection) counterObserver.observe(aboutSection);

/* ---- PUG MOOD METER ---- */
(function initMoodMeter() {
  const fill   = document.getElementById('moodFill');
  const thumb  = document.getElementById('moodThumb');
  const label  = document.getElementById('moodLabel');
  if (!fill) return;

  const moods = [
    { pct: 15,  text: 'Too hungry to function.' },
    { pct: 30,  text: 'Needs zoomies ASAP.' },
    { pct: 50,  text: 'Mildly content, requires attention.' },
    { pct: 70,  text: 'Recently pet. Vibrating with joy.' },
    { pct: 90,  text: 'Just ate AND got belly rubs. Peak pug.' },
    { pct: 100, text: 'MAXIMUM GRUMBLE ACHIEVED.' },
  ];

  function setMood(pct) {
    fill.style.width  = pct + '%';
    thumb.style.left  = pct + '%';
    const m = moods.find(m => pct <= m.pct) || moods[moods.length - 1];
    label.textContent = m.text;
  }

  /* Randomize on load, drift every 5s */
  let current = Math.floor(Math.random() * 100);
  const moodObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setMood(current);
      moodObserver.unobserve(e.target);
    });
  }, { threshold: .3 });
  moodObserver.observe(document.getElementById('pugs'));

  setInterval(() => {
    current = Math.max(5, Math.min(100, current + (Math.random() * 20 - 10)));
    setMood(Math.round(current));
  }, 5000);
})();

/* ---- TERMINAL interaction ---- */
(function initTerminal() {
  const input    = document.getElementById('termInput');
  const terminal = document.getElementById('terminal');
  if (!input) return;

  const commands = {
    whoami:   'ethical_hacker // belegarth_warrior // pug_enthusiast',
    help:     'Available: whoami, ls, skills, clear, pug, belegarth, date, banner',
    ls:       'recon/  web-app/  ctf/  social-eng/  networking/',
    'ls skills/': 'recon/  web-app/  ctf/  social-eng/  networking/',
    skills:   'recon | web-app-testing | ctf | social-engineering | networking',
    pug:      '🐾 woof. snort. snort. SNORT. zoomies initiated.',
    belegarth:'⚔️  Realm: [Your Realm] | Weapon: [Your Weapon] | Battles: 47',
    date:     new Date().toUTCString(),
    banner:   '██████╗ ███████╗ █████╗ ██╗     ███╗   ███╗\n██╔══██╗██╔════╝██╔══██╗██║     ████╗ ████║\n██████╔╝█████╗  ███████║██║     ██╔████╔██║\n██╔══██╗██╔══╝  ██╔══██║██║     ██║╚██╔╝██║\n██║  ██║███████╗██║  ██║███████╗██║ ╚═╝ ██║\n╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝',
    clear:    '__CLEAR__',
  };

  function addLine(html, cls = '') {
    const div = document.createElement('div');
    div.className = 't-line' + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    terminal.insertBefore(div, terminal.querySelector('.t-input'));
    terminal.scrollTop = terminal.scrollHeight;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim().toLowerCase();
    input.value = '';
    if (!cmd) return;

    addLine(`<span class="t-prompt">visitor@realm:~$</span> <span class="t-cmd">${escapeHtml(cmd)}</span>`);

    const response = commands[cmd];
    if (response === '__CLEAR__') {
      terminal.querySelectorAll('.t-line:not(.t-input)').forEach(l => l.remove());
    } else if (response) {
      response.split('\n').forEach(line => addLine(escapeHtml(line), 't-out'));
    } else {
      addLine(`bash: ${escapeHtml(cmd)}: command not found. Try <span class="t-cmd">help</span>`, 't-out');
    }
  });

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
})();

/* ---- Active nav link highlight on scroll ---- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav-links a');

  function setActive() {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navAs.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current
        ? 'var(--gold)' : '';
    });
  }
  window.addEventListener('scroll', setActive);
  setActive();
})();
