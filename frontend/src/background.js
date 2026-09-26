/**
 * matex.ai - Celestial Cyber Background Engine
 * Features:
 * - Hypersonic Shooting Stars (Meteors & Fireballs) with glowing ion tails, stardust sparks, & bolide bursts
 * - Authentic Cyber Constellations (Cygnus, Orion, Cassiopeia, Pegasus, MATEX Arch-Shield) with data pulses
 * - Interactive Cursor Gravity & Starlight Tethering
 * - Deep Space Nebulae & 4-Point Diamond Stellar Diffraction Spikes
 * - Interactive Cosmic Clicks & Meteor Shower Storm Mode
 * - Dynamic Theme Color Integration (Cyan, Matrix, Crimson, Violet, Amber, Sapphire, Pitch Black, High Contrast)
 */

class ShootingStar {
  constructor(canvasWidth, canvasHeight, colors, options = {}) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.colors = colors;
    this.active = true;

    // Angle of entry (typically diagonal downwards, 25 to 55 degrees)
    this.angle = options.angle !== undefined ? options.angle : (Math.PI / 4) + (Math.random() - 0.5) * 0.35;
    
    // Direction: mostly left-to-right (cos > 0) or occasionally right-to-left
    const dir = options.direction || (Math.random() > 0.25 ? 1 : -1);
    this.vx = Math.cos(this.angle) * (dir === 1 ? 1 : -1);
    this.vy = Math.sin(this.angle);

    // Speed: hypersonic cosmic velocity (20 to 34 px/frame)
    this.speed = options.speed || (Math.random() * 14 + 20);
    this.vx *= this.speed;
    this.vy *= this.speed;

    // Spawn origin: top perimeter or upper side
    if (dir === 1) {
      this.x = options.startX !== undefined ? options.startX : Math.random() * (this.width * 0.7);
      this.y = options.startY !== undefined ? options.startY : -30 - Math.random() * 80;
    } else {
      this.x = options.startX !== undefined ? options.startX : this.width * 0.3 + Math.random() * (this.width * 0.7);
      this.y = options.startY !== undefined ? options.startY : -30 - Math.random() * 80;
    }

    // Visual attributes: long luminous tail
    this.length = options.length || (Math.random() * 140 + 220); // 220px to 360px tail
    this.thickness = options.thickness || (Math.random() * 2.2 + 2.0);
    this.opacity = 1.0;
    this.fadeSpeed = Math.random() * 0.014 + 0.011;
    this.isFireball = options.isFireball !== undefined ? options.isFireball : Math.random() < 0.25; // 25% are bright fireballs

    // Sparks trailing behind
    this.sparks = [];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Spawn trailing glowing sparks for fireballs
    if (this.isFireball && Math.random() < 0.65 && this.opacity > 0.15) {
      this.sparks.push({
        x: this.x - this.vx * 0.15 + (Math.random() - 0.5) * 6,
        y: this.y - this.vy * 0.15 + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8 + 0.4,
        radius: Math.random() * 1.8 + 0.8,
        alpha: 1.0,
        decay: Math.random() * 0.035 + 0.025
      });
    }

    // Update existing sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= s.decay;
      if (s.alpha <= 0) {
        this.sparks.splice(i, 1);
      }
    }

    // Fade out as it traverses
    this.opacity -= this.fadeSpeed;

    // Boundary check
    if (this.x < -120 || this.x > this.width + 120 || this.y > this.height + 120 || this.opacity <= 0) {
      // If it was a fireball, trigger a brief micro-burst when it burns out
      if (this.isFireball && this.sparks.length < 8 && this.opacity <= 0) {
        for (let k = 0; k < 6; k++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = Math.random() * 2.5 + 1.0;
          this.sparks.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            radius: Math.random() * 1.8 + 1.0,
            alpha: 1.0,
            decay: 0.045
          });
        }
        this.isFireball = false; // Prevent looping burst
      }

      if (this.sparks.length === 0) {
        this.active = false;
      }
    }
  }

  draw(ctx) {
    // 1. Draw trailing stardust sparks
    for (const s of this.sparks) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.colors.rgb}, ${s.alpha * 0.9})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.colors.hex;
      ctx.fill();
      ctx.restore();
    }

    if (this.opacity <= 0) return;

    ctx.save();

    // 2. Draw Shooting Star Glowing Ion Trail
    const tailDist = this.length;
    const hyp = Math.hypot(this.vx, this.vy) || 1;
    const tailX = this.x - (this.vx / hyp) * tailDist;
    const tailY = this.y - (this.vy / hyp) * tailDist;

    const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
    // Incandescent head
    grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
    grad.addColorStop(0.08, `rgba(255, 255, 255, ${this.opacity * 0.95})`);
    // Luminous theme color
    grad.addColorStop(0.25, `rgba(${this.colors.rgb}, ${this.opacity * 0.9})`);
    // Soft ion glow
    grad.addColorStop(0.65, `rgba(${this.colors.rgb}, ${this.opacity * 0.4})`);
    // Tapering fade
    grad.addColorStop(1, `rgba(${this.colors.rgb}, 0)`);

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(tailX, tailY);
    ctx.strokeStyle = grad;
    ctx.lineWidth = this.isFireball ? this.thickness * 1.5 : this.thickness;
    ctx.lineCap = 'round';
    ctx.shadowBlur = this.isFireball ? 24 : 14;
    ctx.shadowColor = this.colors.hex;
    ctx.stroke();

    // 3. Draw Incandescent Head Glow (Outer Corona + White Core)
    // Outer Corona
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness * 2.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.colors.rgb}, ${this.opacity * 0.6})`;
    ctx.shadowBlur = 18;
    ctx.shadowColor = this.colors.hex;
    ctx.fill();

    // Inner White Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#ffffff';
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Real Cyber Constellations with Geometric Asterisms
 */
class ConstellationSystem {
  constructor(canvasWidth, canvasHeight) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.constellations = [];
    this.pulses = []; // Light pulses traveling along edges
    this.showLabels = true;
    this.buildConstellations();
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.buildConstellations();
  }

  buildConstellations() {
    this.constellations = [];
    this.pulses = [];

    // Distinct constellation templates relative to center
    const templates = [
      {
        name: 'CYGNUS-SOC',
        label: '// CYGNUS-SOC',
        scale: 0.9,
        nodes: [
          { x: 0, y: 0, name: 'Sadr', major: true },
          { x: 0, y: -75, name: 'Deneb', major: true },
          { x: 0, y: 85, name: 'Albireo', major: false },
          { x: -70, y: -10, name: 'Gienah', major: false },
          { x: 70, y: -10, name: 'Delta Cyg', major: false }
        ],
        edges: [
          [0, 1], [0, 2], [0, 3], [0, 4]
        ]
      },
      {
        name: 'ORION-CORE',
        label: '// ORION-DEFENSE',
        scale: 0.85,
        nodes: [
          { x: -50, y: -65, name: 'Betelgeuse', major: true },
          { x: 50, y: -65, name: 'Bellatrix', major: false },
          { x: 55, y: 70, name: 'Rigel', major: true },
          { x: -50, y: 70, name: 'Saiph', major: false },
          { x: -22, y: 2, name: 'Alnitak', major: false },
          { x: 0, y: 0, name: 'Alnilam', major: false },
          { x: 22, y: -2, name: 'Mintaka', major: false }
        ],
        edges: [
          [0, 4], [1, 6], [4, 5], [5, 6], [4, 3], [6, 2], [0, 1], [3, 2]
        ]
      },
      {
        name: 'CASSIOPEIA',
        label: '// CASSIOPEIA-SEC',
        scale: 0.85,
        nodes: [
          { x: -65, y: 20, name: 'Schedar', major: true },
          { x: -32, y: -30, name: 'Caph', major: false },
          { x: 0, y: 12, name: 'Gamma Cas', major: true },
          { x: 38, y: -28, name: 'Ruchbah', major: false },
          { x: 68, y: 16, name: 'Segin', major: false }
        ],
        edges: [
          [0, 1], [1, 2], [2, 3], [3, 4]
        ]
      },
      {
        name: 'PEGASUS-NET',
        label: '// PEGASUS-IOC',
        scale: 0.8,
        nodes: [
          { x: -50, y: 50, name: 'Markab', major: true },
          { x: -50, y: -50, name: 'Scheat', major: false },
          { x: 50, y: -50, name: 'Alpheratz', major: true },
          { x: 50, y: 50, name: 'Algenib', major: false },
          { x: -95, y: 80, name: 'Enif', major: false }
        ],
        edges: [
          [0, 1], [1, 2], [2, 3], [3, 0], [0, 4]
        ]
      },
      {
        name: 'MATEX-SHIELD',
        label: '// MATEX-ARCH',
        scale: 0.9,
        nodes: [
          { x: 0, y: -65, name: 'Apex', major: true },
          { x: -45, y: -30, name: 'WingL', major: false },
          { x: 45, y: -30, name: 'WingR', major: false },
          { x: -55, y: 18, name: 'FlankL', major: true },
          { x: 55, y: 18, name: 'FlankR', major: true },
          { x: 0, y: 10, name: 'ArchBridge', major: true },
          { x: 0, y: 72, name: 'ShieldKeel', major: true }
        ],
        edges: [
          [0, 1], [0, 2], [1, 3], [2, 4], [3, 6], [4, 6], [1, 5], [2, 5], [5, 6]
        ]
      }
    ];

    // Place constellations in distinct screen quadrants
    const placements = [
      { cx: this.width * 0.22, cy: this.height * 0.28, vx: 0.04, vy: 0.02 },
      { cx: this.width * 0.80, cy: this.height * 0.32, vx: -0.03, vy: 0.02 },
      { cx: this.width * 0.20, cy: this.height * 0.75, vx: 0.02, vy: -0.03 },
      { cx: this.width * 0.82, cy: this.height * 0.78, vx: -0.03, vy: -0.02 },
      { cx: this.width * 0.52, cy: this.height * 0.50, vx: 0.01, vy: 0.015 }
    ];

    for (let i = 0; i < templates.length; i++) {
      const tmpl = templates[i];
      const pos = placements[i % placements.length];
      const scale = (this.width < 800 ? 0.65 : 1.0) * tmpl.scale;

      const instNodes = tmpl.nodes.map(n => ({
        relX: n.x * scale,
        relY: n.y * scale,
        x: pos.cx + n.x * scale,
        y: pos.cy + n.y * scale,
        major: n.major,
        name: n.name,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.02
      }));

      this.constellations.push({
        name: tmpl.name,
        label: tmpl.label,
        cx: pos.cx,
        cy: pos.cy,
        vx: pos.vx,
        vy: pos.vy,
        nodes: instNodes,
        edges: tmpl.edges,
        scale,
        labelAlpha: 0.45
      });
    }
  }

  update(nowSec) {
    // Slowly drift constellations across the cosmic plane
    for (const c of this.constellations) {
      c.cx += c.vx;
      c.cy += c.vy;

      // Gentle bounds bounce
      if (c.cx < this.width * 0.1 || c.cx > this.width * 0.9) c.vx *= -1;
      if (c.cy < this.height * 0.15 || c.cy > this.height * 0.88) c.vy *= -1;

      for (const node of c.nodes) {
        node.x = c.cx + node.relX;
        node.y = c.cy + node.relY;
      }
    }

    // Spawn cyber starlight pulses along constellation edges
    if (Math.random() < 0.035 && this.constellations.length > 0) {
      const c = this.constellations[Math.floor(Math.random() * this.constellations.length)];
      if (c.edges.length > 0) {
        const edge = c.edges[Math.floor(Math.random() * c.edges.length)];
        this.pulses.push({
          constellation: c,
          fromIdx: edge[0],
          toIdx: edge[1],
          progress: 0,
          speed: Math.random() * 0.015 + 0.012
        });
      }
    }

    // Update pulses
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.progress += p.speed;
      if (p.progress >= 1.0) {
        this.pulses.splice(i, 1);
      }
    }
  }

  draw(ctx, colors, nowSec) {
    ctx.save();

    for (const c of this.constellations) {
      // 1. Draw constellation lines
      for (const edge of c.edges) {
        const n1 = c.nodes[edge[0]];
        const n2 = c.nodes[edge[1]];
        if (!n1 || !n2) continue;

        const pulse = (Math.sin(nowSec * 1.6 + n1.twinkleOffset) + 1) * 0.5;
        const lineAlpha = (colors.lineOpacity * 1.4) + (pulse * 0.08);

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = `rgba(${colors.rgb}, ${lineAlpha})`;
        ctx.lineWidth = n1.major || n2.major ? 1.2 : 0.8;
        ctx.stroke();
      }

      // 2. Draw active cyber pulses traveling across edges
      for (const p of this.pulses) {
        if (p.constellation === c) {
          const n1 = c.nodes[p.fromIdx];
          const n2 = c.nodes[p.toIdx];
          if (n1 && n2) {
            const px = n1.x + (n2.x - n1.x) * p.progress;
            const py = n1.y + (n2.y - n1.y) * p.progress;
            
            ctx.beginPath();
            ctx.arc(px, py, 2.4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.hex;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // 3. Draw constellation stars
      for (const node of c.nodes) {
        const twinkle = Math.sin(nowSec * node.twinkleSpeed * 50 + node.twinkleOffset) * 0.45;
        const radius = node.major ? 2.8 + twinkle : 1.6 + twinkle * 0.6;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.major ? '#ffffff' : `rgba(${colors.rgb}, 0.9)`;
        ctx.shadowBlur = node.major ? 14 : 7;
        ctx.shadowColor = colors.hex;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 4-point diamond starlight sparkle on major anchor stars
        if (node.major) {
          const sparkle = (Math.sin(nowSec * 2.8 + node.twinkleOffset) + 1) * 0.5;
          if (sparkle > 0.3) {
            this.drawDiamondSparkle(ctx, node.x, node.y, radius * 1.1, colors.rgb, sparkle * 0.7);
          }
        }
      }

      // 4. Subtle Constellation Monospace Cyber Label
      if (this.showLabels) {
        ctx.save();
        ctx.font = '10px Consolas, Courier New, monospace';
        ctx.fillStyle = `rgba(${colors.rgb}, ${c.labelAlpha * 0.65})`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 6;
        ctx.shadowColor = colors.hex;
        ctx.fillText(c.label, c.cx, c.cy + (c.scale * 60) + 24);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  drawDiamondSparkle(ctx, x, y, size, colorRgb, alpha) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - size * 3.5, y);
    ctx.lineTo(x + size * 3.5, y);
    ctx.moveTo(x, y - size * 3.5);
    ctx.lineTo(x, y + size * 3.5);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y - size * 1.5);
    ctx.lineTo(x + size * 1.5, y);
    ctx.lineTo(x, y + size * 1.5);
    ctx.lineTo(x - size * 1.5, y);
    ctx.closePath();
    ctx.fillStyle = `rgba(${colorRgb}, ${alpha})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.fill();
    ctx.restore();
  }
}

class CyberBackground {
  constructor(canvasId = 'bg-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      document.body.prepend(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');

    // Constellation System & ambient background stars
    this.constellationSystem = null;
    this.ambientStars = [];
    this.nebulaCenters = [];
    
    // Dynamic Shooting Stars / Meteors
    this.shootingStars = [];
    this.nextShootingStarTime = 0;
    this.meteorShowerActive = false;
    this.meteorFrequency = 'normal'; // 'normal', 'shower', 'low'

    // Interactive Particles & Ripples
    this.particles = [];
    this.ripples = [];
    this.mouse = { x: -1000, y: -1000, isHovering: false };
    this.theme = 'cyan';
    this.animationFrameId = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Mouse celestial tracking
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.isHovering = true;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.isHovering = false;
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    // Click effect: expanding celestial ripple & trigger cosmic star streak
    window.addEventListener('click', (e) => {
      this.triggerClickEffect(e.clientX, e.clientY);
    });

    this.scheduleNextShootingStar();
    this.animate();
  }

  setTheme(themeName) {
    this.theme = themeName;
  }

  setMeteorFrequency(freq) {
    this.meteorFrequency = freq;
    if (freq === 'shower') {
      this.triggerMeteorShower();
    }
  }

  toggleConstellationLabels(show) {
    if (this.constellationSystem) {
      this.constellationSystem.showLabels = show;
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);

    // Dynamic density scaling
    let ambientCount = this.width < 768 ? 90 : (this.width < 1400 ? 150 : 220);

    // Initialize/resize constellation system
    if (!this.constellationSystem) {
      this.constellationSystem = new ConstellationSystem(this.width, this.height);
    } else {
      this.constellationSystem.resize(this.width, this.height);
    }

    // Ambient Deep-Space Stars
    this.ambientStars = [];
    for (let i = 0; i < ambientCount; i++) {
      this.ambientStars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.3 + 0.4,
        alpha: Math.random() * 0.65 + 0.25,
        twinkleSpeed: Math.random() * 0.025 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        isBlueGiant: Math.random() < 0.08
      });
    }

    // Nebula cosmic gas clouds
    this.nebulaCenters = [
      { x: this.width * 0.2, y: this.height * 0.25, r: 350, alpha: 0.045 },
      { x: this.width * 0.78, y: this.height * 0.35, r: 420, alpha: 0.05 },
      { x: this.width * 0.45, y: this.height * 0.75, r: 380, alpha: 0.04 }
    ];
  }

  scheduleNextShootingStar() {
    let delay = 1800 + Math.random() * 2200; // Average 1.8 to 4.0 seconds (very active!)
    if (this.meteorFrequency === 'shower') {
      delay = 500 + Math.random() * 900; // Rapid meteor shower
    } else if (this.meteorFrequency === 'low') {
      delay = 4500 + Math.random() * 5000;
    }
    this.nextShootingStarTime = performance.now() + delay;
  }

  spawnShootingStar(options = {}) {
    const colors = this.getThemeColors();
    this.shootingStars.push(new ShootingStar(this.width, this.height, colors, options));
  }

  triggerMeteorShower() {
    // Spawn 6 to 9 shooting stars staggered rapidly across the sky
    const count = 7;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.spawnShootingStar({
          speed: Math.random() * 10 + 22,
          length: Math.random() * 150 + 240,
          isFireball: i % 2 === 0
        });
      }, i * 190 + Math.random() * 90);
    }
  }

  getThemeColors() {
    switch (this.theme) {
      case 'matrix':
        return {
          rgb: '0, 255, 102',
          hex: '#00ff66',
          hexAlt: '#4dff99',
          lineOpacity: 0.22
        };
      case 'crimson':
        return {
          rgb: '255, 42, 95',
          hex: '#ff2a5f',
          hexAlt: '#ff6b8b',
          lineOpacity: 0.22
        };
      case 'violet':
        return {
          rgb: '176, 38, 255',
          hex: '#b026ff',
          hexAlt: '#d279ff',
          lineOpacity: 0.24
        };
      case 'amber':
        return {
          rgb: '255, 183, 3',
          hex: '#ffb703',
          hexAlt: '#ffd166',
          lineOpacity: 0.22
        };
      case 'sapphire':
        return {
          rgb: '45, 127, 249',
          hex: '#2d7ff9',
          hexAlt: '#68a4ff',
          lineOpacity: 0.24
        };
      case 'high-contrast':
        return {
          rgb: '0, 255, 210',
          hex: '#00ffd5',
          hexAlt: '#38ffdf',
          lineOpacity: 0.32
        };
      case 'pitch-black':
        return {
          rgb: '0, 220, 255',
          hex: '#00f0ff',
          hexAlt: '#00d0ee',
          lineOpacity: 0.18
        };
      case 'cyan':
      default:
        return {
          rgb: '0, 240, 255',
          hex: '#00f0ff',
          hexAlt: '#00ffd5',
          lineOpacity: 0.22
        };
    }
  }

  triggerClickEffect(x, y) {
    const now = performance.now();
    if (this._lastClickTime && now - this._lastClickTime < 90) return;
    this._lastClickTime = now;

    const colors = this.getThemeColors();

    // 1. Expanding celestial beacon ripple
    this.ripples.push({
      x,
      y,
      radius: 6,
      maxRadius: 210 + Math.random() * 45,
      opacity: 1.0,
      speed: 4.8,
      colorRgb: colors.rgb,
      colorHex: colors.hex
    });

    // 2. Cosmic particle spark burst
    const count = 22;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 4.8 + 2.4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.2 + 1.2,
        alpha: 1.0,
        decay: Math.random() * 0.025 + 0.016,
        color: Math.random() > 0.3 ? colors.hex : '#ffffff'
      });
    }

    // 3. Summon an instant Shooting Star heading across that sky coordinate!
    setTimeout(() => {
      this.spawnShootingStar({
        startX: Math.max(0, x - (Math.random() * 220 + 120)),
        startY: Math.max(-60, y - (Math.random() * 320 + 180)),
        speed: Math.random() * 8 + 22,
        isFireball: Math.random() < 0.4
      });
    }, 70);
  }

  drawNebulae(colors, nowSec) {
    for (const neb of this.nebulaCenters) {
      const pulse = Math.sin(nowSec * 0.4 + neb.x) * 0.012;
      const currentAlpha = Math.max(0.01, neb.alpha + pulse);

      const grad = this.ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
      grad.addColorStop(0, `rgba(${colors.rgb}, ${currentAlpha})`);
      grad.addColorStop(0.5, `rgba(${colors.rgb}, ${currentAlpha * 0.45})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(neb.x, neb.y, neb.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const nowSec = performance.now() * 0.001;
    const nowMs = performance.now();
    const colors = this.getThemeColors();

    // Check automatic Shooting Star spawn timer
    if (nowMs >= this.nextShootingStarTime) {
      this.spawnShootingStar();
      // 22% chance of a twin shooting star blazing in tandem!
      if (Math.random() < 0.22) {
        setTimeout(() => this.spawnShootingStar(), 160 + Math.random() * 240);
      }
      this.scheduleNextShootingStar();
    }

    // =======================================================================
    // 1. DRAW DEEP SPACE NEBULA CLOUDS
    // =======================================================================
    this.drawNebulae(colors, nowSec);

    // =======================================================================
    // 2. DRAW AMBIENT DISTANT STARS (Twinkling Cosmos)
    // =======================================================================
    for (const aStar of this.ambientStars) {
      const twinkle = Math.sin(nowSec * 2.0 + aStar.twinklePhase) * 0.35;
      const currentAlpha = Math.max(0.12, Math.min(1.0, aStar.alpha + twinkle));

      this.ctx.beginPath();
      this.ctx.arc(aStar.x, aStar.y, aStar.radius, 0, Math.PI * 2);
      if (aStar.isBlueGiant) {
        this.ctx.fillStyle = `rgba(${colors.rgb}, ${currentAlpha * 0.9})`;
      } else {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.8})`;
      }
      this.ctx.fill();
    }

    // =======================================================================
    // 3. UPDATE & DRAW CYBER CONSTELLATIONS
    // =======================================================================
    if (this.constellationSystem) {
      this.constellationSystem.update(nowSec);
      this.constellationSystem.draw(this.ctx, colors, nowSec);
    }

    // =======================================================================
    // 4. DRAW INTERACTIVE CONSTELLATION CURSOR TETHERS
    // =======================================================================
    if (this.mouse.isHovering && this.constellationSystem) {
      let connected = 0;
      for (const c of this.constellationSystem.constellations) {
        for (const star of c.nodes) {
          const mDist = Math.hypot(this.mouse.x - star.x, this.mouse.y - star.y);
          if (mDist < 190) {
            const lineAlpha = (1 - mDist / 190) * 0.42;
            this.ctx.beginPath();
            this.ctx.moveTo(this.mouse.x, this.mouse.y);
            this.ctx.lineTo(star.x, star.y);
            this.ctx.strokeStyle = `rgba(${colors.rgb}, ${lineAlpha})`;
            this.ctx.lineWidth = 1.1;
            this.ctx.stroke();

            connected++;
            if (connected >= 6) break;
          }
        }
        if (connected >= 6) break;
      }

      // Celestial reticle around cursor
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 4.5, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = colors.hex;
      this.ctx.fill();

      // Outer focus ring
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 14 + Math.sin(nowSec * 4) * 2, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(${colors.rgb}, 0.35)`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // =======================================================================
    // 5. UPDATE & DRAW ACTIVE SHOOTING STARS
    // =======================================================================
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const shootingStar = this.shootingStars[i];
      shootingStar.update();
      shootingStar.draw(this.ctx);

      if (!shootingStar.active) {
        this.shootingStars.splice(i, 1);
      }
    }

    // =======================================================================
    // 6. DRAW & UPDATE CELESTIAL BEACON RIPPLES
    // =======================================================================
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += r.speed;
      r.opacity -= 0.022;

      if (r.opacity <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(${r.colorRgb || colors.rgb}, ${r.opacity})`;
      this.ctx.lineWidth = 2.0;
      this.ctx.shadowBlur = 14;
      this.ctx.shadowColor = r.colorHex || colors.hex;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    // =======================================================================
    // 7. DRAW & UPDATE PARTICLES
    // =======================================================================
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
      this.ctx.shadowBlur = 0;
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

// Auto-initialize background on DOMContentLoaded or immediately
if (typeof window !== 'undefined') {
  let cyberBgInstance = null;
  const startBg = () => {
    if (!cyberBgInstance) {
      cyberBgInstance = new CyberBackground('bg-canvas');
      window.matexBackground = cyberBgInstance;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startBg);
  } else {
    startBg();
  }
}

export default CyberBackground;
