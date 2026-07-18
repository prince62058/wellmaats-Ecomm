import AdminProductTile from "@/components/admin-view/product-tile";
import AdminProductForm from "@/components/admin-view/product-form";
import { AdminPageHeader, AdminStatCards, Package, ShoppingBag, Star, AlertTriangle } from "@/components/admin-view/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { useSiteSettings } from "@/hooks/use-site-settings";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Plus, Search } from "lucide-react";
import { getDiscountPercent } from "@/lib/product-offers";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: "",
  title: "",
  description: "",
  ingredients: "",
  benefits: "",
  howToUse: "",
  dosage: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 4.5,
  isFeatured: "false",
  isFlashSale: "false",
  flashSaleEndsAt: "",
  offerLabel: "Flash Sale",
};

function AdminProducts() {
  const [openSheet, setOpenSheet] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const { productList } = useSelector((state) => state.adminProducts);
  const { productCategories, categoryOptionsMap } = useSiteSettings();
  const { brands } = useSiteSettings();
  const dispatch = useDispatch();
  const { toast } = useToast();

  function resetForm() {
    setFormData(initialFormData);
    setImageFile(null);
    setUploadedImageUrl("");
    setCurrentEditedId(null);
  }

  function openAdd() {
    resetForm();
    setOpenSheet(true);
  }

  function closeSheet() {
    setOpenSheet(false);
    resetForm();
  }

  function preparePayload(data) {
    const image = uploadedImageUrl || data.image || "";
    return {
      ...data,
      image,
      isFeatured: data.isFeatured === true || data.isFeatured === "true",
      isFlashSale: data.isFlashSale === true || data.isFlashSale === "true",
      flashSaleEndsAt: data.flashSaleEndsAt || null,
      offerLabel: data.offerLabel || "Flash Sale",
      salePrice: data.salePrice === "" ? 0 : Number(data.salePrice),
      price: Number(data.price),
      totalStock: Number(data.totalStock),
      averageReview: Number(data.averageReview) || 0,
    };
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const payload = preparePayload(formData);

    if (currentEditedId !== null) {
      const result = await dispatch(editProduct({ id: currentEditedId, formData: payload }));
      if (result?.payload?.success) {
        toast({ title: "Product updated successfully" });
        dispatch(fetchAllProducts());
        closeSheet();
      } else {
        toast({ title: "Failed to update product", variant: "destructive" });
      }
    } else {
      if (!payload.image) {
        toast({ title: "Please add a product image", variant: "destructive" });
        setSaving(false);
        return;
      }
      const result = await dispatch(addNewProduct(payload));
      if (result?.payload?.success) {
        toast({ title: "Product added to store" });
        dispatch(fetchAllProducts());
        closeSheet();
      } else {
        toast({ title: "Failed to add product", variant: "destructive" });
      }
    }
    setSaving(false);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this product permanently?")) return;
    dispatch(deleteProduct(id)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Product deleted" });
        dispatch(fetchAllProducts());
      }
    });
  }

  function isFormValid() {
    const required = ["title", "description", "category", "brand", "price", "totalStock"];
    return required.every((key) => formData[key] !== "" && formData[key] != null);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return productList || [];
    const q = search.toLowerCase();
    return (productList || []).filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        categoryOptionsMap[p.category]?.toLowerCase().includes(q)
    );
  }, [productList, search, categoryOptionsMap]);

  const stats = useMemo(() => {
    const list = productList || [];
    const lowStock = list.filter((p) => p.totalStock > 0 && p.totalStock <= 10).length;
    const outOfStock = list.filter((p) => p.totalStock === 0).length;
    const flashSale = list.filter((p) => p.isFlashSale).length;
    const onDiscount = list.filter((p) => getDiscountPercent(p) > 0).length;
    return [
      { label: "Total Products", value: list.length, icon: Package, bg: "bg-leaf", color: "text-forest" },
      { label: "Flash Sale", value: flashSale, icon: Star, bg: "bg-red-50", color: "text-red-600" },
      { label: "On Discount", value: onDiscount, icon: AlertTriangle, bg: "bg-orange-50", color: "text-orange-600" },
      { label: "Out of Stock", value: outOfStock, icon: ShoppingBag, bg: "bg-red-50", color: "text-red-600" },
    ];
  }, [productList]);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <AdminPageHeader
        title="Products"
        subtitle="Manage your full Ayurvedic catalog — images, pricing, ingredients & stock"
        action={
          <Button onClick={openAdd} className="bg-forest hover:bg-forest/90 gap-2">
            <Plus className="w-4 h-4" /> Add New Product
          </Button>
        }
      />

      <AdminStatCards stats={stats} />

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-forest/20">
          <Package className="w-12 h-12 text-forest/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{search ? "No products match your search" : "No products yet"}</p>
          {!search && (
            <Button onClick={openAdd} className="mt-4 bg-forest">Add First Product</Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <AdminProductTile
              key={product._id}
              product={product}
              categoryLabel={categoryOptionsMap[product.category]}
              setFormData={setFormData}
              setUploadedImageUrl={setUploadedImageUrl}
              setOpenCreateProductsDialog={setOpenSheet}
              setCurrentEditedId={setCurrentEditedId}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Sheet open={openSheet} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-forest">
              {currentEditedId ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <AdminProductForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={onSubmit}
            isEdit={!!currentEditedId}
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            imageLoadingState={imageLoadingState}
            setImageLoadingState={setImageLoadingState}
            productCategories={productCategories}
            brands={brands}
            isValid={isFormValid()}
            saving={saving}
          />
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
