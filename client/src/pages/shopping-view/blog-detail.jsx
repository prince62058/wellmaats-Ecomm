import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Eye, Tag, Calendar, BookOpen } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`/api/shop/blog/${slug}`)
      .then((r) => setBlog(r.data?.data || null))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl mx-auto px-4">
          <div className="h-8 bg-leaf/40 rounded w-3/4" />
          <div className="h-4 bg-leaf/30 rounded w-1/2" />
          <div className="h-64 bg-leaf/20 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <BookOpen className="w-12 h-12 text-forest/20" />
        <h2 className="font-display text-xl font-bold text-forest">Article Not Found</h2>
        <Link to="/blogs" className="text-sm text-gold font-semibold hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero image */}
      {blog.image && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back */}
        <Link to="/blogs" className="inline-flex items-center gap-1.5 text-sm text-forest/60 hover:text-forest mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" /> {blog.category || "Wellness"}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {blog.readTime || 3} min read
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {blog.views || 0} views
          </span>
          {blog.publishedAt && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl md:text-4xl font-bold text-forest leading-tight mb-4">
          {blog.title}
        </h1>

        <p className="text-base text-forest/60 mb-1">By {blog.author || "Mother Tatwa Team"}</p>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-base text-muted-foreground border-l-4 border-gold pl-4 py-2 bg-leaf/20 rounded-r-xl mb-6">
            {blog.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-green max-w-none text-forest/80 leading-relaxed
            prose-headings:font-display prose-headings:text-forest
            prose-a:text-gold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-forest"
          dangerouslySetInnerHTML={{ __html: blog.content || "<p>Content coming soon...</p>" }}
        />

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-forest/10">
            {blog.tags.map((tag, i) => (
              <span key={i} className="text-xs font-medium text-forest/60 bg-leaf/50 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-forest to-emerald-700 rounded-2xl p-6 text-white text-center">
          <p className="font-display text-lg font-bold mb-2">Ready to Start Your Wellness Journey?</p>
          <p className="text-white/75 text-sm mb-4">Explore our authentic Ayurvedic drops, crafted from 35+ herbs.</p>
          <Link to="/shop/listing" className="inline-block bg-gold hover:bg-gold/90 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors">
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;
