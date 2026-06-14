import { useCallback, useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

export default function AudioWaveform({ url, playing, speed = 1, volume = 1, onReady, onTime }) {
  const containerRef = useRef(null)
  const waveRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  // Store callbacks in refs so they don't trigger re-creation of the WaveSurfer instance
  const onReadyRef = useRef(onReady)
  const onTimeRef = useRef(onTime)
  useEffect(() => { onReadyRef.current = onReady }, [onReady])
  useEffect(() => { onTimeRef.current = onTime }, [onTime])

  // Create and load WaveSurfer only when URL changes
  useEffect(() => {
    if (!containerRef.current || !url) return undefined

    setIsReady(false)

    const wave = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#2a2a3d',
      progressColor: '#6366f1',
      cursorColor: '#a855f7',
      height: 72,
      barWidth: 2,
      barGap: 2,
      // Use media element backend to avoid CORS issues with Cloudinary URLs
      backend: 'MediaElement',
      mediaControls: false,
    })

    wave.load(url)

    wave.on('ready', () => {
      setIsReady(true)
      onReadyRef.current?.(wave)
    })

    wave.on('timeupdate', (time) => {
      onTimeRef.current?.(time)
    })

    wave.on('error', (error) => {
      console.error('WaveSurfer error:', error)
    })

    waveRef.current = wave

    return () => {
      wave.destroy()
      waveRef.current = null
    }
  }, [url])

  // Handle play/pause — only after the wave is ready
  useEffect(() => {
    if (!waveRef.current || !isReady) return
    if (playing) {
      waveRef.current.play().catch((error) => {
        console.warn('Audio play failed:', error)
      })
    } else {
      waveRef.current.pause()
    }
  }, [playing, isReady])

  useEffect(() => {
    if (waveRef.current && isReady) {
      waveRef.current.setPlaybackRate(speed)
    }
  }, [speed, isReady])

  useEffect(() => {
    if (waveRef.current && isReady) {
      waveRef.current.setVolume(volume)
    }
  }, [volume, isReady])

  return <div className="w-full" ref={containerRef} />
}
