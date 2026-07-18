import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Eye, BookOpen, Clock, Globe, Lock } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

const EMPTY = { title: "", slug: "", excerpt: "", content: "", image: "", category: "wellness", tags: "", author: "Mother Tatwa Team", readTime: 3, isPublished: false };

function AdminBlogs() {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function load() {
    setLoading(true);
    try { const r = await axiosInstance.get("/api/admin/blog"); setBlogs(r.data?.data || []); }
    catch { setBlogs([]); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(EMPTY); setSheetOpen(true); }
  function openEdit(b) {
    setEditing(b._id);
    setForm({ ...b, tags: (b.tags || []).join(", ") });
    setSheetOpen(true);
  }

  async function handleSave() {
    if (!form.title) return toast({ title: "Title required", variant: "destructive" });
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [] };
      if (editing) await axiosInstance.put(`/api/admin/blog/${editing}`, payload);
      else await axiosInstance.post("/api/admin/blog", payload);
      toast({ title: editing ? "Blog updated!" : "Blog created!" });
      setSheetOpen(false);
      load();
    } catch (e) {
      toast({ title: e?.response?.data?.message || "Error saving blog", variant: "destructive" });
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this blog?")) return;
    await axiosInstance.delete(`/api/admin/blog/${id}`);
    toast({ title: "Blog deleted" });
    load();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-forest flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Blog Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{blogs.length} articles total</p>
        </div>
        <Button onClick={openNew} className="bg-forest hover:bg-forest/90 text-white rounded-xl gap-2">
          <Plus className="w-4 h-4" /> New Blog
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-20 rounded-xl bg-leaf/20 animate-pulse" />)}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          No blogs yet. Create your first article!
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((b) => (
            <div key={b._id} className="bg-white border border-forest/10 rounded-xl p-4 flex items-start gap-4">
              {b.image && <img src={b.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-forest text-sm truncate">{b.title}</h3>
                  {b.isPublished
                    ? <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-1 shrink-0"><Globe className="w-2.5 h-2.5" />Published</Badge>
                    : <Badge variant="secondary" className="text-[10px] gap-1 shrink-0"><Lock className="w-2.5 h-2.5" />Draft</Badge>
                  }
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="capitalize">{b.category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.readTime}min</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{b.views || 0} views</span>
                </div>
                {b.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{b.excerpt}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(b._id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto p-6">
          <SheetHeader className="mb-6">
            <SheetTitle>{editing ? "Edit Blog" : "Create New Blog"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Title *</Label>
                <Input placeholder="Blog title..." value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Slug (auto-generated if blank)</Label>
                <Input placeholder="my-blog-slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Input placeholder="wellness" value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Author</Label>
                <Input value={form.author} onChange={(e) => set("author", e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Read Time (minutes)</Label>
                <Input type="number" min={1} value={form.readTime} onChange={(e) => set("readTime", Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label>Cover Image URL</Label>
                <Input placeholder="https://... or /products/..." value={form.image} onChange={(e) => set("image", e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input placeholder="ayurveda, immunity, herbs" value={form.tags} onChange={(e) => set("tags", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Excerpt (short summary)</Label>
              <Textarea rows={2} placeholder="A brief description..." value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Content (HTML supported)</Label>
              <Textarea rows={10} placeholder="<p>Write your article here...</p>" value={form.content} onChange={(e) => set("content", e.target.value)} className="mt-1 font-mono text-xs" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
              <input type="checkbox" id="published" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="w-4 h-4 accent-forest cursor-pointer" />
              <Label htmlFor="published" className="cursor-pointer">
                {form.isPublished ? "Published (visible to users)" : "Draft (not visible)"}
              </Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-forest hover:bg-forest/90 text-white rounded-xl flex-1">
                {saving ? "Saving..." : editing ? "Update Blog" : "Create Blog"}
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(false)} className="rounded-xl">Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AdminBlogs;
