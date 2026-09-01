import {
  FileIcon,
  UploadCloudIcon,
  XIcon,
  Star,
  Plus,
  Video,
  Film,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Play,
} from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState, useRef } from "react";
import { Button } from "../ui/button";
import axiosInstance from "@/lib/axiosInstance";
import { useToast } from "../ui/use-toast";

function ProductImageUpload({
  images = [],
  setImages,
  primaryImage = "",
  setPrimaryImage,
  video = "",
  setVideo,
}) {
  const { toast } = useToast();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [customVideoUrl, setCustomVideoUrl] = useState("");
  const [activeTab, setActiveTab] = useState("images"); // 'images' | 'video'

  /* ── MULTI-IMAGE UPLOADER ── */
  async function handleImageFiles(files) {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    // Validate size (max 10MB per image)
    const oversized = fileList.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      toast({
        title: "Some images exceed 10MB limit",
        description: "Please upload images under 10MB each.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImages(true);
    try {
      const data = new FormData();
      fileList.forEach((file) => data.append("my_files", file));

      const response = await axiosInstance.post(
        `/api/admin/products/upload-images`,
        data,
        { withCredentials: true }
      );

      if (response?.data?.success && response.data.results?.length) {
        const newUrls = response.data.results.map((r) => r.url);
        const updatedList = [...images, ...newUrls];
        setImages(updatedList);
        if (!primaryImage && newUrls[0]) {
          setPrimaryImage(newUrls[0]);
        }
        toast({
          title: `Uploaded ${newUrls.length} image${newUrls.length > 1 ? "s" : ""} 🎉`,
        });
      } else {
        toast({ title: "Failed to upload images", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Network error during upload", variant: "destructive" });
    } finally {
      setUploadingImages(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  function handleImageFileChange(e) {
    handleImageFiles(e.target.files);
  }

  function handleImageDrop(e) {
    e.preventDefault();
    handleImageFiles(e.dataTransfer.files);
  }

  function handleRemoveImage(indexToRemove) {
    const targetUrl = images[indexToRemove];
    const updated = images.filter((_, i) => i !== indexToRemove);
    setImages(updated);

    // If removed image was primary, set new primary
    if (primaryImage === targetUrl) {
      setPrimaryImage(updated[0] || "");
    }
  }

  function handleSetPrimary(url) {
    setPrimaryImage(url);
    toast({ title: "Set as Cover Image" });
  }

  function handleAddCustomImageUrl(e) {
    e.preventDefault();
    const trimmed = customImageUrl.trim();
    if (!trimmed) return;
    const updated = [...images, trimmed];
    setImages(updated);
    if (!primaryImage) setPrimaryImage(trimmed);
    setCustomImageUrl("");
    toast({ title: "Image URL added" });
  }

  /* ── VIDEO UPLOADER ── */
  async function handleVideoFile(file) {
    if (!file) return;

    // Check size limit: max 50MB
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Video is too large",
        description: "Maximum supported video size is 50MB. Please compress your video.",
        variant: "destructive",
      });
      return;
    }

    setUploadingVideo(true);
    try {
      const data = new FormData();
      data.append("my_file", file);

      const response = await axiosInstance.post(
        `/api/admin/products/upload-video`,
        data,
        { withCredentials: true }
      );

      if (response?.data?.success && response.data.result?.url) {
        setVideo(response.data.result.url);
        toast({ title: "Product video uploaded successfully! 🎬" });
      } else {
        toast({ title: "Failed to upload video", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error uploading video", variant: "destructive" });
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  function handleVideoFileChange(e) {
    const file = e.target.files?.[0];
    if (file) handleVideoFile(file);
  }

  function handleVideoDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleVideoFile(file);
  }

  function handleRemoveVideo() {
    setVideo("");
    if (videoInputRef.current) videoInputRef.current.value = "";
    toast({ title: "Video removed" });
  }

  function handleAddCustomVideoUrl(e) {
    e.preventDefault();
    const trimmed = customVideoUrl.trim();
    if (!trimmed) return;
    setVideo(trimmed);
    setCustomVideoUrl("");
    toast({ title: "Video URL saved" });
  }

  return (
    <div className="w-full space-y-4">
      {/* Media Type Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("images")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "images"
              ? "bg-white text-forest shadow-sm"
              : "text-gray-500 hover:text-forest"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Product Images ({images.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("video")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "video"
              ? "bg-white text-forest shadow-sm"
              : "text-gray-500 hover:text-forest"
          }`}
        >
          <Video className="w-4 h-4" />
          Product Video {video ? "✓ (1)" : "(0)"}
        </button>
      </div>

      {/* ════ TAB 1: PRODUCT IMAGES ════ */}
      {activeTab === "images" && (
        <div className="space-y-4">
          {/* Gallery Grid */}
          {images.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest uppercase tracking-wider">
                  Uploaded Photos ({images.length})
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ⭐ Star icon marks the Cover Photo
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((url, idx) => {
                  const isCover = (primaryImage === url) || (!primaryImage && idx === 0);
                  return (
                    <div
                      key={`${url}-${idx}`}
                      className={`relative group rounded-xl overflow-hidden border-2 bg-white aspect-square shadow-sm transition-all ${
                        isCover ? "border-forest ring-2 ring-forest/20 shadow-md" : "border-gray-200 hover:border-forest/40"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/products/signature.jpg";
                        }}
                      />

                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute top-1.5 left-1.5 bg-forest text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-gold text-gold" /> Cover
                        </span>
                      )}

                      {/* Number Index */}
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>

                      {/* Action overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                        {!isCover && (
                          <button
                            type="button"
                            title="Set as Cover Photo"
                            onClick={() => handleSetPrimary(url)}
                            className="p-1.5 bg-white/90 text-forest rounded-lg hover:bg-white text-xs font-semibold shadow-sm transition-transform hover:scale-105"
                          >
                            <Star className="w-4 h-4 text-gold" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Delete photo"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-600 text-xs font-semibold shadow-sm transition-transform hover:scale-105"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Multi-Image Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
            className="border-2 border-dashed border-forest/30 rounded-2xl p-5 bg-leaf/20 hover:bg-leaf/40 transition-colors text-center cursor-pointer"
            onClick={() => imageInputRef.current?.click()}
          >
            <input
              id="multi-image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={imageInputRef}
              onChange={handleImageFileChange}
            />

            {uploadingImages ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <Loader2 className="w-8 h-8 text-forest animate-spin" />
                <p className="text-sm font-semibold text-forest">Uploading multiple images to Cloudinary…</p>
                <p className="text-xs text-muted-foreground">Please wait a moment</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest mb-1">
                  <UploadCloudIcon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-forest">
                  Click or drag &amp; drop to upload product photos
                </p>
                <p className="text-xs text-muted-foreground">
                  Select multiple files at once · <strong>JPG, PNG, WebP</strong> up to <strong>10MB each</strong>
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest bg-forest/10 px-2.5 py-1 rounded-full mt-1">
                  <Plus className="w-3 h-3" /> Add Multiple Images
                </span>
              </div>
            )}
          </div>

          {/* Or Paste Single Image URL */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold text-gray-600">
              Or add image by URL / local path
            </Label>
            <div className="flex gap-2">
              <Input
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://... or /products/signature.jpg"
                className="h-9 rounded-xl border-gray-200 text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomImageUrl(e);
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddCustomImageUrl}
                disabled={!customImageUrl.trim()}
                className="h-9 bg-forest hover:bg-forest/90 text-white rounded-xl text-xs font-semibold px-4 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add URL
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════ TAB 2: PRODUCT VIDEO ════ */}
      {activeTab === "video" && (
        <div className="space-y-4">
          {/* Supported size banner */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 flex items-start gap-3">
            <Film className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-blue-950">Video Upload Specs &amp; Guidelines:</p>
              <ul className="list-disc list-inside text-blue-800 space-y-0.5 text-[11px]">
                <li><strong>Max Size:</strong> 50 MB</li>
                <li><strong>Supported Formats:</strong> MP4, WebM, MOV</li>
                <li><strong>Recommended Resolution:</strong> 1080p (1920x1080) or 720p (Vertical 9:16 or Landscape 16:9)</li>
                <li><strong>Length:</strong> 15 to 60 seconds product demo / unboxing / benefits video</li>
              </ul>
            </div>
          </div>

          {/* Current Video Preview */}
          {video ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Product Video
                </span>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <XIcon className="w-3.5 h-3.5" /> Remove Video
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-forest/20 bg-black aspect-video max-h-64 shadow-md">
                <video
                  src={video}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ) : (
            /* Video Dropzone */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleVideoDrop}
              className="border-2 border-dashed border-blue-300 rounded-2xl p-6 bg-blue-50/30 hover:bg-blue-50/60 transition-colors text-center cursor-pointer"
              onClick={() => videoInputRef.current?.click()}
            >
              <input
                id="product-video-upload"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                ref={videoInputRef}
                onChange={handleVideoFileChange}
              />

              {uploadingVideo ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-sm font-semibold text-blue-900">Uploading video to Cloudinary…</p>
                  <p className="text-xs text-muted-foreground">This may take 10-30 seconds depending on file size</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-1">
                    <Video className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-blue-900">
                    Click or drag &amp; drop to upload product video
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>MP4, WebM, MOV</strong> up to <strong>50MB max</strong>
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full mt-1">
                    <Play className="w-3 h-3" /> Select Video File
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Or Paste Video URL */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold text-gray-600">
              Or paste direct video URL
            </Label>
            <div className="flex gap-2">
              <Input
                value={customVideoUrl}
                onChange={(e) => setCustomVideoUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... or https://example.com/video.mp4"
                className="h-9 rounded-xl border-gray-200 text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomVideoUrl(e);
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddCustomVideoUrl}
                disabled={!customVideoUrl.trim()}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-4 shrink-0"
              >
                Save URL
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductImageUpload;
