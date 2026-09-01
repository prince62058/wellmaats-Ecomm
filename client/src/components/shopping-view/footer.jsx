import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Instagram, Facebook, Youtube, Linkedin, MessageCircle } from "lucide-react";

const socialIcons = {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  WhatsApp: MessageCircle,
};

const KNOWN_FOOTER_ROUTES = {
  "about us": "/about-us",
  "our story": "/our-story",
  "mission": "/mission",
  "careers": "/careers",
  "press": "/about-us",
  "investor relations": "/about-us",
  "all products": "/shop/listing",
  "best sellers": "/shop/best-sellers",
  "new arrivals": "/shop/listing",
  "offer zone": "/shop/offer-zone",
  "combo packs": "/shop/listing",
  "gift boxes": "/shop/listing",
  "contact us": "/contact-us",
  "help center": "/contact-us",
  "faq": "/faq",
  "shipping policy": "/shipping-policy",
  "return policy": "/refund-policy",
  "refund policy": "/refund-policy",
  "track order": "/shop/account",
  "privacy policy": "/privacy-policy",
  "terms & conditions": "/terms-conditions",
  "terms and conditions": "/terms-conditions",
  "disclaimer": "/disclaimer",
  "cookie policy": "/privacy-policy",
  "health blog": "/blogs",
  "ayurveda guide": "/ayurveda-guide",
  "nutrition tips": "/blogs",
  "wellness articles": "/blogs",
  "dosha balancing": "/ayurveda-guide",
};

function resolveFooterHref(label = "", href = "") {
  if (href && href !== "#" && href.startsWith("/")) return href;
  const key = label.trim().toLowerCase();
  return KNOWN_FOOTER_ROUTES[key] || "/shop/listing";
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-display font-semibold text-white mb-4">{title}</h4>
      <ul className="space-y-2">
        {(links || []).map((link) => {
          const destination = resolveFooterHref(link.label, link.href);
          return (
            <li key={link.label}>
              <Link
                to={destination}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-white/70 hover:text-gold text-sm transition-colors block py-0.5"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ShoppingFooter() {
  const {
    brand,
    contact,
    social,
    footerLinks,
    trustBadges,
    paymentMethods,
    deliveryPartners,
  } = useSiteSettings();

  const logoSrc =
    brand.logo?.startsWith("/wellmaats-logo")
      ? "/wellmaats-logo.png?v=6"
      : brand.logo || "/wellmaats-logo.png?v=6";

  return (
    <footer className="bg-forest text-white mt-auto">
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-6 flex flex-wrap justify-center gap-3">
          {trustBadges.map((badge) => (
            <span key={badge} className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/90">
              ✓ {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        <div className="col-span-1 min-[420px]:col-span-2 md:col-span-3 lg:col-span-1">
          <Link
            to="/shop/home"
            className="inline-flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
            aria-label={brand.company || brand.name || "Wellmaats"}
          >
            <img
              src={logoSrc}
              alt={brand.company || brand.name || "Wellmaats"}
              className="h-12 sm:h-14 w-auto max-w-[200px] object-contain"
            />
          </Link>
          <p className="text-white/70 text-sm mt-5">{contact.phone}</p>
          <p className="text-white/70 text-sm">{contact.email}</p>
          <p className="text-white/60 text-xs mt-3 leading-relaxed break-words">{contact.office}</p>
          <p className="text-white/60 text-xs mt-1 break-words">{contact.manufacturing}</p>
          <p className="text-white/50 text-xs mt-2">{contact.hours}</p>
          <div className="flex gap-3 mt-4">
            {(social || []).map((item) => {
              const Icon = socialIcons[item.platform] || MessageCircle;
              return (
                <a
                  key={item.platform}
                  href={item.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>
        <FooterColumn title="Company" links={footerLinks.company} />
        <FooterColumn title="Shop" links={footerLinks.shop} />
        <FooterColumn title="Support" links={footerLinks.support} />
        <FooterColumn title="Legal" links={footerLinks.legal} />
        <FooterColumn title="Learn" links={footerLinks.learn} />
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <p className="text-xs text-white/50 mb-2">Payment Methods</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {paymentMethods.map((m) => (
              <span key={m} className="text-xs bg-white/10 px-2 py-1 rounded">{m}</span>
            ))}
          </div>
          <p className="text-xs text-white/50 mb-2">Delivery Partners</p>
          <div className="flex flex-wrap gap-2">
            {deliveryPartners.map((d) => (
              <span key={d} className="text-xs bg-white/10 px-2 py-1 rounded">{d}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-white/50 text-sm">
        © {new Date().getFullYear()} {brand.company}. {brand.name} — {brand.tagline}. All rights reserved.
      </div>
    </footer>
  );
}

export default ShoppingFooter;
