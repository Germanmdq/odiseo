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
        compact ? "min-h-[118px] p-4 sm:min-h-[132px]" : "min-h-[150px] p-4 sm:min-h-[172px] sm:p-5",
        "rounded-2xl border border-black/10 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.09)] hover:shadow-[0_8px_12px_rgba(0,0,0,0.1),0_20px_40px_rgba(0,0,0,0.15),0_40px_80px_rgba(0,0,0,0.1)] sm:rounded-[20px]",
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
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[38%] sm:w-[50%]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 50vw"
            className="object-contain object-right-bottom opacity-95"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        </div>
      )}

      {/* Card content — always black text on white */}
      <div className="relative flex h-full w-full flex-col">
        <div className="flex size-8 items-center justify-center rounded-xl bg-white/80 text-[#FF2B0A] sm:size-10 sm:rounded-2xl">
          <Icon className="size-4 sm:size-5" />
        </div>

        <div className={`mt-4 sm:mt-auto ${image ? "max-w-[68%] sm:max-w-[55%]" : ""}`}>
          {kicker ? (
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#FF2B0A] sm:tracking-[0.18em]">
              {kicker}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-black sm:text-xl">{title}</h2>
            <ArrowRight className="size-4 transition group-hover:translate-x-1 text-black/40 group-hover:text-black" />
          </div>
          <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-5 text-black/60 sm:line-clamp-3 sm:leading-6">
            {desc}
          </p>
        </div>
      </div>
    </Link>
  )
}
