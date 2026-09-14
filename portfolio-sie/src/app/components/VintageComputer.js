'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Scripted session that plays until the visitor starts typing
const SESSION = [
  { text: 'last login: ttys001', dim: true },
  { text: '~ $ whoami', prompt: true },
  { text: 'muhammad baasil' },
  { text: 'backend engineer' },
  { text: '~ $ cat now.txt', prompt: true },
  { text: 'dubizzle labs' },
  { text: 'zameen + bayut' },
  { text: '~ $ try typing', prompt: true },
  { text: "type 'help' :)", dim: true },
];

const COMMANDS = {
  help: ['whoami  work  stack', 'contact  clear  sudo'],
  whoami: ['muhammad baasil', 'backend engineer', 'lahore, pakistan'],
  work: ['assoc. SE @ dubizzle', 'devops @ axonbuild', 'ai intern @ bookme'],
  stack: ['node  ts  python', 'mysql  mongo  rag'],
  contact: ['baaasil6@gmail.com'],
  sudo: ['nice try.'],
  ls: ['resume.pdf  secrets/'],
  hello: ['hi there!'],
  hi: ['hello!'],
};

const KEY_ROWS = ['`1234567890-=', 'qwertyuiop[]\\', "asdfghjkl;'\n", 'zxcvbnm,./ '];
const MAX_COLS = 22;
const MAX_LINES = 7;

// Screen texture resolution. Text is laid out on a 1024x784 grid and scaled down,
// which keeps it crisp on the tube while uploading ~44% fewer pixels per frame.
const TEX_W = 768, TEX_H = 588, TEX_SCALE = TEX_W / 1024;

// Camera offset from the look target, tuned for a square-ish canvas. Narrower
// canvases push the camera back so the keyboard and mouse always fit.
const CAMERA_OFFSET = new THREE.Vector3(4.0, 1.95, 9.2);
const REF_ASPECT = 1.0;

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function makeLayer(paint) {
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  const g = c.getContext('2d');
  g.scale(TEX_SCALE, TEX_SCALE);
  paint(g, 1024, 784);
  return c;
}

export default function VintageComputer() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || mount.children.length > 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const lookTarget = new THREE.Vector3(0.25, 1.4, 0.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Shadows are refreshed manually every other frame
    renderer.shadowMap.autoUpdate = false;
    mount.appendChild(renderer.domElement);

    const fit = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      const aspect = w / h;
      camera.aspect = aspect;
      camera.position.copy(lookTarget).addScaledVector(CAMERA_OFFSET, Math.max(1, REF_ASPECT / aspect));
      camera.lookAt(lookTarget);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    fit();

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.environment = envTexture;
    scene.environmentIntensity = 0.35;

    const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
    key.position.set(5, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
    key.shadow.radius = 6;
    key.shadow.bias = -0.0005;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x6f93c9, 2.4);
    rim.position.set(-6, 4, -5);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight(0x8aa4c8, 0x0a0c10, 0.35));

    const computer = new THREE.Group();
    scene.add(computer);

    // ---------- Materials ----------
    // Standard (not Physical) materials: the clearcoat lobe was a second full
    // specular pass per pixel for a barely visible sheen.
    const plastic = new THREE.MeshStandardMaterial({ color: 0xcfc5b1, roughness: 0.55 });
    const plasticDark = new THREE.MeshStandardMaterial({ color: 0xb4aa95, roughness: 0.7 });
    const blackPlastic = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.85 });
    const groove = new THREE.MeshStandardMaterial({ color: 0x3a3630, roughness: 0.9 });
    const keycap = new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.45 });
    const keycapDark = new THREE.MeshStandardMaterial({ color: 0x9d9383, roughness: 0.55 });

    // ---------- Case ----------
    const CASE_W = 2.6, CASE_H = 3.1, CASE_D = 2.6;
    const caseMesh = new THREE.Mesh(new RoundedBoxGeometry(CASE_W, CASE_H, CASE_D, 6, 0.14), plastic);
    caseMesh.position.set(0, 0.25 + CASE_H / 2, 0);
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    computer.add(caseMesh);

    const foot = new THREE.Mesh(new RoundedBoxGeometry(2.4, 0.28, 2.4, 3, 0.08), plasticDark);
    foot.position.set(0, 0.14, 0);
    foot.castShadow = true;
    computer.add(foot);

    const FRONT_Z = CASE_D / 2;
    const SCREEN_Y = 2.32;
    const SCREEN_W = 1.96, SCREEN_H = 1.5;

    const bezelShape = roundedRectShape(2.3, 1.86, 0.13);
    bezelShape.holes.push(roundedRectShape(SCREEN_W + 0.04, SCREEN_H + 0.04, 0.1));
    const bezel = new THREE.Mesh(
      new THREE.ExtrudeGeometry(bezelShape, {
        depth: 0.02, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 3, curveSegments: 10,
      }),
      plasticDark
    );
    bezel.position.set(0, SCREEN_Y, FRONT_Z - 0.01);
    computer.add(bezel);

    const cavity = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W + 0.08, SCREEN_H + 0.08), blackPlastic);
    cavity.position.set(0, SCREEN_Y, FRONT_Z + 0.005);
    computer.add(cavity);

    // ---------- CRT screen ----------
    const canvas = document.createElement('canvas');
    canvas.width = TEX_W;
    canvas.height = TEX_H;
    const ctx = canvas.getContext('2d');
    const screenTexture = new THREE.CanvasTexture(canvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.generateMipmaps = false;
    screenTexture.minFilter = THREE.LinearFilter;

    const screenGeo = new THREE.PlaneGeometry(SCREEN_W, SCREEN_H, 24, 18);
    const pos = screenGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const nx = pos.getX(i) / (SCREEN_W / 2);
      const ny = pos.getY(i) / (SCREEN_H / 2);
      pos.setZ(i, 0.06 * (1 - 0.5 * nx * nx - 0.5 * ny * ny));
    }
    screenGeo.computeVertexNormals();

    const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false }));
    screen.position.set(0, SCREEN_Y, FRONT_Z + 0.01);
    computer.add(screen);

    const glass = new THREE.Mesh(
      screenGeo,
      new THREE.MeshStandardMaterial({
        color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.07, envMapIntensity: 2.5, depthWrite: false,
      })
    );
    glass.position.set(0, SCREEN_Y, FRONT_Z + 0.014);
    computer.add(glass);

    const glow = new THREE.PointLight(0x7dffb2, 0, 5, 2);
    glow.position.set(0, SCREEN_Y, FRONT_Z + 0.6);
    computer.add(glow);

    // ---------- Front details ----------
    const slot = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.06, 0.06, 2, 0.02), blackPlastic);
    slot.position.set(0.5, 0.92, FRONT_Z);
    computer.add(slot);

    const led = new THREE.Mesh(
      new THREE.CircleGeometry(0.02, 12),
      new THREE.MeshBasicMaterial({ color: 0x6dff9a, toneMapped: false })
    );
    led.position.set(-0.9, 0.9, FRONT_Z + 0.012);
    computer.add(led);

    const chin = new THREE.Mesh(new THREE.BoxGeometry(CASE_W - 0.3, 0.012, 0.01), groove);
    chin.position.set(0, 0.5, FRONT_Z + 0.002);
    computer.add(chin);

    // Side vents as one instanced draw call
    const vents = new THREE.InstancedMesh(new THREE.BoxGeometry(0.01, 0.03, 1.2), groove, 24);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < 12; i++) {
      vents.setMatrixAt(i * 2, m4.makeTranslation(-(CASE_W / 2 + 0.001), 2.8 - i * 0.08, -0.3));
      vents.setMatrixAt(i * 2 + 1, m4.makeTranslation(CASE_W / 2 + 0.001, 2.8 - i * 0.08, -0.3));
    }
    computer.add(vents);

    // ---------- Keyboard ----------
    const keyboard = new THREE.Group();
    keyboard.position.set(0, 0, 2.55);
    keyboard.rotation.x = 0.06;
    computer.add(keyboard);

    const kbBase = new THREE.Mesh(new RoundedBoxGeometry(2.7, 0.16, 1.0, 3, 0.06), plastic);
    kbBase.position.y = 0.08;
    kbBase.castShadow = true;
    kbBase.receiveShadow = true;
    keyboard.add(kbBase);

    const kbWell = new THREE.Mesh(new RoundedBoxGeometry(2.52, 0.04, 0.84, 2, 0.02), groove);
    kbWell.position.y = 0.155;
    keyboard.add(kbWell);

    // Keys: two instanced meshes (light and dark caps) instead of ~50 separate draw calls
    const KEY = 0.17, GAP = 0.19, KEY_Y = 0.21;
    const keyGeo = new RoundedBoxGeometry(KEY, 0.08, KEY, 2, 0.03);
    const layout = [];
    KEY_ROWS.forEach((chars, r) => {
      const offset = [0, 0.06, 0.1, 0.16][r];
      [...chars].forEach((ch, i) => {
        layout.push({
          ch,
          dark: i === 0 || i === chars.length - 1,
          x: -1.14 + offset + i * GAP,
          z: -0.32 + r * GAP,
        });
      });
    });
    const lightKeys = new THREE.InstancedMesh(keyGeo, keycap, layout.filter((k) => !k.dark).length);
    const darkKeys = new THREE.InstancedMesh(keyGeo, keycapDark, layout.filter((k) => k.dark).length);
    const keyMap = {};
    const allKeys = [];
    let li = 0, di = 0;
    layout.forEach((k) => {
      const entry = { mesh: k.dark ? darkKeys : lightKeys, index: k.dark ? di++ : li++, x: k.x, z: k.z, press: 0 };
      entry.mesh.setMatrixAt(entry.index, m4.makeTranslation(k.x, KEY_Y, k.z));
      keyMap[k.ch] = entry;
      allKeys.push(entry);
    });
    lightKeys.receiveShadow = true;
    keyboard.add(lightKeys, darkKeys);

    const spacebar = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.08, KEY, 2, 0.03), keycap);
    spacebar.position.set(0, KEY_Y, -0.32 + 4 * GAP);
    keyboard.add(spacebar);
    const spaceEntry = { mesh: null, press: 0 };
    keyMap[' '] = spaceEntry;
    allKeys.push(spaceEntry);

    let keysMoving = false;
    const pressKey = (ch) => {
      const k = keyMap[ch.toLowerCase()] || allKeys[Math.floor(Math.random() * allKeys.length)];
      k.press = 1;
      keysMoving = true;
    };

    const updateKeys = () => {
      if (!keysMoving) return;
      let still = true;
      allKeys.forEach((k) => {
        if (k.press < 0.002) {
          if (k.press !== 0) k.press = 0;
          else return;
        }
        k.press *= 0.82;
        still = false;
        const y = KEY_Y - k.press * 0.05;
        if (k.mesh) {
          k.mesh.setMatrixAt(k.index, m4.makeTranslation(k.x, y, k.z));
          k.mesh.instanceMatrix.needsUpdate = true;
        } else {
          spacebar.position.y = y;
        }
      });
      if (still) keysMoving = false;
    };

    // ---------- Mouse + cable ----------
    const mouseMesh = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.15, 0.6, 3, 0.07), plastic);
    mouseMesh.position.set(1.95, 0.075, 2.6);
    mouseMesh.rotation.y = -0.15;
    mouseMesh.castShadow = true;
    computer.add(mouseMesh);

    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.9, 0.05, 2.3),
      new THREE.Vector3(1.8, 0.03, 1.8),
      new THREE.Vector3(1.55, 0.03, 1.4),
      new THREE.Vector3(1.35, 0.2, 0.9),
    ]);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 24, 0.018, 6), groove);
    computer.add(cable);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.45 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    computer.position.set(0, 0, -0.6);
    computer.rotation.y = -0.2;

    // ---------- Terminal state ----------
    let lines = [];
    let lineIdx = 0;
    let charIdx = 0;
    let holdUntil = 0;
    let interactive = false;
    let input = '';
    const bootStart = performance.now();

    // Break a long line into screen-width rows so typing wraps instead of stopping
    const wrap = (line) => {
      if (line.text.length <= MAX_COLS) return [line];
      const rows = [];
      for (let i = 0; i < line.text.length; i += MAX_COLS) {
        rows.push({ ...line, text: line.text.slice(i, i + MAX_COLS) });
      }
      return rows;
    };

    const pushLine = (line) => {
      lines.push(...wrap(line));
      if (lines.length > MAX_LINES) lines = lines.slice(-MAX_LINES);
    };

    const runCommand = (raw) => {
      const cmd = raw.trim().toLowerCase();
      pushLine({ text: `~ $ ${raw}`, prompt: true });
      if (!cmd) return;
      if (cmd === 'clear') {
        lines = [];
        return;
      }
      const out = COMMANDS[cmd] || [`${cmd.slice(0, 10)}: not found`];
      out.forEach((t) => pushLine({ text: t }));
    };

    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!onScreen) return;

      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
        if (!interactive) {
          interactive = true;
          lines = [];
        }
        if (e.key === ' ' || e.key === 'Backspace') e.preventDefault();
      }

      if (e.key === 'Enter') {
        runCommand(input);
        input = '';
        pressKey('\n');
      } else if (e.key === 'Backspace') {
        input = input.slice(0, -1);
        pressKey('\\');
      } else if (e.key.length === 1 && interactive) {
        if (input.length < 200) input += e.key;
        pressKey(e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Static CRT layers are painted once and blitted each redraw
    const bgLayer = makeLayer((g, W, H) => {
      const grad = g.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.7);
      grad.addColorStop(0, '#0c2217');
      grad.addColorStop(1, '#020604');
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
    });
    const overlayLayer = makeLayer((g, W, H) => {
      g.fillStyle = 'rgba(0, 0, 0, 0.26)';
      for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2);
      const vig = g.createRadialGradient(W / 2, H / 2, W * 0.32, W / 2, H / 2, W * 0.7);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.72)');
      g.fillStyle = vig;
      g.fillRect(0, 0, W, H);
    });
    const bandLayer = document.createElement('canvas');
    bandLayer.width = TEX_W;
    bandLayer.height = 120;
    {
      const g = bandLayer.getContext('2d');
      const grad = g.createLinearGradient(0, 0, 0, 120);
      grad.addColorStop(0, 'rgba(125,255,174,0)');
      grad.addColorStop(0.5, 'rgba(125,255,174,0.05)');
      grad.addColorStop(1, 'rgba(125,255,174,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, TEX_W, 120);
    }

    // Glowing text is the expensive part (shadowBlur), so it lives on its own
    // layer that is only repainted when the visible text or cursor changes
    const textLayer = document.createElement('canvas');
    textLayer.width = TEX_W;
    textLayer.height = TEX_H;
    const tctx = textLayer.getContext('2d');
    tctx.scale(TEX_SCALE, TEX_SCALE);
    let lastTextKey = '';

    const paintText = (view, blinkOn) => {
      const textKey = blinkOn + '|' + view.map((l) => l.text).join('\n');
      if (textKey === lastTextKey) return;
      lastTextKey = textKey;

      tctx.clearRect(0, 0, 1024, 784);
      tctx.font = '700 72px "Courier New", monospace';
      tctx.textBaseline = 'top';
      tctx.shadowColor = 'rgba(110, 255, 170, 0.8)';
      tctx.shadowBlur = 18;
      view.forEach((line, j) => {
        const y = 44 + j * 96;
        tctx.fillStyle = line.dim ? 'rgba(140, 220, 170, 0.55)' : line.prompt ? '#c4ffd9' : '#7dffae';
        tctx.fillText(line.text, 64, y);
        if (line.cursor && blinkOn) {
          tctx.fillRect(64 + tctx.measureText(line.text).width + 6, y + 6, 38, 66);
        }
      });
    };

    const drawScreen = (now) => {
      const bootT = Math.min((now - bootStart) / 900, 1);

      // CRT power-on: a bright line that opens vertically
      if (bootT < 1) {
        ctx.fillStyle = '#010302';
        ctx.fillRect(0, 0, TEX_W, TEX_H);
        const open = Math.max(0.01, (bootT - 0.25) / 0.75);
        const lineW = TEX_W * Math.min(bootT * 3, 1);
        ctx.fillStyle = `rgba(190,255,215,${1 - open * 0.7})`;
        ctx.fillRect((TEX_W - lineW) / 2, TEX_H / 2 - (TEX_H * open) / 2, lineW, Math.max(3, TEX_H * open));
        screenTexture.needsUpdate = true;
        glow.intensity = bootT * 2.4;
        return;
      }

      const blinkOn = Math.floor(now / 480) % 2 === 0;
      let view;
      if (interactive) {
        const current = wrap({ text: `~ $ ${input}`, prompt: true });
        current[current.length - 1].cursor = true;
        view = [...lines, ...current].slice(-MAX_LINES);
      } else {
        view = SESSION.slice(0, lineIdx + 1)
          .map((l, i) => (i === lineIdx ? { ...l, text: l.text.slice(0, charIdx), cursor: true } : l))
          .slice(-MAX_LINES);
      }
      paintText(view, blinkOn);

      ctx.drawImage(bgLayer, 0, 0);
      ctx.drawImage(textLayer, 0, 0);
      ctx.drawImage(bandLayer, 0, ((now / 9) % (TEX_H + 160)) - 140);
      ctx.drawImage(overlayLayer, 0, 0);
      screenTexture.needsUpdate = true;

      if (interactive || now < holdUntil) return;
      const line = SESSION[lineIdx];
      if (charIdx < line.text.length) {
        charIdx += 1;
        if (line.prompt) pressKey(line.text[charIdx - 1] || ' ');
        holdUntil = now + (line.prompt ? 70 + Math.random() * 90 : 18);
      } else if (lineIdx < SESSION.length - 1) {
        lineIdx++;
        charIdx = 0;
        if (line.prompt) pressKey('\n');
        holdUntil = now + (SESSION[lineIdx].prompt ? 800 : 120);
      } else {
        lineIdx = 0;
        charIdx = 0;
        holdUntil = now + 5000;
      }
    };

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Only render while the hero is actually on screen
    let onScreen = true;
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    visibility.observe(mount);

    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    let frameId;
    let lastDraw = 0;
    let frameCount = 0;
    const clock = new THREE.Clock();
    const animate = (now) => {
      frameId = requestAnimationFrame(animate);
      if (!onScreen) return;
      const t = clock.getElapsedTime();
      frameCount++;

      if (now - lastDraw > 40) {
        drawScreen(now);
        lastDraw = now;
      }

      updateKeys();

      const scrollP = Math.min(scrollY / window.innerHeight, 1.2);
      const targetY = -0.25 + pointer.x * 0.18 + Math.sin(t * 0.3) * 0.03 + scrollP * 1.1;
      const targetX = pointer.y * 0.04 + scrollP * 0.25;
      computer.rotation.y += (targetY - computer.rotation.y) * 0.05;
      computer.rotation.x += (targetX - computer.rotation.x) * 0.05;
      computer.position.y += (-scrollP * 1.2 - computer.position.y) * 0.08;

      if (now - bootStart > 900) glow.intensity = 2.4 + Math.sin(t * 60) * 0.08 + Math.random() * 0.1;

      if (frameCount % 2 === 0) renderer.shadowMap.needsUpdate = true;
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('keydown', onKeyDown);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) [].concat(obj.material).forEach((m) => m.dispose());
      });
      screenTexture.dispose();
      envTexture.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '360px' }} />;
}
