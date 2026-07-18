import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettings } from "@/hooks/use-site-settings";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";

function ShoppingAccount() {
  const { brand } = useSiteSettings();
  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf via-white to-leaf/30">
      <div className="bg-forest text-white">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <p className="text-gold/90 text-xs font-medium tracking-[0.3em] uppercase mb-2">
            My Account
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Your Wellness Hub</h1>
          <p className="text-white/70 text-sm mt-2">{brand.name} · {brand.tagline}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="bg-white rounded-2xl border border-forest/10 shadow-sm p-4 sm:p-6 overflow-hidden">
          <Tabs defaultValue="orders">
            <TabsList className="mb-6 bg-leaf/60 w-full grid grid-cols-2">
              <TabsTrigger value="orders" className="data-[state=active]:bg-forest data-[state=active]:text-white rounded-lg">
                Orders
              </TabsTrigger>
              <TabsTrigger value="address" className="data-[state=active]:bg-forest data-[state=active]:text-white rounded-lg">
                Addresses
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              <ShoppingOrders />
            </TabsContent>
            <TabsContent value="address">
              <Address />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
