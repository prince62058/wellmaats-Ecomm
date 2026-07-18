import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { fetchAllFilteredProducts, fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";

import HeroCarousel from "@/components/shopping-view/home/HeroCarousel";
import CategoriesGrid from "@/components/shopping-view/home/CategoriesGrid";
import HowItWorks from "@/components/shopping-view/home/HowItWorks";
import StatsBanner from "@/components/shopping-view/home/StatsBanner";
import ScrollReveal from "@/components/shopping-view/home/ScrollReveal";
import { WhyChooseUs, HealthBenefits } from "@/components/shopping-view/home/TrustSections";
import { Testimonials, DoctorsSection } from "@/components/shopping-view/home/ReviewsDoctors";
import { FAQSection, NewsletterSection } from "@/components/shopping-view/home/FAQNewsletter";
import FlashSaleSection from "@/components/shopping-view/home/FlashSaleSection";
import SpotlightSection from "@/components/shopping-view/home/SpotlightSection";
import PromoBannerSection from "@/components/shopping-view/home/PromoBannerSection";
import BestSellersSection from "@/components/shopping-view/home/BestSellersSection";

function MarqueeBand() {
  const { marqueeMessages } = useSiteSettings();
  const msgs = marqueeMessages?.length ? marqueeMessages : [];
  if (!msgs.length) return null;
  const doubled = [...msgs, ...msgs];
  return (
    <div className="relative bg-forest overflow-hidden py-2.5 border-y border-gold/30">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center text-white/90 text-xs font-semibold tracking-widest uppercase mx-8">
            {item}
            <span className="text-gold mx-4">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ShoppingHome() {
  const { productList } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleGetProductDetails(id) {
    dispatch(fetchProductDetails(id));
  }

  function handleAddtoCart(productId) {
    dispatch(addToCart({ userId: user?.id, productId, quantity: 1 })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Added to cart" });
      }
    });
  }

  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
  }, [dispatch]);

  const cartProps = { handleGetProductDetails, handleAddtoCart };

  return (
    <div className="flex flex-col">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Trust marquee — dynamic from admin */}
      <MarqueeBand />

      {/* 3. Today's Wellness Deals — spotlight with filter tabs */}
      <SpotlightSection products={productList || []} {...cartProps} />

      {/* 4. First promo banner */}
      <PromoBannerSection bannerIndex={0} />

      {/* 5. Categories grid */}
      <CategoriesGrid />

      {/* 6. Flash Sale */}
      <FlashSaleSection products={productList} {...cartProps} />

      {/* 7. Best Sellers horizontal scroll */}
      <BestSellersSection products={productList || []} {...cartProps} />

      {/* 8. Second promo banner */}
      <PromoBannerSection bannerIndex={1} />

      {/* 9. How it Works */}
      <HowItWorks />

      {/* 10. Stats */}
      <StatsBanner />

      {/* 11. Why Choose Us */}
      <WhyChooseUs />

      {/* 12. Health Benefits */}
      <HealthBenefits />

      {/* 13. Testimonials */}
      <Testimonials />

      {/* 14. Doctors */}
      <DoctorsSection />

      {/* 15. FAQ + Newsletter */}
      <FAQSection />
      <NewsletterSection />
    </div>
  );
}

export default ShoppingHome;
