import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter } from "../ui/card";
import { resolveProductImage } from "@/hooks/use-site-settings";
import { getDiscountPercent, isFlashSaleActive } from "@/lib/product-offers";
import { Pencil, Trash2, Star, Package, Zap } from "lucide-react";
import { useState } from "react";

function AdminProductTile({
  product,
  categoryLabel,
  setFormData,
  setUploadedImageUrl,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const [imgSrc, setImgSrc] = useState(resolveProductImage(product?.image));
  const price = product?.salePrice > 0 ? product.salePrice : product?.price;
  const discount = getDiscountPercent(product);
  const flash = isFlashSaleActive(product);

  function openEdit() {
    setCurrentEditedId(product._id);
    setFormData({
      ...product,
      price: String(product.price ?? ""),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      totalStock: String(product.totalStock ?? ""),
      averageReview: product.averageReview ?? 0,
      isFeatured: product?.isFeatured ? "true" : "false",
      isFlashSale: product?.isFlashSale ? "true" : "false",
      flashSaleEndsAt: product?.flashSaleEndsAt || "",
      offerLabel: product?.offerLabel || "Flash Sale",
    });
    setUploadedImageUrl(product?.image || "");
    setOpenCreateProductsDialog(true);
  }

  return (
    <Card className="overflow-hidden border-forest/10 hover:shadow-lg transition-shadow group">
      <div className="relative aspect-[4/5] bg-leaf/40 overflow-hidden">
        <img
          src={imgSrc}
          alt={product?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc("/products/signature.jpg")}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {categoryLabel && (
            <Badge className="bg-forest/90 text-white border-0 text-[10px] font-bold uppercase">
              {categoryLabel}
            </Badge>
          )}
          {flash && (
            <Badge className="bg-red-600 text-white border-0 gap-1">
              <Zap className="w-3 h-3" /> {product?.offerLabel || "Flash Sale"}
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-gold text-white border-0 font-bold">{discount}% OFF</Badge>
          )}
        </div>
        {product?.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-white/90 text-forest border-0 gap-1">
            <Star className="w-3 h-3 fill-gold text-gold" /> Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <h2 className="font-semibold text-forest leading-snug line-clamp-2">{product?.title}</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-forest">₹{price}</span>
          {product?.salePrice > 0 && (
            <span className="text-sm line-through text-muted-foreground">₹{product.price}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" /> {product?.totalStock ?? 0} stock
          </span>
          <span className="text-[10px] uppercase tracking-wide text-gold/80">{product?.category?.replace(/-/g, " ")}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button onClick={openEdit} className="flex-1 bg-forest hover:bg-forest/90 gap-1.5" size="sm">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Button>
        <Button onClick={() => handleDelete(product._id)} variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AdminProductTile;
