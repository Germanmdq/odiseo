import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Blog — Las enseñanzas de Neville Goddard | Odiseo",
  description: "30 conferencias de Neville Goddard explicadas. Una práctica que transforma.",
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, seo_title, meta_description, tomo, frase_neville")
    .eq("publicado", true)
    .order("id")

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between gap-4">
          <Link href={`/${locale}/landing`} className="flex items-center gap-2 shrink-0">
            <Image src="/logo-odiseo.png" alt="Odiseo" width={28} height={28} className="rounded-full" />
            <span className="font-bold text-sm">Odiseo</span>
          </Link>
          <Link
            href={`/${locale}/landing`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Inicio
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Blog</p>
          <h1 className="text-4xl font-semibold">Las enseñanzas de Neville</h1>
          <p className="text-muted-foreground mt-3 text-lg">30 conferencias explicadas. Una práctica que transforma.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {posts?.map((post) => (
            <Link
              key={post.id}
              href={`/${locale}/blog/${post.slug}`}
              className="group rounded-xl border bg-card p-6 hover:border-primary/50 transition-colors"
            >
              {post.tomo && (
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">{post.tomo}</p>
              )}
              <h2 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors mb-2">
                {post.seo_title}
              </h2>
              {post.frase_neville && (
                <p className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-3">
                  &ldquo;{post.frase_neville}&rdquo;
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
