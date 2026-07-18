import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import ShoppingFooter from "./footer";
import GlobalProductDialog from "./global-product-dialog";
import AnnouncementBar from "./AnnouncementBar";

function ShoppingLayout() {
  const chromeRef = useRef(null);

  useEffect(() => {
    const el = chromeRef.current;
    if (!el) return;
    const sync = () => {
      const bottom = Math.round(el.getBoundingClientRect().bottom);
      document.documentElement.style.setProperty("--header-h", `${bottom}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-leaf overflow-x-clip">
      <div ref={chromeRef} className="sticky top-0 z-50 w-full">
        <AnnouncementBar />
        <ShoppingHeader />
      </div>
      <main className="flex flex-col w-full flex-1 min-w-0">
        <Outlet />
      </main>
      <ShoppingFooter />
      <GlobalProductDialog />
    </div>
  );
}

export default ShoppingLayout;
