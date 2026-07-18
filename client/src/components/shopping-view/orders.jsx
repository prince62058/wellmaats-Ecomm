import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";
import { shortOrderId, formatOrderDate } from "@/lib/order-utils";

function statusBadgeClass(status) {
  if (status === "confirmed") return "bg-green-500";
  if (status === "rejected") return "bg-red-600";
  return "bg-forest";
}

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {!orderList?.length ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {orderList.map((orderItem) => (
              <div
                key={orderItem._id}
                className="rounded-xl border border-forest/10 p-4 bg-white hover:border-forest/20 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-forest text-sm">
                      {shortOrderId(orderItem._id)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatOrderDate(orderItem.orderDate)}
                    </p>
                  </div>
                  <Badge className={`py-1 px-3 capitalize shrink-0 ${statusBadgeClass(orderItem.orderStatus)}`}>
                    {orderItem.orderStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-bold text-forest">₹{orderItem.totalAmount}</p>
                  <Dialog
                    open={openDetailsDialog}
                    onOpenChange={() => {
                      setOpenDetailsDialog(false);
                      dispatch(resetOrderDetails());
                    }}
                  >
                    <Button
                      size="sm"
                      className="rounded-full bg-forest hover:bg-forest/90 shrink-0"
                      onClick={() => handleFetchOrderDetails(orderItem._id)}
                    >
                      View Details
                    </Button>
                    <ShoppingOrderDetailsView orderDetails={orderDetails} />
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
