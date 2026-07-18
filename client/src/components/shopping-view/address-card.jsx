import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Check, MapPin } from "lucide-react";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  const isSelected = selectedId?._id === addressInfo?._id;

  return (
    <Card
      onClick={() => setCurrentSelectedAddress?.(addressInfo)}
      className={`cursor-pointer transition-all rounded-xl overflow-hidden ${
        isSelected
          ? "border-2 border-forest shadow-md ring-2 ring-forest/10"
          : "border border-forest/15 hover:border-forest/30 hover:shadow-sm"
      }`}
    >
      <CardContent className="p-4 space-y-1.5 relative">
        {isSelected && (
          <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-forest flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </span>
        )}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-forest mt-0.5 shrink-0" />
          <div className="text-sm space-y-1 pr-6">
            <p className="font-medium text-forest leading-snug">{addressInfo?.address}</p>
            <p className="text-muted-foreground">
              {addressInfo?.city} — {addressInfo?.pincode}
            </p>
            <p className="text-muted-foreground">+91 {addressInfo?.phone}</p>
            {addressInfo?.notes && (
              <p className="text-xs text-muted-foreground italic">{addressInfo.notes}</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-leaf/30 border-t border-forest/5 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-full border-forest/20 text-forest hover:bg-forest hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            handleEditAddress(addressInfo);
          }}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-full border-red-200 text-red-600 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAddress(addressInfo);
          }}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;
