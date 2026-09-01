import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function DynamicThemeInjector() {
  const { themeColors } = useSiteSettings();

  useEffect(() => {
    if (!themeColors) return;
    const root = document.documentElement;

    const pBg = themeColors.primaryBtnBg || "#065f3d";
    const pText = themeColors.primaryBtnText || "#ffffff";
    const pHover = themeColors.primaryBtnHover || "#04432b";

    const sBg = themeColors.secondaryBtnBg || "#ffffff";
    const sText = themeColors.secondaryBtnText || "#065f3d";
    const sBorder = themeColors.secondaryBtnBorder || "#065f3d";

    const bBg = themeColors.buyNowBtnBg || "#c8963e";
    const bText = themeColors.buyNowBtnText || "#ffffff";

    root.style.setProperty("--btn-primary-bg", pBg);
    root.style.setProperty("--btn-primary-text", pText);
    root.style.setProperty("--btn-primary-hover", pHover);

    root.style.setProperty("--btn-secondary-bg", sBg);
    root.style.setProperty("--btn-secondary-text", sText);
    root.style.setProperty("--btn-secondary-border", sBorder);

    root.style.setProperty("--btn-buynow-bg", bBg);
    root.style.setProperty("--btn-buynow-text", bText);
  }, [themeColors]);

  return null;
}
