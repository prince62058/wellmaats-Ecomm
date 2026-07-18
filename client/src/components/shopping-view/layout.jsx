import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import ShoppingFooter from "./footer";
import GlobalProductDialog from "./global-product-dialog";

function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-leaf overflow-x-hidden">
      <ShoppingHeader />
      <main className="flex flex-col w-full flex-1 min-w-0">
        <Outlet />
      </main>
      <ShoppingFooter />
      <GlobalProductDialog />
    </div>
  );
}

export default ShoppingLayout;
