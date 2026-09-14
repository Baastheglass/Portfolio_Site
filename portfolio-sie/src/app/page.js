'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import MessageBubble from './components/MessageBubble'
import styles from "./page.module.css";

const VintageComputer = dynamic(() => import('./components/VintageComputer'), {
  ssr: false,
  loading: () => <div className={styles.canvasLoader}>warming up the tube...</div>
})
const BackgroundField = dynamic(() => import('./components/BackgroundField'), { ssr: false })
const Motion = dynamic(() => import('./components/Motion'), { ssr: false })

const titles = [
  'backend software engineer',
  'agentic ai developer',
  'systems tinkerer'
];

const experience = [
  {
    role: 'Associate Software Engineer',
    company: 'Dubizzle Labs',
    context: 'PropForce: Zameen & Bayut',
    period: 'Apr 2026 - now',
    current: true,
    points: [
      'Led backend development for secondary (resale) sales, launching a new revenue line: a 6-stage inventory-to-contract workflow in Node.js and TypeScript with pricing, payment processing, OCR payment verification and automated contract-lifecycle emails.',
      'Repurposed the RBAC framework for granular authorization across 3 owner types in the acquisition module, with row-level access scoping, and patched a fail-open authorization bypass.',
      'Reworked the wealth-management lead-routing engine (round robin, escalation), eliminating cross-department misassignment and cutting the workload window from 7 to 3 days.',
      'Shipped an OAuth partner REST API for Bayut KSA lead attribution, fixed AI meeting verification across linked tasks, and resolved a PMS sync crash silently dropping rental leads.',
    ],
    tags: ['Node.js', 'TypeScript', 'MySQL', 'RBAC', 'OAuth'],
  },
  {
    role: 'Software Engineer, DevOps',
    company: 'Axonbuild',
    period: 'Apr 2025 - Dec 2025',
    points: [
      'Built a Next.js and FastAPI deployment platform that ships services to VPS behind an Nginx reverse proxy.',
      'Implemented CI/CD pipelines with GitHub Actions to automate builds and deployments.',
      'Designed an AI hospital voice receptionist (OpenAI Realtime API, WebSockets) with Qdrant-based RAG.',
      'Built a customizable LLM chatbot and a modular WhatsApp AI agent platform on a layered microservices backend.',
    ],
    tags: ['FastAPI', 'Next.js', 'Python', 'Nginx', 'RAG'],
  },
  {
    role: 'AI Lab Teaching Assistant',
    company: 'FAST NUCES',
    period: 'Jan 2026 - Jun 2026',
    points: [
      'Mentored students on implementing machine learning models, data preprocessing, model evaluation and analysis.',
    ],
    tags: ['Machine Learning'],
  },
  {
    role: 'AI Engineering Intern',
    company: 'Bookme.pk',
    period: 'May 2024 - Aug 2024',
    points: [
      'Built a travel recommendation system with LangChain, Vertex AI (Gemini), Google Maps API and Flask.',
      'Delivered a production-ready passport data extraction pipeline using Google Document AI.',
    ],
    tags: ['LangChain', 'Gemini', 'Flask'],
  },
];

const skills = [
  { group: 'Languages', items: 'TypeScript, Python, Node.js, JavaScript, SQL, C++' },
  { group: 'Backend', items: 'Node.js, Express, FastAPI, REST, Microservices, WebSockets, OAuth, RBAC' },
  { group: 'Data', items: 'MySQL, MongoDB, SQLite, Qdrant' },
  { group: 'DevOps', items: 'GitHub Actions, CI/CD, Nginx, Linux, VPS' },
  { group: 'AI / ML', items: 'LLMs, LangChain, RAG, OpenAI, Gemini, TensorFlow' },
];

const marqueeWords = ['Node.js', 'TypeScript', 'Python', 'FastAPI', 'MySQL', 'MongoDB', 'Express', 'RAG', 'WebSockets', 'Nginx'];

// Splits text into per-character spans for GSAP, keeping words unbroken
function Split({ text, charProps = {}, className = '' }) {
  return text.split(' ').map((word, w) => (
    <span key={w} className={styles.word}>
      {[...word].map((ch, i) => (
        <span key={i} className={`char ${className}`} {...charProps}>{ch}</span>
      ))}
      {' '}
    </span>
  ));
}

export default function Home() {
  const [messagesVisible, setMessagesVisible] = useState(false);
  const messagesRef = useRef(null);
  const araneaVideoRef = useRef(null);
  const [displayedText, setDisplayedText] = useState('');
  const [titleIndex, setTitleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing effect
  useEffect(() => {
    const currentTitle = titles[titleIndex];
    const typingSpeed = isDeleting ? 35 : 75 + Math.random() * 60;
    const pauseTime = isDeleting ? 400 : 2200;

    if (!isDeleting && displayedText === currentTitle) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setTitleIndex((prev) => (prev + 1) % titles.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting ? prev.slice(0, -1) : currentTitle.slice(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, titleIndex]);

  useEffect(() => {
    const messagesEl = messagesRef.current;
    const videoEl = araneaVideoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setMessagesVisible(true);
        });
      },
      { threshold: 0.3 }
    );
    if (messagesEl) observer.observe(messagesEl);

    // Autoplay the ARANEA demo when it scrolls into view
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoEl) {
            videoEl.play().catch(() => {});
          }
        });
      },
      { threshold: 0.3 }
    );
    if (videoEl) videoObserver.observe(videoEl);

    return () => {
      observer.disconnect();
      videoObserver.disconnect();
    };
  }, [])

  return (
    <>
      <BackgroundField />
      <Motion />
      <div className={styles.container}>
        <nav className={styles.nav}>
          <a href="#top" className={styles.navBrand} data-magnetic>mb<span>/</span></a>
          <div className={styles.navLinks}>
            <a href="#about" data-magnetic>about</a>
            <a href="#experience" data-magnetic>experience</a>
            <a href="#work" data-magnetic>work</a>
            <a href="#contact" data-magnetic>say hi</a>
          </div>
        </nav>

        {/* Hero */}
        <section id="top" className={styles.hero}>
          <div className={styles.canvasContainer}>
            <VintageComputer key="single-vintage-mac" />
          </div>

          <div className={styles.heroContent}>
            <p className={styles.kicker} data-hero-fade>
              Lahore, PK <span className={styles.kickerRule} /> currently at Dubizzle Labs
            </p>
            <h1 className={styles.mainTitle} aria-label="Muhammad Baasil">
              <span className={styles.titleLine}>
                <Split text="Muhammad" className={styles.heroChar} charProps={{ 'data-hero-char': '' }} />
              </span>
              <span className={`${styles.titleLine} ${styles.titleSerif}`}>
                <Split text="Baasil" className={styles.heroChar} charProps={{ 'data-hero-char': '' }} />
              </span>
            </h1>
            <p className={styles.mainSubtitle} data-hero-fade>
              <span className={styles.prompt}>&gt;</span> {displayedText}
              <span className={styles.cursor} />
            </p>
            <p className={styles.heroDescription} data-hero-fade>
              I build the backend plumbing that sales teams at Zameen and Bayut run their day on:
              APIs, workflows, and the permission checks nobody notices until they&apos;re wrong.
            </p>
            <div className={styles.inlineLinks} data-hero-fade>
              <a href="#experience" className={styles.textLink} data-magnetic>what I&apos;ve built <span>↓</span></a>
              <a href="mailto:baaasil6@gmail.com" className={styles.textLinkMuted} data-magnetic>baaasil6@gmail.com</a>
            </div>
          </div>

          <div className={styles.annotation} data-hero-fade aria-hidden="true">
            <span>psst, it works.<br />just start typing</span>
            <svg viewBox="0 0 120 80" className={styles.annotationArrow}>
              <path d="M8 10 C 40 4, 70 20, 78 44 S 96 70, 110 66" />
              <path d="M100 58 L 111 66 L 99 73" />
            </svg>
          </div>

          <div className={styles.scrollHint} data-hero-fade>
            <span>scroll</span>
            <i />
          </div>
        </section>

        {/* Marquee */}
        <div className={styles.marqueeWrap} aria-hidden="true">
          <div className={styles.marquee} data-marquee>
            {[...marqueeWords, ...marqueeWords].map((w, i) => (
              <span key={i} className={i % 2 ? styles.marqueeSerif : ''}>
                {w}<b>✳</b>
              </span>
            ))}
          </div>
        </div>

        {/* About */}
        <section id="about" className={styles.section}>
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel}>(01) about</p>
            <div className={styles.aboutGrid}>
              <div>
                <h2 className={styles.sectionTitle} data-split>
                  <Split text="The best backend work is" />
                  <em><Split text="invisible." /></em>
                </h2>
                <p className={styles.bodyText} data-reveal>
                  A lead lands with the right advisor, a payment slip is checked without anyone chasing it,
                  an expiring contract flags itself before it is missed. That is the kind of engineering I do.
                </p>
                <p className={styles.bodyText} data-reveal>
                  I work across database schema design, third-party integrations, microservices and
                  system reliability, and I&apos;ve spent a good while building CI/CD pipelines and shipping
                  AI-powered services. BS Computer Science, FAST NUCES Lahore.
                </p>
              </div>
              <dl className={styles.skillList} data-reveal>
                {skills.map((s) => (
                  <div key={s.group} className={styles.skillRow}>
                    <dt>{s.group}</dt>
                    <dd>{s.items}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className={styles.section}>
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel}>(02) experience</p>
            <h2 className={styles.sectionTitle} data-split>
              <Split text="Where I've" /> <em><Split text="shipped." /></em>
            </h2>
            <ol className={styles.timeline}>
              <span className={styles.rail} data-rail />
              {experience.map((job) => (
                <li key={job.company + job.role} className={styles.job} data-reveal>
                  <div className={styles.jobMeta}>
                    <span className={styles.jobPeriod}>{job.period}</span>
                    {job.current && <span className={styles.currentBadge}>on it right now</span>}
                  </div>
                  <div className={styles.jobBody}>
                    <h3 className={styles.jobRole}>
                      {job.role} <span className={styles.jobCompany}>@ {job.company}</span>
                    </h3>
                    {job.context && <p className={styles.jobContext}>{job.context}</p>}
                    <ul className={styles.jobPoints}>
                      {job.points.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                    <div className={styles.techTags}>
                      {job.tags.map((t) => <span key={t}>{t}</span>)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Project 01 - WhatsApp Agent Maker */}
        <section id="work" className={styles.projectHero}>
          <div className={styles.projectBigNumber} data-parallax="-40" aria-hidden="true">01</div>
          <div className={styles.projectHeroContent}>
            <p className={styles.sectionLabel}>(03) selected work</p>
            <h2 className={styles.projectTitle} data-split>
              <Split text="WhatsApp Agent" /> <em><Split text="Maker" /></em>
            </h2>
            <p className={styles.projectDescription} data-reveal>
              Build intelligent WhatsApp chatbots in minutes, not months. Turn a WhatsApp number into
              an AI assistant with custom agents, personalized prompts and external service connections,
              all through a no-code dashboard.
            </p>

            <div ref={messagesRef} className={styles.floatingMessagesContainer} data-tilt>
              <div className={styles.phoneHeader}>
                <i /> <span>Agent · online</span>
              </div>
              <div className={`${styles.floatingMessageLeft} ${messagesVisible ? styles.animate : ''}`}>
                <MessageBubble
                  message="How does your RAG system retrieve relevant information?"
                  type="received"
                  timestamp="2:45 PM"
                />
              </div>
              <div className={`${styles.typingDots} ${messagesVisible ? styles.animate : ''}`}>
                <i /><i /><i />
              </div>
              <div className={`${styles.floatingMessageRight} ${messagesVisible ? styles.animate : ''}`}>
                <MessageBubble
                  message="I use semantic search to find the most relevant documents, then generate contextually accurate responses based on that information. It's fast, efficient, and incredibly precise!"
                  type="sent"
                  timestamp="2:45 PM"
                  status="read"
                />
              </div>
            </div>

            <div className={styles.projectDetails} data-reveal>
              <div className={styles.detailColumn}>
                <h3>Built with</h3>
                <div className={styles.techTags}>
                  <span>Next.js</span>
                  <span>Node.js</span>
                  <span>Express</span>
                  <span>MongoDB</span>
                  <span>Whatsapp-Web.js</span>
                  <span>OpenAI</span>
                  <span>Tailwind CSS</span>
                </div>
              </div>
              <div className={styles.detailColumn}>
                <h3>What it does</h3>
                <ul>
                  <li>Effortless agent building</li>
                  <li>Easy to use interface</li>
                  <li>Multiple AI Agent deployment for each number</li>
                  <li>n8n and OpenAI integration</li>
                  <li>Conversation history tracking for better performance</li>
                  <li>JWT authentication & security</li>
                </ul>
              </div>
            </div>
            <div className={styles.inlineLinks}>
              <a href="https://my-whatsapp-agent-sage.vercel.app/" target="_blank" rel="noopener noreferrer" className={styles.textLink} data-magnetic>live demo <span>↗</span></a>
              <a href="https://github.com/Baastheglass/My-Whatsapp-Agent" target="_blank" rel="noopener noreferrer" className={styles.textLinkMuted} data-magnetic>source <span>↗</span></a>
            </div>
          </div>
        </section>

        {/* Project 02 - ARANEA */}
        <section className={styles.projectHero}>
          <div className={styles.projectBigNumber} data-parallax="-40" aria-hidden="true">02</div>
          <div className={styles.projectHeroContent}>
            <h2 className={styles.projectTitle} data-split>
              <em><Split text="ARANEA" /></em> <Split text="talks to your pentest tools" />
            </h2>
            <p className={styles.projectDescription} data-reveal>
              A conversational AI penetration testing platform that turns complex security workflows
              into natural language. No command syntax to memorize: ARANEA orchestrates industry-standard
              security tools, formats results, and writes OWASP/PTES-compliant reports on its own.
            </p>

            <div className={styles.videoContainer} data-grow>
              <video
                ref={araneaVideoRef}
                className={styles.demoVideo}
                controls
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src="aranea.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className={styles.projectDetails} data-reveal>
              <div className={styles.detailColumn}>
                <h3>Built with</h3>
                <div className={styles.techTags}>
                  <span>Next.js</span>
                  <span>FastAPI</span>
                  <span>Python</span>
                  <span>MongoDB</span>
                  <span>Google Gemini AI</span>
                  <span>WebSocket</span>
                  <span>Metasploit</span>
                  <span>Nmap</span>
                </div>
              </div>
              <div className={styles.detailColumn}>
                <h3>What it does</h3>
                <ul>
                  <li>AI-powered natural language orchestration</li>
                  <li>Multi-tool integration (Masscan, Nmap, Metasploit)</li>
                  <li>Real-time WebSocket feedback</li>
                  <li>Intelligent result formatting & recommendations</li>
                  <li>Automated PDF report generation</li>
                  <li>Multi-user support with isolated workspaces</li>
                </ul>
              </div>
            </div>
            <div className={styles.inlineLinks}>
              <a href="https://github.com/Baastheglass/Aranea" target="_blank" rel="noopener noreferrer" className={styles.textLink} data-magnetic>source <span>↗</span></a>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className={styles.contactHero}>
          <div className={styles.contactInner}>
            <p className={styles.sectionLabel}>(04) contact</p>
            <h2 className={styles.contactTitle} data-split>
              <Split text="Got something" /> <em><Split text="worth building?" /></em>
            </h2>
            <p className={styles.contactDescription} data-reveal>
              I&apos;m open to backend and platform roles, odd side projects, and good conversations.
            </p>
            <a href="mailto:baaasil6@gmail.com" className={styles.bigEmail} data-magnetic>
              baaasil6@gmail.com
            </a>
            <div className={styles.contactLinks}>
              <a href="https://github.com/Baastheglass" target="_blank" rel="noopener noreferrer" className={styles.textLinkMuted} data-magnetic>github <span>↗</span></a>
              <span className={styles.divider} />
              <a href="https://www.linkedin.com/in/muhammad-baasil-a65116361/" target="_blank" rel="noopener noreferrer" className={styles.textLinkMuted} data-magnetic>linkedin <span>↗</span></a>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>© 2026 Muhammad Baasil</p>
          <p>built with three.js, gsap &amp; too much chai</p>
        </footer>
      </div>
    </>
  );
}
