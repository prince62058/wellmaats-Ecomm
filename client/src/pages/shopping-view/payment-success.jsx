import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { CheckCircle2, Leaf, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { brand } = useSiteSettings();

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-leaf via-white to-leaf/20 px-4 py-12">
      <div className="max-w-md w-full text-center bg-white rounded-3xl border border-forest/10 shadow-xl p-8 md:p-12">
        <div className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-forest" />
        </div>
        <div className="flex items-center justify-center gap-2 text-gold text-xs uppercase tracking-[0.3em] mb-3">
          <Leaf className="w-3.5 h-3.5" />
          <span>{brand.name}</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-forest mb-3">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Thank you for choosing {brand.name}. Your Ayurvedic wellness order is confirmed and on its way.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate("/shop/account")}
            className="w-full rounded-full h-12 bg-forest hover:bg-forest/90 font-semibold gap-2"
          >
            <Package className="w-4 h-4" />
            View My Orders
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/shop/listing")}
            className="w-full rounded-full h-12 border-forest/20 text-forest hover:bg-forest hover:text-white"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
