import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductDetailsDialog from "./product-details";

function GlobalProductDialog() {
  const { productDetails } = useSelector((state) => state.shopProducts);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (productDetails) setOpen(true);
  }, [productDetails]);

  return (
    <ProductDetailsDialog
      open={open}
      setOpen={setOpen}
      productDetails={productDetails}
    />
  );
}

export default GlobalProductDialog;
