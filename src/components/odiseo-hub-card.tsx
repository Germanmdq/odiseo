import Image from "next/image"
import Link from "next/link"
import { ArrowRight, type LucideIcon } from "lucide-react"

type OdiseoHubCardProps = {
  title: string
  desc: string
  href: string
  icon: LucideIcon
  image?: string
  kicker?: string
  compact?: boolean
  priority?: boolean
}

export function OdiseoHubCard({
  title,
  desc,
  href,
  icon: Icon,
  image,
  kicker,
  compact = false,
  priority = false,
}: OdiseoHubCardProps) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex overflow-hidden transition-all duration-200 hover:-translate-y-0.5",
        compact ? "min-h-[132px] p-4" : "min-h-[172px] p-5",
        "rounded-[20px] bg-white shadow-[0_4px_6px_rgba(0,0,0,0.07),0_10px_15px_rgba(0,0,0,0.1),0_20px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_12px_rgba(0,0,0,0.1),0_20px_40px_rgba(0,0,0,0.15),0_40px_80px_rgba(0,0,0,0.1)]",
        !image && "border border-[#EEEEEE]",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ willChange: "transform" }}
    >
      {/* Radial accent glow for cards WITHOUT image */}
      {!image && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_48%,rgba(255,43,10,0.08),transparent_60%)]" />
      )}

      {/* Bauhaus illustration on the right side for cards WITH image */}
      {image && (
        <div className="absolute right-0 top-0 bottom-0 w-[50%] pointer-events-none">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 50vw"
            className="object-contain object-right-bottom"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        </div>
      )}

      {/* Card content — always black text on white */}
      <div className="relative flex h-full w-full flex-col">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-white/80 text-[#FF2B0A]">
          <Icon className="size-5" />
        </div>

        <div className={`mt-auto ${image ? "max-w-[55%]" : ""}`}>
          {kicker ? (
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF2B0A]">
              {kicker}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-black">{title}</h2>
            <ArrowRight className="size-4 transition group-hover:translate-x-1 text-black/40 group-hover:text-black" />
          </div>
          <p className="mt-2 line-clamp-3 max-w-xl text-sm leading-6 text-black/60">
            {desc}
          </p>
        </div>
      </div>
    </Link>
  )
}
