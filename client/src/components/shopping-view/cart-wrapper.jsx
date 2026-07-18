import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { ShoppingBag, Leaf } from "lucide-react";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  const itemCount = cartItems?.reduce((n, i) => n + i.quantity, 0) || 0;

  return (
    <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
      <div className="bg-forest text-white px-6 py-5">
        <SheetHeader>
          <SheetTitle className="text-white font-display text-xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            Your Cart
            {itemCount > 0 && (
              <span className="text-xs bg-gold text-white px-2 py-0.5 rounded-full font-bold ml-1">
                {itemCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <UserCartItemsContent key={item.productId} cartItem={item} />
          ))
        ) : (
          <div className="text-center py-16">
            <Leaf className="w-12 h-12 text-forest/15 mx-auto mb-4" />
            <p className="font-display text-lg font-bold text-forest mb-1">Cart is empty</p>
            <p className="text-sm text-muted-foreground">Add some wellness drops</p>
          </div>
        )}
      </div>

      {cartItems && cartItems.length > 0 && (
        <div className="border-t border-forest/10 px-6 py-5 bg-leaf/30 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-2xl font-bold text-forest">₹{totalCartAmount}</span>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Shipping & taxes calculated at checkout
          </p>
          <Button
            onClick={() => {
              navigate("/shop/checkout");
              setOpenCartSheet(false);
            }}
            className="w-full rounded-full h-12 bg-forest hover:bg-forest/90 font-semibold text-base"
          >
            Proceed to Checkout
          </Button>
        </div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;
