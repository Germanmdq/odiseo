import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getTranslations } from "next-intl/server"
import { getLocale } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"

type BlogPost = {
  id: number
  slug: string
  texto: string
  tomo: string | null
  frase_neville: string | null
}

export async function BlogSection() {
  const t = await getTranslations("landing.blog")
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, texto, tomo, frase_neville")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
    .limit(3)

  if (!posts || posts.length === 0) return null

  return (
    <section id="blog" className="py-24 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">{t("badge")}</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {(posts as BlogPost[]).map(post => (
            <div
              key={post.id}
              className="flex flex-col gap-3 rounded-[20px] p-6"
              style={{ background: "#F7F7F7", boxShadow: "0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.08)" }}
            >
              {post.tomo && (
                <p className="text-xs tracking-widest uppercase" style={{ color: "#FF2B0A" }}>
                  {post.tomo}
                </p>
              )}
              <Link href={`/${locale}/blog/${post.slug}`}>
                <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                  {post.texto}
                </h3>
              </Link>
              {post.frase_neville && (
                <p className="text-sm italic line-clamp-3" style={{ color: "#555555" }}>
                  &ldquo;{post.frase_neville}&rdquo;
                </p>
              )}
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline mt-auto"
                style={{ color: "#FF2B0A" }}
              >
                {t("learnMore")}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
