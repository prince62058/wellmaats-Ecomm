import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Tag, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import ScrollReveal from "@/components/shopping-view/home/ScrollReveal";

const CATEGORIES = [
  { id: "all", label: "All Articles" },
  { id: "wellness", label: "Wellness Tips" },
  { id: "ayurveda", label: "Ayurveda" },
  { id: "immunity", label: "Immunity" },
  { id: "digestive", label: "Digestive Health" },
  { id: "women", label: "Women's Health" },
  { id: "lifestyle", label: "Healthy Lifestyle" },
];

function BlogCard({ blog }) {
  return (
    <Link to={`/blogs/${blog.slug}`} className="group block bg-white rounded-2xl border border-forest/10 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[16/9] overflow-hidden bg-leaf/30">
        {blog.image ? (
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest/10 to-gold/10">
            <BookOpen className="w-10 h-10 text-forest/30" />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{blog.category || "Wellness"}</span>
          <span className="text-forest/20">•</span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {blog.readTime || 3} min read
          </span>
        </div>
        <h3 className="font-display font-bold text-forest text-base leading-snug mb-2 line-clamp-2 group-hover:text-gold transition-colors">
          {blog.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{blog.excerpt}</p>
        <div className="flex items-center gap-1 text-sm font-semibold text-forest group-hover:text-gold transition-colors">
          Read More <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    axiosInstance.get("/api/shop/blog")
      .then((r) => setBlogs(r.data?.data || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = blogs.filter((b) => {
    const matchCat = activeCategory === "all" || b.category === activeCategory;
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-forest/95 to-emerald-700 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Knowledge Hub</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Blogs & Articles</h1>
          <p className="text-white/75 text-sm mb-6">Expert Ayurvedic wisdom for your wellness journey.</p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/50" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-white text-forest border-0 focus-visible:ring-gold"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                activeCategory === c.id ? "bg-forest text-white border-forest" : "bg-white text-forest/70 border-forest/20 hover:border-forest"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="rounded-2xl border border-forest/10 overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-leaf/40" />
                <div className="p-5 space-y-2">
                  <div className="h-3 bg-leaf/40 rounded w-1/3" />
                  <div className="h-5 bg-leaf/40 rounded" />
                  <div className="h-4 bg-leaf/20 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filtered.map((blog, i) => (
              <ScrollReveal key={blog._id} delay={i * 50}>
                <BlogCard blog={blog} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-forest/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No articles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Blogs;
