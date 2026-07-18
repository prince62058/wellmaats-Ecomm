import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import HeroSection from "@/components/shopping-view/home/HeroSection";
import CategoriesGrid from "@/components/shopping-view/home/CategoriesGrid";
import HowItWorks from "@/components/shopping-view/home/HowItWorks";
import StatsBanner from "@/components/shopping-view/home/StatsBanner";
import ScrollReveal from "@/components/shopping-view/home/ScrollReveal";
import { WhyChooseUs, HealthBenefits } from "@/components/shopping-view/home/TrustSections";
import { Testimonials, DoctorsSection } from "@/components/shopping-view/home/ReviewsDoctors";
import { FAQSection, NewsletterSection } from "@/components/shopping-view/home/FAQNewsletter";
import FlashSaleSection from "@/components/shopping-view/home/FlashSaleSection";
import { Link } from "react-router-dom";

function ShoppingHome() {
  const { productList } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const featuredProducts = productList?.filter((p) => p.isFeatured) || productList?.slice(0, 8) || [];

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

  return (
    <div className="flex flex-col">
      <HeroSection />

      {/* Trust marquee strip */}
      <div className="relative bg-forest overflow-hidden py-3 border-y border-gold/30">
        <div className="flex animate-marquee whitespace-nowrap gap-0">
          {[
            "🌿 100% Ayurvedic",
            "🧪 Lab Tested",
            "✅ GMP Certified",
            "🇮🇳 Made in India",
            "🚚 Pan-India Delivery",
            "💊 35+ Herbs Extract",
            "⭐ 4.8 Customer Rating",
            "🔒 Secure Payments",
            "🌿 100% Ayurvedic",
            "🧪 Lab Tested",
            "✅ GMP Certified",
            "🇮🇳 Made in India",
            "🚚 Pan-India Delivery",
            "💊 35+ Herbs Extract",
            "⭐ 4.8 Customer Rating",
            "🔒 Secure Payments",
          ].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-white/90 text-xs font-semibold tracking-widest uppercase mx-8">
              {item}
              <span className="text-gold mx-2">◆</span>
            </span>
          ))}
        </div>
      </div>

      <CategoriesGrid />
      <HowItWorks />
      <StatsBanner />

      <FlashSaleSection
        products={productList}
        handleGetProductDetails={handleGetProductDetails}
        handleAddtoCart={handleAddtoCart}
      />

      <section className="py-16 bg-gradient-to-b from-white to-leaf">
        <div className="container mx-auto px-4">
          <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-forest">
                Featured Products
              </h2>
              <p className="text-muted-foreground mt-2">Our most loved Ayurvedic drops</p>
            </div>
            <Link to="/shop/listing" className="w-full sm:w-auto">
              <Button variant="outline" className="border-forest text-forest w-full sm:w-auto">
                View All
              </Button>
            </Link>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0
              ? featuredProducts.map((product, i) => (
                  <ScrollReveal key={product._id} delay={i * 80}>
                    <ShoppingProductTile
                      handleGetProductDetails={handleGetProductDetails}
                      product={product}
                      handleAddtoCart={handleAddtoCart}
                    />
                  </ScrollReveal>
                ))
              : (
                <p className="col-span-full text-center text-muted-foreground py-12">
                  Loading wellness products...
                </p>
              )}
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <HealthBenefits />
      <Testimonials />
      <DoctorsSection />
      <FAQSection />
      <NewsletterSection />
    </div>
  );
}

export default ShoppingHome;
