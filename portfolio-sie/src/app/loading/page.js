'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './loading.module.css'

export default function LoadingPage() {
  const bootMessages = [
  "Booting system…",
  "Parsing BIOS/UEFI firmware…",
  "Initializing CPU microcode updates…",
  "Setting up memory regions…",
  "Enabling NX / XD protection…",
  "Loading initial ramdisk (initrd)…",
  "Unpacking initramfs…",
  "Mounting root filesystem…",
  "Mounting /proc pseudo-filesystem…",
  "Mounting /sys pseudo-filesystem…",
  "Mounting /dev pseudo-filesystem…",
  "Activating swap space…",
  "Loading kernel modules…",
  "Probing hardware…",
  "Detecting APIC / IO-APIC…",
  "Initializing PCI bus…",
  "Scanning PCI devices…",
  "Loading driver: intel_pch…",
  "Loading driver: ahci…",
  "Loading driver: nvme…",
  "Loading driver: ext4…",
  "Detecting block devices…",
  "Enumerating USB controllers…",
  "Detecting USB device: keyboard…",
  "Detecting USB device: mouse…",
  "Detecting USB device: storage…",
  "Creating device nodes…",
  "Running fsck on root partition…",
  "Remounting root filesystem read/write…",
  "Loading udev daemon…",
  "Applying udev rules…",
  "Triggering udev device events…",
  "Loading network drivers…",
  "Detecting network interfaces…",
  "Bringing up loop devices…",
  "Initializing random number generator…",
  "Synchronizing system clock with RTC…",
  "Mounting /run directory…",
  "Initializing D-Bus system bus…",
  "Loading kernel keyrings…",
  "Loading SELinux / AppArmor policies…",
  "Running sysctl settings…",
  "Configuring kernel parameters…",
  "Applying network sysctl settings…",
  "Loading system locale settings…",
  "Loading time zone data…",
  "Initializing audit subsystem…",
  "Starting journald / system logging…",
  "Loading system configuration…",
  "Loading service: systemd-journald…",
  "Loading service: udev.service…",
  "Loading service: systemd-udevd.service…",
  "Loading service: network.service…",
  "Loading service: ssdp.service…",
  "Loading service: avahi-daemon.service…",
  "Loading service: cron.service…",
  "Loading service: sshd.service…",
  "Loading service: firewall.service…",
  "Loading service: cups.service…",
  "Loading service: bluetooth.service…",
  "Loading service: display-manager.service…",
  "Activating scheduled timers…",
  "Enabling firewall rules…",
  "Mounting network shares…",
  "Starting user session services…",
  "Spawning login prompt / graphical session…",
  "Loading user environment…",
  "Applying user profiles and settings…",
  "Starting desktop environment…",
  "Initializing display server…",
  "Loading window manager / compositor…",
  "Starting system tray / notifications…",
  "Loading background services & daemons…",
  "Mounting Home directory…",
  "Loading user applications…",
  "Checking for updates / software upgrades…",
  "Finalizing startup tasks…",
  "Welcome to Baasil!"
];


  const [visibleTexts, setVisibleTexts] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef(null)
  const textContainerRef = useRef(null)

  useEffect(() => {
    if (currentIndex < bootMessages.length) {
      const timer = setTimeout(() => {
        setVisibleTexts(prev => [...prev, {
          text: bootMessages[currentIndex],
          id: currentIndex,
          timestamp: Date.now()
        }])
        setCurrentIndex(prev => prev + 1)
        
        // Auto-scroll immediately to keep latest text visible
        if (containerRef.current) {
          const container = containerRef.current
          // Always scroll to bottom if content exceeds viewport height
          if (container.scrollHeight > container.clientHeight) {
            container.scrollTop = container.scrollHeight
          }
        }
      }, 25) // Even faster - like real terminal

      return () => clearTimeout(timer)
    }
  }, [currentIndex, bootMessages])

  // Auto-redirect after all texts are shown with longer pause
  useEffect(() => {
    if (currentIndex >= bootMessages.length) {
      // Check if the last message is the welcome message
      const isWelcomeMessage = bootMessages[bootMessages.length - 1] === "Welcome to Baasil!"
      const pauseTime = isWelcomeMessage ? 3000 : 2000 // Extra pause for welcome message
      
      const redirectTimer = setTimeout(() => {
        // Mark that user has seen the loading page
        sessionStorage.setItem('hasSeenLoading', 'true')
        // Redirect to home page
        window.location.href = '/home'
      }, pauseTime)

      return () => clearTimeout(redirectTimer)
    }
  }, [currentIndex, bootMessages])

  return (
    <div ref={containerRef} className={styles.container}>
      <div ref={textContainerRef} className={styles.textContainer}>
        {visibleTexts.map((item, index) => (
          <div
            key={item.id}
            className={styles.cascadingText}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  )
}