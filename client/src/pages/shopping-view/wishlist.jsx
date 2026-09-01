import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "@/store/shop/wishlist-slice";
import { fetchAllFilteredProducts, fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/shopping-view/home/ScrollReveal";

function WishlistPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((s) => s.auth);
  const { products: wishlistIds } = useSelector((s) => s.wishlist);
  const { productList } = useSelector((s) => s.shopProducts);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWishlist(user.id));
      dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
    }
  }, [dispatch, user?.id]);

  const wishlistProducts = (productList || []).filter((p) => wishlistIds.includes(p._id));

  function handleGetProductDetails(id) { dispatch(fetchProductDetails(id)); }
  function handleAddtoCart(productId) {
    dispatch(addToCart({ userId: user?.id, productId, quantity: 1 })).then((d) => {
      if (d?.payload?.success) { dispatch(fetchCartItems(user?.id)); toast({ title: "Added to cart!" }); }
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-400 fill-red-400" />
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-forest">My Wishlist</h1>
              <p className="text-sm text-muted-foreground">{wishlistProducts.length} saved items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {wishlistProducts.map((product, i) => (
              <ScrollReveal key={product._id} delay={i * 40}>
                <ShoppingProductTile product={product} handleGetProductDetails={handleGetProductDetails} handleAddtoCart={handleAddtoCart} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <Heart className="w-10 h-10 text-red-200" />
            </div>
            <h3 className="font-display text-lg font-bold text-forest">Your wishlist is empty</h3>
            <p className="text-sm text-muted-foreground">Save your favourite Ayurvedic products here.</p>
            <Link to="/shop/listing">
              <Button className="bg-forest hover:bg-forest/90 text-white rounded-full px-6 mt-2">
                <ShoppingBag className="w-4 h-4 mr-2" /> Browse Products
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;
