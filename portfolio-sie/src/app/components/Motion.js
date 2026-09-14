'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Smooth scrolling, scroll-driven reveals, a trailing cursor, magnetic links,
// tilting media and a velocity-aware marquee. Everything hooks into data-attributes
// in the markup so page.js stays declarative.
export default function Motion() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const anchorHandlers = [];
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const handler = (e) => {
        e.preventDefault();
        lenis.scrollTo(a.getAttribute('href'), { offset: -40, duration: 1.4 });
      };
      a.addEventListener('click', handler);
      anchorHandlers.push([a, handler]);
    });

    const ctx = gsap.context(() => {
      // Intro: hero letters fall into place
      gsap.from('[data-hero-char]', {
        yPercent: 120,
        rotate: () => gsap.utils.random(-25, 25),
        opacity: 0,
        duration: 1.3,
        ease: 'expo.out',
        stagger: 0.035,
        delay: 0.2,
        clearProps: 'transform,opacity',
      });
      gsap.from('[data-hero-fade]', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.7 });

      if (reduceMotion) return;

      // Headings split into characters roll up when they enter
      gsap.utils.toArray('[data-split]').forEach((el) => {
        gsap.from(el.querySelectorAll('.char'), {
          yPercent: 110,
          opacity: 0,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.018,
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });

      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        });
      });

      // Experience rail draws itself as you scroll
      const rail = document.querySelector('[data-rail]');
      if (rail) {
        gsap.fromTo(
          rail,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: rail.parentElement, start: 'top 70%', end: 'bottom 70%', scrub: true },
          }
        );
      }

      // Big project numbers drift at a different speed than the content
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        gsap.to(el, {
          yPercent: parseFloat(el.dataset.parallax),
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      // Media scales up from a slightly smaller, rounder card
      gsap.utils.toArray('[data-grow]').forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.86, borderRadius: '32px' },
          {
            scale: 1,
            borderRadius: '12px',
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: true },
          }
        );
      });
    });

    // Marquee whose speed and direction follow scroll velocity
    const marquees = gsap.utils.toArray('[data-marquee]');
    // Measure once (and on resize) rather than forcing layout every frame
    let marqueeHalf = marquees[0] ? marquees[0].scrollWidth / 2 : 0;
    const measureMarquee = () => {
      if (marquees[0]) marqueeHalf = marquees[0].scrollWidth / 2;
    };
    window.addEventListener('resize', measureMarquee);
    document.fonts?.ready.then(measureMarquee);
    let marqueeX = 0;
    let direction = -1;
    const marqueeTick = () => {
      const v = lenis.velocity || 0;
      if (v !== 0) direction = v > 0 ? -1 : 1;
      marqueeX += direction * (0.6 + Math.min(Math.abs(v) * 0.4, 12));
      marquees.forEach((m) => {
        const half = marqueeHalf;
        if (marqueeX <= -half) marqueeX += half;
        if (marqueeX > 0) marqueeX -= half;
        m.style.transform = `translate3d(${marqueeX}px,0,0) skewX(${gsap.utils.clamp(-8, 8, -v * 0.3)}deg)`;
      });
    };
    if (!reduceMotion) gsap.ticker.add(marqueeTick);

    // Cursor
    const dot = dotRef.current;
    const ring = ringRef.current;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    };
    const cursorTick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
    };
    const onOver = (e) => {
      const hot = e.target.closest('a, button, [data-magnetic], video');
      ring.classList.toggle('cursor-hot', !!hot);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerover', onOver);
    gsap.ticker.add(cursorTick);

    // Magnetic elements pull toward the cursor
    const magnetCleanups = gsap.utils.toArray('[data-magnetic]').map((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const move = (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      };
    });

    // 3D tilt on hover
    const tiltCleanups = gsap.utils.toArray('[data-tilt]').map((el) => {
      // quickTo reuses one tween instead of creating a new one on every pointer event
      gsap.set(el, { transformPerspective: 1000 });
      const rotY = gsap.quickTo(el, 'rotateY', { duration: 0.6, ease: 'power3.out' });
      const rotX = gsap.quickTo(el, 'rotateX', { duration: 0.6, ease: 'power3.out' });
      const move = (e) => {
        const r = el.getBoundingClientRect();
        rotY(((e.clientX - r.left) / r.width - 0.5) * 8);
        rotX(-((e.clientY - r.top) / r.height - 0.5) * 8);
      };
      const leave = () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, 0.5)' });
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      };
    });

    return () => {
      ctx.revert();
      window.removeEventListener('resize', measureMarquee);
      gsap.ticker.remove(raf);
      gsap.ticker.remove(marqueeTick);
      gsap.ticker.remove(cursorTick);
      lenis.destroy();
      anchorHandlers.forEach(([a, h]) => a.removeEventListener('click', h));
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      magnetCleanups.forEach((fn) => fn());
      tiltCleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
