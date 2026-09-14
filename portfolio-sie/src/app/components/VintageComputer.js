'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Global instance counter
let globalInstanceCounter = 0;

export default function VintageMac() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const isInitializedRef = useRef(false);
  const sceneRef = useRef(null);
  const textureRef = useRef(null);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (!mountRef.current || rendererRef.current || isInitializedRef.current) {
      return;
    }
    
    // Check if mount point already has children (another renderer)
    if (mountRef.current.children.length > 0) {
      return;
    }
    
    isInitializedRef.current = true;

    // Scene setup with transparent background
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // No background color for transparency
    const camera = new THREE.PerspectiveCamera(
      32,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(8, 4, 15);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // Enable transparency
    });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Fully transparent background
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(8, 10, 8);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-6, 4, -6);
    scene.add(fillLight);

    // Create main group
    const macGroup = new THREE.Group();
    macGroup.scale.set(2.8, 2.8, 2.8);
    macGroup.rotation.y = 0;
    macGroup.rotation.x = -0.05;

    // Colors - Classic Mac beige
    const beige = new THREE.Color(0xf4ead8);
    const beigeLight = new THREE.Color(0xfaf6ec);
    const beigeDark = new THREE.Color(0xe0d4c0);
    const beigeDarker = new THREE.Color(0xc8bca8);

    // ========== MONITOR UNIT ==========
    
    // Main monitor housing with subdivisions for smoother look
    const monitorGeometry = new THREE.BoxGeometry(1.15, 1.35, 1.1, 12, 12, 12);
    const monitorMaterial = new THREE.MeshStandardMaterial({
      color: beige,
      roughness: 0.35,
      metalness: 0.02,
    });
    const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    monitor.position.set(0, 1.05, -0.35);
    monitor.castShadow = true;
    monitor.receiveShadow = true;
    macGroup.add(monitor);

    // Front face panel with subdivisions for smooth look
    const frontFaceGeometry = new THREE.BoxGeometry(1.08, 1.28, 0.08, 10, 10, 10);
    const frontFaceMaterial = new THREE.MeshStandardMaterial({
      color: beigeLight,
      roughness: 0.4,
    });
    const frontFace = new THREE.Mesh(frontFaceGeometry, frontFaceMaterial);
    frontFace.position.set(0, 1.05, 0.22);
    macGroup.add(frontFace);

    // Screen bezel with subdivisions
    const bezelGeometry = new THREE.BoxGeometry(0.95, 0.78, 0.08, 8, 8, 8);
    const bezelMaterial = new THREE.MeshStandardMaterial({
      color: beigeDark,
      roughness: 0.5,
    });
    const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
    bezel.position.set(0, 1.15, 0.26);
    macGroup.add(bezel);

    // SCREEN with scrolling code - BIGGER AND CLEARER
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    
    // Code content
    const codeLines = [
      '10 PRINT "HELLO WORLD"',
      '20 FOR I = 1 TO 10',
      '30 PRINT "MACINTOSH"',
      '40 NEXT I',
      '50 END',
      '',
      'function initMac() {',
      '  var system = new OS();',
      '  system.boot();',
      '  return system;',
      '}',
      '',
      '#include <stdio.h>',
      'int main() {',
      '  printf("Classic Mac");',
      '  return 0;',
      '}',
      '',
      'mov ax, 0x0003',
      'int 0x10',
      'mov ah, 0x09',
      'lea dx, [message]',
      'int 0x21',
      '',
      'const vintage = true;',
      'let macintosh = {',
      '  year: 1984,',
      '  model: "128K",',
      '  screen: "9-inch"',
      '};',
      '',
      '10 INPUT "NAME"; N$',
      '20 PRINT "HELLO "; N$',
      '30 GOTO 10',
    ];
    
    let scrollOffset = 0;
    const fontSize = 22;
    const lineHeight = 28;
    
    const texture = new THREE.CanvasTexture(canvas);
    textureRef.current = texture;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    
    const screenGeometry = new THREE.BoxGeometry(0.87, 0.72, 0.03);
    const screenMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: new THREE.Color(0x1a1a1a),
      emissiveIntensity: 0.2,
      roughness: 0.25,
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 1.15, 0.30);
    macGroup.add(screen);
    
    // Draw code function
    const drawCode = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `${fontSize}px "Courier New", monospace`;
      
      const startLine = Math.floor(scrollOffset / lineHeight);
      const yOffset = -(scrollOffset % lineHeight);
      
      for (let i = 0; i < 40; i++) {
        const lineIndex = (startLine + i) % codeLines.length;
        const y = yOffset + i * lineHeight + 30;
        ctx.fillText(codeLines[lineIndex], 15, y);
      }
      
      scrollOffset += 1.2;
      if (scrollOffset > codeLines.length * lineHeight) {
        scrollOffset = 0;
      }
      
      texture.needsUpdate = true;
    };

    // Apple logo area below screen
    const logoGeometry = new THREE.BoxGeometry(0.19, 0.19, 0.02);
    const logoMaterial = new THREE.MeshStandardMaterial({
      color: beigeDarker,
      roughness: 0.4,
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(0, 0.52, 0.26);
    macGroup.add(logo);

    // Floppy disk slot
    const slotGeometry = new THREE.BoxGeometry(0.30, 0.022, 0.02);
    const slotMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.85,
    });
    const slot = new THREE.Mesh(slotGeometry, slotMaterial);
    slot.position.set(0, 0.73, 0.26);
    macGroup.add(slot);

    // Top ventilation slots
    for (let i = 0; i < 9; i++) {
      const ventGeometry = new THREE.BoxGeometry(0.075, 0.02, 0.80);
      const ventMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9,
      });
      const vent = new THREE.Mesh(ventGeometry, ventMaterial);
      vent.position.set(-0.35 + i * 0.088, 1.73, -0.35);
      macGroup.add(vent);
    }

    // Handle cutout on back top
    const handleGeometry = new THREE.BoxGeometry(0.18, 0.045, 0.12);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: beigeDarker,
      roughness: 0.6,
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, 1.73, -0.8);
    macGroup.add(handle);

    // Monitor base/stand with rounded look
    const monitorBaseGeometry = new THREE.BoxGeometry(1.25, 0.20, 1.0, 8, 8, 8);
    const monitorBaseMaterial = new THREE.MeshStandardMaterial({
      color: beige,
      roughness: 0.4,
    });
    const monitorBase = new THREE.Mesh(monitorBaseGeometry, monitorBaseMaterial);
    monitorBase.position.set(0, 0.28, -0.35);
    monitorBase.castShadow = true;
    monitorBase.receiveShadow = true;
    macGroup.add(monitorBase);

    // ========== KEYBOARD PLATFORM ==========
    
    // Main keyboard base platform with rounded edges using RoundedBoxGeometry approach
    const keyboardPlatformGeometry = new THREE.BoxGeometry(1.80, 0.20, 1.05, 8, 8, 8);
    const keyboardPlatformMaterial = new THREE.MeshStandardMaterial({
      color: beige,
      roughness: 0.4,
    });
    const keyboardPlatform = new THREE.Mesh(keyboardPlatformGeometry, keyboardPlatformMaterial);
    keyboardPlatform.position.set(0, 0.08, 0.68);
    keyboardPlatform.castShadow = true;
    keyboardPlatform.receiveShadow = true;
    macGroup.add(keyboardPlatform);

    // Recessed keyboard surface (angled)
    const keyboardSurfaceGeometry = new THREE.BoxGeometry(1.65, 0.12, 0.80, 6, 6, 6);
    const keyboardSurfaceMaterial = new THREE.MeshStandardMaterial({
      color: beigeDark,
      roughness: 0.55,
    });
    const keyboardSurface = new THREE.Mesh(keyboardSurfaceGeometry, keyboardSurfaceMaterial);
    keyboardSurface.position.set(0, 0.22, 0.73);
    keyboardSurface.rotation.x = -0.12;
    keyboardSurface.castShadow = true;
    macGroup.add(keyboardSurface);

    // Grooves/vents on front edge
    for (let i = 0; i < 22; i++) {
      const grooveGeometry = new THREE.BoxGeometry(0.028, 0.18, 0.042);
      const grooveMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        roughness: 0.75,
      });
      const grooveFront = new THREE.Mesh(grooveGeometry, grooveMaterial);
      grooveFront.position.set(-0.57 + i * 0.055, 0.08, 1.19);
      macGroup.add(grooveFront);
    }

    // Side grooves
    for (let i = 0; i < 17; i++) {
      const grooveGeometry = new THREE.BoxGeometry(0.028, 0.18, 0.042);
      const grooveMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        roughness: 0.75,
      });
      
      const grooveLeft = new THREE.Mesh(grooveGeometry, grooveMaterial);
      grooveLeft.position.set(-0.91, 0.08, 0.25 + i * 0.055);
      macGroup.add(grooveLeft);
      
      const grooveRight = new THREE.Mesh(grooveGeometry, grooveMaterial);
      grooveRight.position.set(0.91, 0.08, 0.25 + i * 0.055);
      macGroup.add(grooveRight);
    }

    // ========== KEYBOARD KEYS ==========
    
    const keyMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffffb,
      roughness: 0.10,
      metalness: 0.12,
    });
    
    // LARGER, more prominent keys
    const keyGeometry = new THREE.CylinderGeometry(0.038, 0.042, 0.055, 32);
    
    // Key rows
    const rows = [
      { keys: 13, startX: -0.455 }, // Number row
      { keys: 13, startX: -0.475 }, // QWERTY
      { keys: 12, startX: -0.445 }, // ASDF
      { keys: 11, startX: -0.415 }, // ZXCV
    ];
    
    rows.forEach((row, rowIndex) => {
      for (let i = 0; i < row.keys; i++) {
        const key = new THREE.Mesh(keyGeometry, keyMaterial);
        const zPos = 0.95 - rowIndex * 0.078;
        const yPos = 0.28 - rowIndex * 0.009;
        
        key.position.x = row.startX + i * 0.077;
        key.position.y = yPos;
        key.position.z = zPos;
        key.rotation.x = -0.12;
        key.castShadow = true;
        macGroup.add(key);
      }
    });
    
    // Spacebar - BIGGER
    const spacebarGeometry = new THREE.CylinderGeometry(0.038, 0.042, 0.65, 32);
    const spacebar = new THREE.Mesh(spacebarGeometry, keyMaterial);
    spacebar.rotation.z = Math.PI / 2;
    spacebar.rotation.y = -0.12;
    spacebar.position.set(0, 0.25, 0.71);
    spacebar.castShadow = true;
    macGroup.add(spacebar);
    
    // Special keys (slightly off-white) - LARGER
    const specialKeyMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf9f5,
      roughness: 0.12,
      metalness: 0.12,
    });
    
    const modifierKeyGeometry = new THREE.CylinderGeometry(0.040, 0.044, 0.055, 32);
    
    // Modifier keys around spacebar
    const modifierPositions = [
      { x: -0.32, z: 0.71 },
      { x: -0.40, z: 0.71 },
      { x: 0.32, z: 0.71 },
      { x: 0.40, z: 0.71 }
    ];
    
    modifierPositions.forEach(pos => {
      const modKey = new THREE.Mesh(modifierKeyGeometry, specialKeyMaterial);
      modKey.position.set(pos.x, 0.25, pos.z);
      modKey.rotation.x = -0.12;
      modKey.castShadow = true;
      macGroup.add(modKey);
    });
    
    // Enter key (LARGER)
    const enterKeyGeometry = new THREE.CylinderGeometry(0.044, 0.048, 0.055, 32);
    const enterKey = new THREE.Mesh(enterKeyGeometry, specialKeyMaterial);
    enterKey.position.set(0.565, 0.26, 0.71);
    enterKey.rotation.x = -0.12;
    enterKey.castShadow = true;
    macGroup.add(enterKey);
    
    // Shift keys - LARGER
    const shiftKeyGeometry = new THREE.CylinderGeometry(0.042, 0.046, 0.055, 32);
    
    const leftShift = new THREE.Mesh(shiftKeyGeometry, specialKeyMaterial);
    leftShift.position.set(-0.535, 0.253, 0.476);
    leftShift.rotation.x = -0.12;
    leftShift.castShadow = true;
    macGroup.add(leftShift);
    
    const rightShift = new THREE.Mesh(shiftKeyGeometry, specialKeyMaterial);
    rightShift.position.set(0.535, 0.253, 0.476);
    rightShift.rotation.x = -0.12;
    rightShift.castShadow = true;
    macGroup.add(rightShift);

    scene.add(macGroup);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(25, 25);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.18 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop
    let time = 0;
    let lastCodeUpdate = 0;
    const codeUpdateInterval = 20;
    
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      const currentTime = Date.now();
      if (currentTime - lastCodeUpdate > codeUpdateInterval) {
        drawCode();
        lastCodeUpdate = currentTime;
      }

      // Gentle bobbing animation
      macGroup.position.y = Math.sin(time) * 0.08;
      
      // Slight rotation
      macGroup.rotation.y = -0.25 + Math.sin(time * 0.5) * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      isInitializedRef.current = false;
      
      window.removeEventListener('resize', handleResize);
      
      // More robust renderer cleanup
      if (rendererRef.current) {
        // Stop animation loop
        rendererRef.current.setAnimationLoop(null);
        
        // Remove from DOM
        if (mountRef.current && rendererRef.current.domElement && mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        
        // Dispose renderer
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // Dispose all geometries and materials
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        sceneRef.current = null;
      }
      
      // Dispose texture
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '500px',
        background: 'transparent'
      }} 
    />
  );
}