import { useCallback, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import AudioWaveform from '../shared/AudioWaveform'
import { formatDuration } from '../../utils/formatters'

export default function MeetingPlayer({ url, onTime, onWaveReady }) {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [volume, setVolume] = useState(1)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)

  // Memoize callbacks so they don't change on every render
  const handleReady = useCallback((wave) => {
    setDuration(wave.getDuration())
    onWaveReady?.(wave)
  }, [onWaveReady])

  const handleTime = useCallback((time) => {
    setCurrent(time)
    onTime?.(time)
  }, [onTime])

  return (
    <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center">
        <button className="grid h-12 w-12 place-items-center rounded-full bg-primary text-white" onClick={() => setPlaying((value) => !value)} type="button">
          {playing ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <div className="min-w-0 flex-1">
          <AudioWaveform
            url={url}
            playing={playing}
            speed={speed}
            volume={volume}
            onReady={handleReady}
            onTime={handleTime}
          />
          <div className="mt-1 flex justify-between font-mono text-xs text-textSecondary">
            <span>{formatDuration(current)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
        <select className="rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
          {[0.5, 1, 1.5, 2].map((value) => <option key={value} value={value}>{value}x</option>)}
        </select>
        <input className="w-28 accent-primary" max="1" min="0" step="0.05" type="range" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
      </div>
    </div>
  )
}
