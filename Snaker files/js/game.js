const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlay-text');

const fxCanvas = document.getElementById('fx-canvas');
const fxCtx = fxCanvas.getContext('2d');

const GRID_SIZE = 20;
const TILES = canvas.width / GRID_SIZE;
const START_SPEED = 130;
const MIN_SPEED = 72;
const MONEY_VALUE = 100;

let snake = [];
let direction = { x: 1, y: 0 };
let queued = { x: 1, y: 0 };
let target;
let score = 0;
let bestScore = Number(localStorage.getItem('snaker-best') || 0);
let speed = START_SPEED;
let running = false;
let loop;

const fxMouse = { x: 0, y: 0, active: false };
const fxParticles = [];
let fxAnimationFrame;
let fxDpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

bestEl.textContent = `Recorde R$ ${bestScore}`;

function resetGame() {
  snake = [
    { x: 12, y: 10 },
    { x: 11, y: 10 },
    { x: 10, y: 10 }
  ];

  direction = { x: 1, y: 0 };
  queued = { x: 1, y: 0 };
  speed = START_SPEED;
  score = 0;
  running = true;

  placeTarget();
  updateHud();
  hideOverlay();

  clearInterval(loop);
  loop = setInterval(tick, speed);
  draw();
}

function tick() {
  direction = queued;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const hitWall = head.x < 0 || head.x >= TILES || head.y < 0 || head.y >= TILES;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    finishGame();
    return;
  }

  snake.unshift(head);

  if (head.x === target.x && head.y === target.y) {
    score += MONEY_VALUE;
    updateHud();
    placeTarget();

    if (speed > MIN_SPEED) {
      speed -= 3;
      clearInterval(loop);
      loop = setInterval(tick, speed);
    }

    gsap.fromTo(
      scoreEl,
      { scale: 1.02, color: '#8ef0c2' },
      { scale: 1, color: '#d9ffe8', duration: 0.24, ease: 'power2.out' }
    );
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paintGrid();
  paintTarget();
  paintSnake();
}

function paintGrid() {
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= TILES; i += 1) {
    const p = i * GRID_SIZE;

    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
}

function paintSnake() {
  snake.forEach((part, i) => {
    const grad = ctx.createLinearGradient(
      part.x * GRID_SIZE,
      part.y * GRID_SIZE,
      part.x * GRID_SIZE + GRID_SIZE,
      part.y * GRID_SIZE + GRID_SIZE
    );

    if (i === 0) {
      grad.addColorStop(0, '#b9ffd7');
      grad.addColorStop(1, '#35d08f');
    } else {
      grad.addColorStop(0, '#5de3a7');
      grad.addColorStop(1, '#1ea56d');
    }

    const padding = 1.4;
    ctx.fillStyle = grad;
    ctx.fillRect(
      part.x * GRID_SIZE + padding,
      part.y * GRID_SIZE + padding,
      GRID_SIZE - padding * 2,
      GRID_SIZE - padding * 2
    );
  });
}

function paintTarget() {
  const x = target.x * GRID_SIZE;
  const y = target.y * GRID_SIZE;

  ctx.fillStyle = '#35d08f';
  roundRect(ctx, x + 2, y + 4, GRID_SIZE - 4, GRID_SIZE - 8, 3, true);

  ctx.strokeStyle = '#1b8259';
  ctx.lineWidth = 1.4;
  roundRect(ctx, x + 2, y + 4, GRID_SIZE - 4, GRID_SIZE - 8, 3, false, true);

  ctx.fillStyle = '#ebffe9';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', x + GRID_SIZE / 2, y + GRID_SIZE / 2 + 0.5);
}

function roundRect(ctxRef, x, y, w, h, r, fill = false, stroke = false) {
  ctxRef.beginPath();
  ctxRef.moveTo(x + r, y);
  ctxRef.arcTo(x + w, y, x + w, y + h, r);
  ctxRef.arcTo(x + w, y + h, x, y + h, r);
  ctxRef.arcTo(x, y + h, x, y, r);
  ctxRef.arcTo(x, y, x + w, y, r);
  ctxRef.closePath();

  if (fill) ctxRef.fill();
  if (stroke) ctxRef.stroke();
}

function placeTarget() {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * TILES),
      y: Math.floor(Math.random() * TILES)
    };

    const overlapsSnake = snake.some((part) => part.x === candidate.x && part.y === candidate.y);

    if (!overlapsSnake) {
      target = candidate;
      return;
    }
  }
}

function updateHud() {
  scoreEl.textContent = `R$ ${score}`;
}

function finishGame() {
  running = false;
  clearInterval(loop);

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('snaker-best', String(bestScore));
    bestEl.textContent = `Recorde R$ ${bestScore}`;
  }

  showOverlay(`Fim de jogo\nTotal cobrado: R$ ${score}\nPressione Espaco para reiniciar`);

  gsap.fromTo(
    '#overlay div',
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
  );
}

function showOverlay(text) {
  overlayText.textContent = text;
  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
}

function hideOverlay() {
  overlay.classList.remove('flex');
  overlay.classList.add('hidden');
}

function setupFxCanvas() {
  fxDpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  fxCanvas.width = Math.floor(window.innerWidth * fxDpr);
  fxCanvas.height = Math.floor(window.innerHeight * fxDpr);
  fxCtx.setTransform(fxDpr, 0, 0, fxDpr, 0, 0);

  const area = window.innerWidth * window.innerHeight;
  const total = Math.max(45, Math.min(120, Math.floor(area / 16500)));

  fxParticles.length = 0;
  for (let i = 0; i < total; i += 1) {
    fxParticles.push(createFxParticle());
  }
}

function createFxParticle() {
  const speed = 0.25 + Math.random() * 0.55;
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    baseRadius: 1 + Math.random() * 1.8,
    pulse: Math.random() * Math.PI * 2
  };
}

function animateFx() {
  fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const interactionRadius = 130;
  const maxLinkDist = 92;

  for (let i = 0; i < fxParticles.length; i += 1) {
    const p = fxParticles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.pulse += 0.02;

    if (p.x < -8) p.x = window.innerWidth + 8;
    if (p.x > window.innerWidth + 8) p.x = -8;
    if (p.y < -8) p.y = window.innerHeight + 8;
    if (p.y > window.innerHeight + 8) p.y = -8;

    if (fxMouse.active) {
      const dx = p.x - fxMouse.x;
      const dy = p.y - fxMouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0 && dist < interactionRadius) {
        const force = (interactionRadius - dist) / interactionRadius;
        const push = force * 0.75;
        p.x += (dx / dist) * push;
        p.y += (dy / dist) * push;
      }
    }

    for (let j = i + 1; j < fxParticles.length; j += 1) {
      const q = fxParticles[j];
      const lx = p.x - q.x;
      const ly = p.y - q.y;
      const dist = Math.hypot(lx, ly);

      if (dist < maxLinkDist) {
        const alpha = (1 - dist / maxLinkDist) * 0.28;
        fxCtx.strokeStyle = `rgba(102, 235, 180, ${alpha.toFixed(3)})`;
        fxCtx.lineWidth = 1;
        fxCtx.beginPath();
        fxCtx.moveTo(p.x, p.y);
        fxCtx.lineTo(q.x, q.y);
        fxCtx.stroke();
      }
    }
  }

  for (let i = 0; i < fxParticles.length; i += 1) {
    const p = fxParticles[i];
    const radius = p.baseRadius + Math.sin(p.pulse) * 0.35;

    fxCtx.fillStyle = 'rgba(169, 252, 215, 0.85)';
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    fxCtx.fill();
  }

  fxAnimationFrame = window.requestAnimationFrame(animateFx);
}

document.addEventListener('mousemove', (e) => {
  fxMouse.x = e.clientX;
  fxMouse.y = e.clientY;
  fxMouse.active = true;
});

document.addEventListener('mouseleave', () => {
  fxMouse.active = false;
});

window.addEventListener('touchmove', (e) => {
  if (!e.touches || e.touches.length === 0) return;
  fxMouse.x = e.touches[0].clientX;
  fxMouse.y = e.touches[0].clientY;
  fxMouse.active = true;
}, { passive: true });

window.addEventListener('touchend', () => {
  fxMouse.active = false;
});

window.addEventListener('resize', () => {
  setupFxCanvas();
});

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  if (key === ' ') {
    if (!running) resetGame();
    return;
  }

  const next =
    key === 'arrowup' || key === 'w'
      ? { x: 0, y: -1 }
      : key === 'arrowdown' || key === 's'
      ? { x: 0, y: 1 }
      : key === 'arrowleft' || key === 'a'
      ? { x: -1, y: 0 }
      : key === 'arrowright' || key === 'd'
      ? { x: 1, y: 0 }
      : null;

  if (!next) return;

  const reverse = next.x === -direction.x && next.y === -direction.y;
  if (!reverse) queued = next;
});

gsap.fromTo(
  '.board-shell, aside, header',
  { y: 16, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
);

setupFxCanvas();
animateFx();
resetGame();
