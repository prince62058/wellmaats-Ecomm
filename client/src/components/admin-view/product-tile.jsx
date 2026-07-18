import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { resolveProductImage } from "@/hooks/use-site-settings";
import { getDiscountPercent, isFlashSaleActive } from "@/lib/product-offers";
import { Pencil, Trash2, Star, Package, Zap, TrendingDown } from "lucide-react";
import { useState } from "react";

function AdminProductTile({
  product, categoryLabel,
  setFormData, setUploadedImageUrl,
  setOpenCreateProductsDialog, setCurrentEditedId,
  handleDelete,
}) {
  const [imgSrc, setImgSrc] = useState(resolveProductImage(product?.image));
  const price    = product?.salePrice > 0 ? product.salePrice : product?.price;
  const discount = getDiscountPercent(product);
  const flash    = isFlashSaleActive(product);
  const lowStock = product?.totalStock > 0 && product?.totalStock <= 10;
  const noStock  = product?.totalStock === 0;

  function openEdit() {
    setCurrentEditedId(product._id);
    setFormData({
      ...product,
      price:         String(product.price ?? ""),
      salePrice:     product.salePrice ? String(product.salePrice) : "",
      totalStock:    String(product.totalStock ?? ""),
      averageReview: product.averageReview ?? 0,
      isFeatured:    product?.isFeatured  ? "true" : "false",
      isFlashSale:   product?.isFlashSale ? "true" : "false",
      flashSaleEndsAt: product?.flashSaleEndsAt || "",
      offerLabel:    product?.offerLabel || "Flash Sale",
    });
    setUploadedImageUrl(product?.image || "");
    setOpenCreateProductsDialog(true);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-forest/20 transition-all overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        <img src={imgSrc} alt={product?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc("/products/signature.jpg")} />

        {/* Overlay badges — top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {flash && (
            <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Zap className="w-2.5 h-2.5" /> {product?.offerLabel || "Flash"}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          )}
          {categoryLabel && (
            <span className="bg-forest/85 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
              {categoryLabel}
            </span>
          )}
        </div>

        {/* Featured badge — top right */}
        {product?.isFeatured && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 text-gold text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            <Star className="w-2.5 h-2.5 fill-gold" /> Featured
          </span>
        )}

        {/* Stock overlay — bottom */}
        {(noStock || lowStock) && (
          <div className={`absolute bottom-0 inset-x-0 text-center text-[10px] font-bold py-1 ${noStock ? "bg-red-500/90 text-white" : "bg-amber-400/90 text-white"}`}>
            {noStock ? "OUT OF STOCK" : `LOW STOCK · ${product.totalStock} left`}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h2 className="font-bold text-forest text-sm leading-snug line-clamp-2 mb-2">{product?.title}</h2>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-forest">₹{price?.toLocaleString("en-IN")}</span>
          {product?.salePrice > 0 && product?.price > product?.salePrice && (
            <span className="text-xs line-through text-muted-foreground">₹{product.price}</span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" /> {product?.totalStock ?? 0} units
          </span>
          <span className="capitalize text-gold font-medium">{product?.brand || ""}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={openEdit}
            className="flex-1 flex items-center justify-center gap-1.5 bg-forest text-white text-xs font-bold py-2 rounded-xl hover:bg-forest/90 transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => handleDelete(product._id)}
            className="w-9 flex items-center justify-center border border-red-100 text-red-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminProductTile;
