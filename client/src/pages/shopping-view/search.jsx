import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2, Leaf } from "lucide-react";

function SearchProducts() {
  const { brand } = useSiteSettings();
  const [keyword, setKeyword] = useState("");
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { searchResults, isLoading } = useSelector((state) => state.shopSearch);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();

  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    setKeyword(urlKeyword);
  }, [searchParams]);

  useEffect(() => {
    const trimmed = keyword.trim();
    const timer = setTimeout(() => {
      if (trimmed.length >= 2) {
        dispatch(getSearchResults(trimmed));
      } else {
        dispatch(resetSearchResults());
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [keyword, dispatch]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    const getCartItems = cartItems.items || [];
    const existing = getCartItems.find((item) => item.productId === getCurrentProductId);
    if (existing && existing.quantity + 1 > getTotalStock) {
      toast({
        title: `Only ${existing.quantity} quantity can be added for this item`,
        variant: "destructive",
      });
      return;
    }
    dispatch(addToCart({ userId: user?.id, productId: getCurrentProductId, quantity: 1 })).then(
      (data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast({ title: "Added to cart ✓" });
        }
      }
    );
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  const trimmed = keyword.trim();
  const hasSearched = trimmed.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf via-white to-leaf/20">
      <div className="bg-forest text-white">
        <div className="container mx-auto px-4 py-8 md:py-10 text-center">
          <div className="flex items-center justify-center gap-2 text-gold/80 text-xs uppercase tracking-[0.3em] mb-2">
            <Leaf className="w-3.5 h-3.5" />
            <span>{brand.company}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Search Products</h1>
          <p className="text-white/70 text-sm mt-2">Find your perfect Ayurvedic drops</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/50" />
            <Input
              value={keyword}
              name="keyword"
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-14 py-7 rounded-full border-forest/15 bg-white text-base shadow-lg shadow-forest/5 focus-visible:ring-forest"
              placeholder="Search immunity, liver, gut health, hair..."
              autoFocus
            />
            {isLoading && (
              <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-forest animate-spin" />
            )}
          </div>
          {hasSearched && !isLoading && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              <span className="font-semibold text-forest">{searchResults.length}</span> result
              {searchResults.length !== 1 ? "s" : ""} for &ldquo;{trimmed}&rdquo;
            </p>
          )}
        </div>

        {!hasSearched ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-forest/10 max-w-lg mx-auto">
            <Search className="w-10 h-10 text-forest/20 mx-auto mb-4" />
            <p className="text-muted-foreground">Type at least 2 characters to search Ayurvedic drops</p>
            <p className="text-xs text-gold mt-2">Try: immunity · liver · hair · stress</p>
          </div>
        ) : isLoading ? (
          <p className="text-center text-muted-foreground py-12">Searching...</p>
        ) : !searchResults.length ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-forest/10">
            <Leaf className="w-12 h-12 text-forest/20 mx-auto mb-4" />
            <p className="font-display text-2xl font-bold text-forest mb-2">No results found</p>
            <p className="text-muted-foreground text-sm">Try &ldquo;immunity&rdquo;, &ldquo;liver&rdquo;, or &ldquo;hair&rdquo;</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {searchResults.map((item) => (
              <ShoppingProductTile
                key={item._id}
                handleAddtoCart={handleAddtoCart}
                product={item}
                handleGetProductDetails={handleGetProductDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchProducts;
