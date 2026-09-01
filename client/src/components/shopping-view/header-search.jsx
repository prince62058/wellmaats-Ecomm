import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { categoryOptionsMap } from "@/config";

function HeaderSearch({ className = "", onResultClick, variant = "light" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const { searchResults, isLoading } = useSelector((state) => state.shopSearch);

  const runSearch = useCallback(
    (value) => {
      const trimmed = value.trim();
      if (trimmed.length >= 2) {
        dispatch(getSearchResults(trimmed));
      } else {
        dispatch(resetSearchResults());
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 350);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToSearchPage(keyword) {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setOpen(false);
    navigate(`/shop/search?keyword=${encodeURIComponent(trimmed)}`);
    onResultClick?.();
  }

  function handleProductClick(productId) {
    dispatch(fetchProductDetails(productId));
    setOpen(false);
    setQuery("");
    dispatch(resetSearchResults());
    onResultClick?.();
  }

  function handleSubmit(e) {
    e.preventDefault();
    goToSearchPage(query);
  }

  const showDropdown = open && query.trim().length >= 2;
  const isDark = variant === "dark";

  const inputClass = isDark
    ? "pl-9 pr-9 h-9 w-full rounded-full border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:bg-white/15 focus-visible:ring-white/20 text-sm"
    : "pl-9 pr-9 h-9 w-full rounded-full border-forest/15 bg-leaf/60 focus:bg-white focus-visible:ring-forest/20 text-sm";

  const iconClass = isDark ? "text-white/50" : "text-forest/45";

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${iconClass}`} />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products..."
          className={inputClass}
        />
        {isLoading && (
          <Loader2 className={`absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin ${iconClass}`} />
        )}
        {query && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              dispatch(resetSearchResults());
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 ${iconClass}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-forest/10 shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {isLoading && searchResults.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">
              Searching...
            </p>
          ) : searchResults.length > 0 ? (
            <>
              <ul>
                {searchResults.slice(0, 6).map((product) => (
                  <li key={product._id}>
                    <button
                      type="button"
                      onClick={() => handleProductClick(product._id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-leaf text-left transition-colors"
                    >
                      <img
                        src={product.image}
                        alt=""
                        className="w-11 h-11 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-forest text-sm truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {categoryOptionsMap[product.category] || product.category}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-forest shrink-0">
                        ₹{product.salePrice > 0 ? product.salePrice : product.price}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {searchResults.length > 6 && (
                <button
                  type="button"
                  onClick={() => goToSearchPage(query)}
                  className="w-full py-3 text-sm font-medium text-forest bg-leaf/80 hover:bg-leaf border-t border-forest/10"
                >
                  View all {searchResults.length} results
                </button>
              )}
            </>
          ) : (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">
              No products found for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default HeaderSearch;
