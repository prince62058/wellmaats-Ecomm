import React, { useState, useRef } from "react";
import {
  DYNAMIC_ICONS_MAP,
  ICON_GROUPS,
  resolveIconComponent,
} from "./dynamic-icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Upload,
  Sparkles,
  Trash2,
  Check,
  Loader2,
  Image as ImageIcon,
  Smile,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

export function IconPicker({ value, categoryId, onChange, label = "Icon" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const [customInput, setCustomInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const CurrentIcon = resolveIconComponent(value, categoryId);
  const isImage = value && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/"));
  const isEmoji = value && (value.length <= 4 || /[\uD800-\uDFFF]/.test(value)) && !DYNAMIC_ICONS_MAP[value];

  // Filter icons based on search & group
  const allIcons = ICON_GROUPS.flatMap((g) =>
    g.icons.map((item) => ({ ...item, group: g.group }))
  );

  const filteredIcons = allIcons.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.group.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = activeGroup === "All" || item.group === activeGroup;
    return matchesSearch && matchesGroup;
  });

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("my_file", file);
      const res = await axiosInstance.post("/api/admin/products/upload-image", fd);
      if (res.data?.result?.url) {
        onChange(res.data.result.url);
        setOpen(false);
      }
    } catch (err) {
      alert("Failed to upload icon image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSelectIcon(iconName) {
    onChange(iconName);
    setOpen(false);
  }

  function handleApplyCustom() {
    if (customInput.trim()) {
      onChange(customInput.trim());
      setCustomInput("");
      setOpen(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-forest/20 bg-white hover:bg-leaf/80 transition-all text-xs font-semibold text-forest shadow-sm group hover:border-forest/40"
            title="Click to change icon"
          >
            <div className="w-6 h-6 rounded-lg bg-leaf flex items-center justify-center text-forest group-hover:scale-110 transition-transform overflow-hidden">
              <CurrentIcon className="w-4 h-4 text-forest" />
            </div>
            <span className="truncate max-w-[120px]">{value || "Select Icon"}</span>
            <Sparkles className="w-3 h-3 text-gold opacity-80" />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl">
          <DialogHeader className="pb-2 border-b border-gray-100">
            <DialogTitle className="text-lg font-bold text-forest flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              Select Dynamic Icon
            </DialogTitle>
          </DialogHeader>

          {/* Search bar + custom input row */}
          <div className="space-y-3 pt-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search health, organs, wellness icons (e.g. liver, heart, bone, leaf)..."
                className="pl-10 h-10 rounded-xl bg-gray-50/80 border-gray-200 text-sm focus-visible:ring-forest"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
              {["All", ...ICON_GROUPS.map((g) => g.group)].map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setActiveGroup(grp)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                    activeGroup === grp
                      ? "bg-forest text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Grid */}
          <div className="flex-1 overflow-y-auto min-h-[260px] max-h-[340px] pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-2">
            {filteredIcons.map((item) => {
              const Comp = DYNAMIC_ICONS_MAP[item.name] || DYNAMIC_ICONS_MAP.Shield;
              const isSelected = value === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectIcon(item.name)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-forest text-white border-forest shadow-md ring-2 ring-forest/20"
                      : "bg-white hover:bg-leaf hover:border-forest/30 border-gray-100 text-gray-700"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-white/20 text-white" : "bg-leaf text-forest"
                    }`}
                  >
                    <Comp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate leading-tight">{item.name}</p>
                    <p className={`text-[10px] truncate leading-tight ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                      {item.label}
                    </p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                </button>
              );
            })}
            {filteredIcons.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
                No built-in icons found matching &ldquo;{search}&rdquo;. You can upload an image or type an emoji below!
              </div>
            )}
          </div>

          {/* Custom Upload or Custom Emoji / URL Footer */}
          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50/60 p-3 rounded-xl">
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Or paste Emoji (e.g. 🌿, 💊) or Image URL"
                className="h-9 text-xs bg-white rounded-lg border-gray-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyCustom();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleApplyCustom}
                disabled={!customInput.trim()}
                className="h-9 px-3 text-xs border-forest/20 text-forest hover:bg-forest hover:text-white"
              >
                Apply
              </Button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-9 text-xs border-forest/20 bg-white text-forest hover:bg-leaf flex items-center gap-1.5"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Upload Custom Image</span>
              </Button>

              {value && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="h-9 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Reset to default icon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default IconPicker;
