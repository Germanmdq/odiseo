"use client"

import { useState, useEffect, useRef } from "react"


export interface TimelineItem {
  id: number
  title: string
  date: string
  content: string
  category: string
  icon: React.ElementType
  relatedIds: number[]
  status: "completed" | "in-progress" | "pending"
  energy: number
  href: string
}

interface Props {
  timelineData: TimelineItem[]
}

export default function RadialOrbitalTimeline({ timelineData }: Props) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [angle, setAngle] = useState(0)
  const [paused, setPaused] = useState(false)
  const [radius, setRadius] = useState(220)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const update = () => setRadius(Math.min(220, window.innerWidth * 0.37))
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(() => {
      setAngle((a) => (a + 0.2) % 360)
    }, 50)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused])

  const handleNodeClick = (id: number) => {
    if (activeId === id) {
      setActiveId(null)
      setPaused(false)
    } else {
      setActiveId(id)
      setPaused(true)
    }
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setActiveId(null)
      setPaused(false)
    }
  }

  const getPosition = (index: number) => {
    const total = timelineData.length
    const nodeAngle = ((index / total) * 360 + angle) % 360
    const rad = (nodeAngle * Math.PI) / 180
    const x = radius * Math.cos(rad)
    const y = radius * Math.sin(rad)
    const opacity = Math.max(0.35, Math.min(1, 0.35 + 0.65 * ((1 + Math.sin(rad)) / 2)))
    return { x, y, opacity }
  }

  const orbitSize = radius * 2

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full flex items-center justify-center bg-white"
      style={{ height: "min(600px, 90vw)" }}
    >
      {/* Órbita */}
      <div
        className="absolute rounded-full border-2 border-black/15"
        style={{ width: orbitSize, height: orbitSize }}
      />

      {/* Centro */}
      <div className="absolute flex flex-col items-center justify-center z-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-[#FF2B0A]"
          style={{ backgroundColor: "#FF2B0A" }}>
          <span className="text-white text-lg font-bold tracking-wide">O</span>
        </div>
        <span className="text-black text-[10px] font-semibold tracking-widest mt-2">ODISEO</span>
      </div>

      {/* Nodos */}
      {timelineData.map((item, index) => {
        const { x, y, opacity } = getPosition(index)
        const isActive = activeId === item.id
        const Icon = item.icon

        return (
          <div
            key={item.id}
            onClick={(e) => { e.stopPropagation(); handleNodeClick(item.id) }}
            onMouseEnter={() => { setActiveId(item.id); setPaused(true) }}
            onMouseLeave={() => { setActiveId(null); setPaused(false) }}
            className="absolute cursor-pointer"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              opacity: isActive ? 1 : opacity,
              zIndex: isActive ? 50 : 10,
              transition: "opacity 0.3s",
            }}
          >
            {/* Nodo */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${isActive
                  ? "bg-[#FF2B0A] border-[#FF2B0A] text-white scale-125"
                  : "bg-white border-black text-black"}
              `}>
                <Icon size={16} />
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? "text-[#FF2B0A]" : "text-black/60"}`}>
                {item.title}
              </span>
            </div>

            {/* Card expandida */}
            {isActive && (
              <div
                className="absolute bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_#000]"
                style={{
                  width: Math.min(240, window.innerWidth - 32),
                  top: 60,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-[#FF2B0A] text-[10px] uppercase tracking-widest font-semibold mb-1">{item.category}</p>
                <p className="text-black text-sm font-semibold mb-2">{item.title}</p>
                <p className="text-black/60 text-xs leading-relaxed">{item.content}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
