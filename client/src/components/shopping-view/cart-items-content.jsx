import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock = productList[getCurrentProductIndex].totalStock;

        console.log(getCurrentProductIndex, getTotalStock, "getTotalStock");

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
              variant: "destructive",
            });

            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  return (
    <div className="flex items-start sm:items-center gap-3 sm:space-x-4">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-forest/10 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-forest text-sm truncate">{cartItem?.title}</h3>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            className="h-7 w-7 rounded-full border-forest/20"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-sm font-medium w-4 text-center">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-7 w-7 rounded-full border-forest/20"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <p className="font-bold text-forest text-sm">
          ₹
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(0)}
        </p>
        <button
          type="button"
          onClick={() => handleCartItemDelete(cartItem)}
          className="text-muted-foreground hover:text-red-500 mt-1.5 transition-colors"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
