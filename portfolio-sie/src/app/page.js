'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import MessageBubble from './components/MessageBubble'
import styles from "./page.module.css";

const VintageComputer = dynamic(() => import('./components/VintageComputer'), {
  ssr: false,
  loading: () => <div className={styles.canvasLoader}>Loading 3D Scene...</div>
})

export default function Home() {
  const [messagesVisible, setMessagesVisible] = useState(false);
  const messagesRef = useRef(null);
  const araneaVideoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setMessagesVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (messagesRef.current) {
      observer.observe(messagesRef.current);
    }

    // Video observer for ARANEA demo
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && araneaVideoRef.current) {
            araneaVideoRef.current.play();
          } else if (araneaVideoRef.current) {
            araneaVideoRef.current.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (araneaVideoRef.current) {
      videoObserver.observe(araneaVideoRef.current);
    }

    return () => {
      if (messagesRef.current) {
        observer.unobserve(messagesRef.current);
      }
      if (araneaVideoRef.current) {
        videoObserver.unobserve(araneaVideoRef.current);
      }
    };
  }, [])

  return (
    <div className={styles.container}>
      {/* Main Hero - Introduction */}
      <section className={styles.hero}>
        <div className={styles.canvasContainer}>
          <VintageComputer key="single-vintage-mac" />
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.mainTitle}>Baasil</h1>
          <p className={styles.mainSubtitle}>Full Stack Developer & AI Enthusiast</p>
        </div>
      </section>

      {/* Project Hero 1 - AI Chat Application */}
      <section className={styles.projectHero}>
        <div className={styles.projectHeroContent}>
          <div className={styles.projectNumber}>01</div>
          <h2 className={styles.projectTitle}>WhatsApp Agent Maker Platform</h2>
          <p className={styles.projectDescription}>
            Build intelligent WhatsApp chatbots in minutes, not months. Transform your WhatsApp into 
            a powerful AI assistant with custom agents, personalized prompts, and seamless external 
            service connections—all through an intuitive no-code dashboard.
          </p>
          
          {/* Floating Message Demo */}
          <div ref={messagesRef} className={styles.floatingMessagesContainer}>
            <div className={`${styles.floatingMessageLeft} ${messagesVisible ? styles.animate : ''}`}>
              <MessageBubble
                message="How does your RAG system retrieve relevant information?"
                type="received"
                timestamp="2:45 PM"
              />
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

          <div className={styles.projectDetails}>
            <div className={styles.detailColumn}>
              <h3>Technologies</h3>
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
              <h3>Key Features</h3>
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
          <div className={styles.projectLinks}>
            <a href="#" className={styles.projectButton}>View Live Demo</a>
            <a href="#" className={styles.projectButtonSecondary}>View Code</a>
          </div>
        </div>
      </section>

      {/* Project Hero 2 - ARANEA Penetration Testing Platform */}
      <section className={styles.projectHero}>
        <div className={styles.projectHeroContent}>
          <div className={styles.projectNumber}>02</div>
          <h2 className={styles.projectTitle}>🕷️ ARANEA - AI-Powered Penetration Testing Platform</h2>
          <p className={styles.projectDescription}>
            An advanced conversational AI penetration testing platform that transforms complex security 
            workflows into natural language interactions. Simply talk to your pentesting tools through 
            an elegant terminal interface—no need to memorize command syntax. ARANEA orchestrates 
            industry-standard security tools, formats results intelligently, and generates professional 
            OWASP/PTES-compliant reports automatically.
          </p>
          
          {/* Video Demo */}
          <div className={styles.videoContainer}>
            <video 
              ref={araneaVideoRef}
              className={styles.demoVideo}
              muted 
              loop 
              playsInline
              preload="metadata"
            >
              <source src="aranea.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className={styles.projectDetails}>
            <div className={styles.detailColumn}>
              <h3>Technologies</h3>
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
              <h3>Key Features</h3>
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
          <div className={styles.projectLinks}>
            <a href="#" className={styles.projectButton}>View Live Demo</a>
            <a href="#" className={styles.projectButtonSecondary}>View Code</a>
          </div>
        </div>
      </section>

      {/* Project Hero 3 - Data Visualization Dashboard */}
      <section className={styles.projectHero}>
        <div className={styles.projectHeroContent}>
          <div className={styles.projectNumber}>03</div>
          <h2 className={styles.projectTitle}>Data Visualization Dashboard</h2>
          <p className={styles.projectDescription}>
            An interactive analytics dashboard that transforms complex data into intuitive 
            visualizations. Features real-time data streaming, customizable widgets, and 
            advanced filtering capabilities for comprehensive data analysis.
          </p>
          <div className={styles.projectDetails}>
            <div className={styles.detailColumn}>
              <h3>Technologies</h3>
              <div className={styles.techTags}>
                <span>React</span>
                <span>D3.js</span>
                <span>Python</span>
                <span>Pandas</span>
                <span>WebSocket</span>
                <span>PostgreSQL</span>
              </div>
            </div>
            <div className={styles.detailColumn}>
              <h3>Key Features</h3>
              <ul>
                <li>Real-time data streaming</li>
                <li>Interactive charts & graphs</li>
                <li>Custom report generation</li>
                <li>Export functionality</li>
              </ul>
            </div>
          </div>
          <div className={styles.projectLinks}>
            <a href="#" className={styles.projectButton}>View Live Demo</a>
            <a href="#" className={styles.projectButtonSecondary}>View Code</a>
          </div>
        </div>
      </section>

      {/* Project Hero 4 - Task Management App */}
      <section className={styles.projectHero}>
        <div className={styles.projectHeroContent}>
          <div className={styles.projectNumber}>04</div>
          <h2 className={styles.projectTitle}>Task Management App</h2>
          <p className={styles.projectDescription}>
            A collaborative project management tool designed for teams to streamline workflows. 
            Features include drag-and-drop task boards, team collaboration tools, deadline tracking, 
            and seamless integration with popular productivity apps.
          </p>
          <div className={styles.projectDetails}>
            <div className={styles.detailColumn}>
              <h3>Technologies</h3>
              <div className={styles.techTags}>
                <span>Next.js</span>
                <span>TypeScript</span>
                <span>Prisma</span>
                <span>tRPC</span>
                <span>Tailwind</span>
                <span>NextAuth</span>
              </div>
            </div>
            <div className={styles.detailColumn}>
              <h3>Key Features</h3>
              <ul>
                <li>Drag & drop interface</li>
                <li>Team collaboration</li>
                <li>Deadline notifications</li>
                <li>Third-party integrations</li>
              </ul>
            </div>
          </div>
          <div className={styles.projectLinks}>
            <a href="#" className={styles.projectButton}>View Live Demo</a>
            <a href="#" className={styles.projectButtonSecondary}>View Code</a>
          </div>
        </div>
      </section>

      {/* Contact Hero */}
      <section className={styles.contactHero}>
        <div className={styles.heroContent}>
          <h2 className={styles.contactTitle}>Let's Work Together</h2>
          <p className={styles.contactDescription}>
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </p>
          <div className={styles.contactLinks}>
            <a href="mailto:contact@example.com" className={styles.contactButton}>Email Me</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.contactButton}>GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.contactButton}>LinkedIn</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Baasil. All rights reserved.</p>
      </footer>
    </div>
  );
}
