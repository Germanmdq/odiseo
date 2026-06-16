import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .maybeSingle()

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between gap-4">
          <Link href={`/${locale}/landing`} className="flex items-center gap-2 shrink-0">
            <Image src="/logo-odiseo.png" alt="Odiseo" width={28} height={28} className="rounded-full" />
            <span className="font-bold text-sm">Odiseo</span>
          </Link>
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Blog
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Volver al blog
        </Link>

        {post.tomo && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{post.tomo}</p>
        )}

        <h1 className="text-3xl md:text-4xl font-semibold leading-tight mb-6">{post.texto}</h1>

        {post.frase_neville && (
          <blockquote className="border-l-4 border-primary pl-4 my-8 italic text-muted-foreground text-lg">
            &ldquo;{post.frase_neville}&rdquo;
          </blockquote>
        )}

        <div className="max-w-none text-base leading-relaxed">
          {post.post.split("\n\n").map((paragraph: string, i: number) => (
            <p key={i} className="mb-5 text-foreground/80">
              {paragraph}
            </p>
          ))}
        </div>

        {(post.cta_title || post.cta_text) && (
          <div className="mt-12 rounded-xl border bg-card p-6 text-center">
            {post.cta_title && <h3 className="font-semibold text-lg mb-2">{post.cta_title}</h3>}
            {post.cta_text && <p className="text-muted-foreground text-sm mb-4">{post.cta_text}</p>}
            <Button asChild>
              <Link href={`/${locale}/registro`}>Acceder a Odiseo</Link>
            </Button>
          </div>
        )}

        {post.referencia && (
          <p className="text-xs text-muted-foreground mt-8 text-center">{post.referencia}</p>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from("blog_posts")
    .select("seo_title, meta_description")
    .eq("slug", slug)
    .maybeSingle()

  return {
    title: post?.seo_title ?? "Blog — Odiseo",
    description: post?.meta_description ?? "",
  }
}
