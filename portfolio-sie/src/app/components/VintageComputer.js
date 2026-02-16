'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Text } from '@react-three/drei'
import * as THREE from 'three'

function MacintoshComputer() {
  const computerRef = useRef()
  const codeRef = useRef()
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    timeRef.current += delta
    
    // Bob up and down animation
    if (computerRef.current) {
      computerRef.current.position.y = Math.sin(timeRef.current * 1.5) * 0.15
    }
    
    // Scroll the code text
    if (codeRef.current) {
      codeRef.current.position.y = ((timeRef.current * 0.3) % 2) - 1
    }
  })

  return (
    <group ref={computerRef} position={[0, 0, 0]} scale={1.8}>
      {/* Monitor - Box on top */}
      <group position={[0, 0.8, 0]}>
        {/* Monitor Body - Beige/Cream */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 1.6, 1.4]} />
          <meshStandardMaterial color="#F5F5DC" roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Screen Frame - Dark bezel */}
        <mesh position={[0, 0.05, 0.71]} castShadow>
          <boxGeometry args={[1.6, 1.3, 0.05]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Black Screen */}
        <mesh position={[0, 0.05, 0.74]}>
          <boxGeometry args={[1.5, 1.2, 0.02]} />
          <meshStandardMaterial 
            color="#000000" 
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Code Text on Screen */}
        <group ref={codeRef} position={[0, 0.05, 0.76]}>
          <Text
            position={[-0.6, 0.5, 0]}
            fontSize={0.045}
            color="#00ff00"
            anchorX="left"
            anchorY="top"
            maxWidth={1.3}
            font="/fonts/monospace.woff"
          >
            {`function init() {
  const scene = new THREE.Scene()
  const camera = new PerspectiveCamera()
  renderer.render(scene, camera)
}

class Portfolio {
  constructor() {
    this.projects = []
    this.skills = ['React', 'Three.js']
  }
  
  render() {
    return this.projects.map(p => p.show())
  }
}

const app = new Portfolio()
app.init()
console.log('System ready...')`}
          </Text>
        </group>

        {/* Ventilation slots on top */}
        {[...Array(6)].map((_, i) => (
          <mesh key={`vent-top-${i}`} position={[-0.6 + i * 0.2, 0.8, 0.3]} castShadow>
            <boxGeometry args={[0.15, 0.03, 0.6]} />
            <meshStandardMaterial color="#333333" roughness={0.8} />
          </mesh>
        ))}

        {/* Floppy Drive Slot */}
        <mesh position={[0, -0.5, 0.71]} castShadow>
          <boxGeometry args={[0.6, 0.08, 0.03]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>

        {/* Power indicator LED */}
        <mesh position={[-0.7, -0.7, 0.71]} castShadow>
          <circleGeometry args={[0.03, 16]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00" 
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Keyboard Base - Below monitor */}
      <group position={[0, -0.5, 0.2]}>
        {/* Main keyboard body */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 0.25, 1]} />
          <meshStandardMaterial color="#E8DCC4" roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Keys */}
        {[...Array(40)].map((_, i) => {
          const row = Math.floor(i / 10)
          const col = i % 10
          return (
            <mesh 
              key={i} 
              position={[
                -0.75 + col * 0.16,
                0.14,
                -0.35 + row * 0.16
              ]}
              castShadow
            >
              <boxGeometry args={[0.13, 0.08, 0.13]} />
              <meshStandardMaterial color="#F5F5DC" roughness={0.3} metalness={0.2} />
            </mesh>
          )
        })}

        {/* Spacebar */}
        <mesh position={[0, 0.14, 0.35]} castShadow>
          <boxGeometry args={[0.8, 0.08, 0.13]} />
          <meshStandardMaterial color="#F5F5DC" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Keyboard feet */}
        <mesh position={[-0.7, -0.13, -0.4]} castShadow>
          <boxGeometry args={[0.1, 0.02, 0.1]} />
          <meshStandardMaterial color="#C4B5A0" roughness={0.6} />
        </mesh>
        <mesh position={[0.7, -0.13, -0.4]} castShadow>
          <boxGeometry args={[0.1, 0.02, 0.1]} />
          <meshStandardMaterial color="#C4B5A0" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

      {/* Enhanced lighting for better visibility */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[3, 4, 5]} 
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3, 2, 3]} intensity={0.5} color="#4a7ba7" />
      <pointLight position={[0, 1, 3]} intensity={0.4} color="#00ff88" />
      <spotLight
        position={[0, 3, 3]}
        angle={0.6}
        penumbra={0.5}
        intensity={0.8}
        color="#e3f2fd"
        castShadow
      />

      {/* The Macintosh Computer */}
      <MacintoshComputer />

      {/* Simple ground plane for depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial 
          color="#05101a" 
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  )
}

export default function VintageComputer() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  )
}
