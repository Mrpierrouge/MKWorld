/**
 * Petit effet confetti en canvas — équivalent simplifié de Konfetti (MainScreen.kt).
 * Deux jets, un de chaque coin bas de l'écran, comme les `Party` `partyLeft` / `partyRight`.
 */

const CONFETTI_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

function fireConfetti() {
  const canvas = h('canvas', { class: 'confetti-canvas' });
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function makeParticle(fromLeft) {
    const angleDeg = fromLeft ? 300 : 240; // Position.Relative(0, 0.6) / (1, 0.6)
    const spread = 10;
    const angle = ((angleDeg + (Math.random() * spread * 2 - spread)) * Math.PI) / 180;
    const speed = 40 + Math.random() * 60; // speed..maxSpeed
    return {
      x: fromLeft ? 0 : canvas.width,
      y: canvas.height * 0.6,
      vx: Math.cos(angle) * speed * 0.06,
      vy: -Math.sin(angle) * speed * 0.06,
      color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
      size: 5 + Math.random() * 4,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: 80 + Math.random() * 40,
    };
  }

  let particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push(makeParticle(true));
    particles.push(makeParticle(false));
  }

  let running = true;
  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.vy += 0.12; // gravité
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life += 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });
    particles = particles.filter((p) => p.life < p.maxLife && p.y < canvas.height + 40);

    if (particles.length > 0) {
      requestAnimationFrame(step);
    } else {
      cleanup();
    }
  }

  function cleanup() {
    running = false;
    window.removeEventListener('resize', resize);
    canvas.remove();
  }

  requestAnimationFrame(step);
  setTimeout(cleanup, 4000); // garde-fou
}
