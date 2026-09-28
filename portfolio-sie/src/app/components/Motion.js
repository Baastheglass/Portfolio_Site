'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Smooth scrolling plus quiet, scroll-driven reveals. Everything hooks into
// data-attributes in the markup so page.js stays declarative.
export default function Motion() {
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
      // Intro: the name settles in, the rest follows
      gsap.from('[data-hero-char]', {
        yPercent: 105,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.03,
        delay: 0.2,
        clearProps: 'transform,opacity',
      });
      gsap.from('[data-hero-fade]', { y: 20, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.6 });

      if (reduceMotion) return;

      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          duration: 1.1,
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
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      anchorHandlers.forEach(([a, h]) => a.removeEventListener('click', h));
    };
  }, []);

  return null;
}
