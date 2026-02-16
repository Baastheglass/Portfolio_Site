'use client'

import dynamic from 'next/dynamic'
import styles from "./page.module.css";

const VintageComputer = dynamic(() => import('./components/VintageComputer'), {
  ssr: false,
  loading: () => <div className={styles.canvasLoader}>Loading 3D Scene...</div>
})

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Main Hero - Introduction */}
      <section className={styles.hero}>
        <div className={styles.canvasContainer}>
          <VintageComputer />
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
          <h2 className={styles.projectTitle}>AI Chat Application</h2>
          <p className={styles.projectDescription}>
            An intelligent conversational AI powered by advanced RAG (Retrieval-Augmented Generation) 
            technology and large language models. Features real-time responses, context-aware conversations, 
            and seamless integration with knowledge bases.
          </p>
          <div className={styles.projectDetails}>
            <div className={styles.detailColumn}>
              <h3>Technologies</h3>
              <div className={styles.techTags}>
                <span>React</span>
                <span>Next.js</span>
                <span>Python</span>
                <span>FastAPI</span>
                <span>Haystack</span>
                <span>LLMs</span>
              </div>
            </div>
            <div className={styles.detailColumn}>
              <h3>Key Features</h3>
              <ul>
                <li>Real-time AI responses</li>
                <li>Context-aware conversations</li>
                <li>Terminal-style interface</li>
                <li>Seamless backend integration</li>
              </ul>
            </div>
          </div>
          <div className={styles.projectLinks}>
            <a href="#" className={styles.projectButton}>View Live Demo</a>
            <a href="#" className={styles.projectButtonSecondary}>View Code</a>
          </div>
        </div>
      </section>

      {/* Project Hero 2 - E-Commerce Platform */}
      <section className={styles.projectHero}>
        <div className={styles.projectHeroContent}>
          <div className={styles.projectNumber}>02</div>
          <h2 className={styles.projectTitle}>E-Commerce Platform</h2>
          <p className={styles.projectDescription}>
            A full-featured e-commerce solution with modern UI/UX, secure payment processing, 
            inventory management, and real-time order tracking. Built with scalability and 
            performance in mind to handle thousands of concurrent users.
          </p>
          <div className={styles.projectDetails}>
            <div className={styles.detailColumn}>
              <h3>Technologies</h3>
              <div className={styles.techTags}>
                <span>Next.js</span>
                <span>Node.js</span>
                <span>MongoDB</span>
                <span>Stripe</span>
                <span>Redis</span>
                <span>AWS</span>
              </div>
            </div>
            <div className={styles.detailColumn}>
              <h3>Key Features</h3>
              <ul>
                <li>Secure payment gateway</li>
                <li>Real-time inventory sync</li>
                <li>Advanced search & filters</li>
                <li>Order tracking system</li>
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
