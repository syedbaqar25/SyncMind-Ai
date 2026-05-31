import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { ArrowDown, Play } from 'lucide-react'
import { Button } from '../ui/Button'

const phrases = ['AI-powered transcription.', 'Auto-extracted action items.', 'Zero effort.']

function useTypewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [text, setText] = useState('')

  useEffect(() => {
    const phrase = phrases[phraseIndex]
    let index = 0
    const typing = setInterval(() => {
      setText(phrase.slice(0, index + 1))
      index += 1
      if (index === phrase.length) {
        clearInterval(typing)
        setTimeout(() => {
          setPhraseIndex((current) => (current + 1) % phrases.length)
          setText('')
        }, 1400)
      }
    }, 45)

    return () => clearInterval(typing)
  }, [phraseIndex])

  return text
}

export default function HeroSection() {
  const canvasRef = useRef(null)
  const headlineRef = useRef(null)
  const typed = useTypewriter()

  useEffect(() => {
    const words = headlineRef.current?.querySelectorAll('span')
    if (words?.length) {
      gsap.fromTo(words, { opacity: 0, y: 28 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' })
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    const mouse = new THREE.Vector2(0, 0)
    const particles = []
    const particleCount = 200
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = []

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.position.z = 80

    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 180
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80
      velocities.push({ x: (Math.random() - 0.5) * 0.045, y: (Math.random() - 0.5) * 0.045, z: (Math.random() - 0.5) * 0.02 })
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({ color: '#6366f1', size: 2, transparent: true, opacity: 0.85 })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const lineGeometry = new THREE.BufferGeometry()
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#6366f1', transparent: true, opacity: 0.18 })
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(lines)

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth - 0.5) * 2
      mouse.y = -(event.clientY / window.innerHeight - 0.5) * 2
    }
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', onResize)

    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const linePositions = []

      for (let i = 0; i < particleCount; i += 1) {
        const idx = i * 3
        positions[idx] += velocities[i].x + mouse.x * 0.005
        positions[idx + 1] += velocities[i].y + mouse.y * 0.005
        positions[idx + 2] += velocities[i].z

        if (Math.abs(positions[idx]) > 95) velocities[i].x *= -1
        if (Math.abs(positions[idx + 1]) > 55) velocities[i].y *= -1
        if (Math.abs(positions[idx + 2]) > 45) velocities[i].z *= -1
      }

      for (let i = 0; i < particleCount; i += 1) {
        for (let j = i + 1; j < particleCount; j += 1) {
          const ax = positions[i * 3]
          const ay = positions[i * 3 + 1]
          const az = positions[i * 3 + 2]
          const bx = positions[j * 3]
          const by = positions[j * 3 + 1]
          const bz = positions[j * 3 + 2]
          const distance = Math.hypot(ax - bx, ay - by, az - bz)
          if (distance < 24) linePositions.push(ax, ay, az, bx, by, bz)
        }
      }

      geometry.attributes.position.needsUpdate = true
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
      points.rotation.y += 0.0008
      lines.rotation.y = points.rotation.y
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      lineGeometry.dispose()
      material.dispose()
      lineMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  const words = ['Stop', 'Taking', 'Notes.', 'Start', 'Understanding', 'Meetings.']

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pt-16 sm:px-5 sm:pt-20">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.14),transparent_46%)]" />
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <h1 ref={headlineRef} className="font-heading text-3xl font-bold leading-[1.08] text-white sm:text-5xl md:text-7xl">
          {words.map((word, index) => (
            <span className="mr-3 inline-block" key={word}>{word}{index === 2 ? <br /> : null}</span>
          ))}
        </h1>
        <p className="mx-auto mt-4 min-h-7 max-w-2xl font-mono text-sm text-textSecondary sm:mt-6 sm:min-h-8 sm:text-lg">
          {typed}<span className="animate-pulse text-primary">|</span>
        </p>
        <motion.div className="mt-6 flex flex-col justify-center gap-3 sm:mt-9 sm:flex-row sm:gap-4" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Link to="/register"><Button className="w-full sm:w-auto">Get Started Free</Button></Link>
          <Button variant="ghost" type="button"><Play size={18} /> Watch Demo</Button>
        </motion.div>
      </div>
      <ArrowDown className="absolute bottom-4 z-10 animate-bounce text-primary sm:bottom-8" size={24} />
    </section>
  )
}
