import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'

export default function AudioWaveform({ url, playing, speed = 1, volume = 1, onReady, onTime }) {
  const containerRef = useRef(null)
  const waveRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !url) return undefined

    const wave = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#2a2a3d',
      progressColor: '#6366f1',
      cursorColor: '#a855f7',
      height: 72,
      barWidth: 2,
      barGap: 2,
    })

    wave.load(url)
    wave.on('ready', () => onReady?.(wave))
    wave.on('timeupdate', (time) => onTime?.(time))
    waveRef.current = wave

    return () => wave.destroy()
  }, [onReady, onTime, url])

  useEffect(() => {
    if (!waveRef.current) return
    if (playing) waveRef.current.play()
    else waveRef.current.pause()
  }, [playing])

  useEffect(() => {
    waveRef.current?.setPlaybackRate(speed)
  }, [speed])

  useEffect(() => {
    waveRef.current?.setVolume(volume)
  }, [volume])

  return <div className="w-full" ref={containerRef} />
}
