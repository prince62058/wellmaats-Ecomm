import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  previewUrl,
}) {
  const inputRef = useRef(null);
  const displayUrl = uploadedImageUrl || previewUrl;

  function handleImageFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setImageFile(selectedFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setUploadedImageUrl("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function uploadImageToCloudinary() {
    if (!imageFile) return;
    setImageLoadingState(true);
    const data = new FormData();
    data.append("my_file", imageFile);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/products/upload-image`,
        data,
        { withCredentials: true }
      );
      if (response?.data?.success) {
        setUploadedImageUrl(response.data.result.url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null) uploadImageToCloudinary();
  }, [imageFile]);

  return (
    <div className="w-full space-y-3">
      {displayUrl && (
        <div className="relative rounded-xl overflow-hidden border border-forest/10 bg-leaf/30">
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-48 object-contain"
            onError={(e) => { e.target.src = "/products/signature.jpg"; }}
          />
          {uploadedImageUrl && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 h-8"
              onClick={handleRemoveImage}
            >
              <XIcon className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-forest/20 rounded-xl p-4 bg-leaf/20 hover:bg-leaf/40 transition-colors"
      >
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
        />
        {!imageFile ? (
          <Label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center h-24 cursor-pointer"
          >
            <UploadCloudIcon className="w-8 h-8 text-forest/50 mb-2" />
            <span className="text-sm text-muted-foreground">Drag & drop or click to upload</span>
            <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
          </Label>
        ) : imageLoadingState ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileIcon className="w-7 h-7 text-forest shrink-0" />
              <p className="text-sm font-medium truncate">{imageFile.name}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={handleRemoveImage}>
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductImageUpload;
