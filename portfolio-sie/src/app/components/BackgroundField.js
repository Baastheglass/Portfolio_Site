'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// A drifting terrain of points behind the whole page. It ripples around the
// pointer and rolls forward as you scroll.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  varying float vHeight;
  varying float vNear;

  void main() {
    vec3 p = position;
    float z = p.y + uScroll * 6.0;
    float h = sin(p.x * 0.35 + uTime * 0.4) * 0.35
            + sin(z * 0.28 - uTime * 0.3) * 0.45
            + sin((p.x + z) * 0.6 + uTime * 0.7) * 0.12;

    float d = distance(p.xy, uMouse);
    float ripple = exp(-d * 0.45) * sin(d * 2.2 - uTime * 3.0) * 0.6;
    h += ripple;

    vHeight = h;
    vNear = exp(-d * 0.35);

    vec4 mv = modelViewMatrix * vec4(p.x, p.y, h, 1.0);
    gl_PointSize = (2.6 + vNear * 2.5) * (14.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vHeight;
  varying float vNear;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    vec3 steel = vec3(0.35, 0.47, 0.62);
    vec3 phosphor = vec3(0.49, 1.0, 0.68);
    vec3 col = mix(steel, phosphor, clamp(vNear * 1.4, 0.0, 1.0));
    float alpha = (0.18 + vHeight * 0.18 + vNear * 0.5) * smoothstep(0.5, 0.1, r);
    gl_FragColor = vec4(col, alpha);
  }
`;

export default function BackgroundField() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    // Soft glowing dots don't need retina resolution
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, -12, 5);
    camera.lookAt(0, 4, 0);

    // ~12k points instead of ~21k; slightly larger sprites keep the same density
    const geometry = new THREE.PlaneGeometry(44, 30, 130, 92);
    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(100, 100) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Project the pointer onto the plane so the ripple follows the cursor
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const targetMouse = new THREE.Vector2(100, 100);
    const onMove = (e) => {
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) targetMouse.set(hit.x, hit.y);
    };
    window.addEventListener('pointermove', onMove);

    // Cache the scrollable height instead of reading layout every frame
    let maxScroll = 1;
    const measure = () => {
      maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      measure();
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frame;
    let scroll = 0;
    let odd = false;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      // The field drifts slowly, so 30fps is indistinguishable from 60
      odd = !odd;
      if (odd) return;
      uniforms.uTime.value = clock.getElapsedTime();
      scroll += (window.scrollY / maxScroll - scroll) * 0.12;
      uniforms.uScroll.value = scroll;
      uniforms.uMouse.value.lerp(targetMouse, 0.15);
      camera.position.y = -12 + scroll * 3;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.7 }}
    />
  );
}
