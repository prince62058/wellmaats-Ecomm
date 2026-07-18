import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useLoginModal } from "@/context/LoginModalContext";

const POPUP_DELAY = 2 * 60 * 1000; // 2 minutes → show popup only, no redirect

const EXCLUDED = ["/auth/", "/admin/"];

export default function AutoLoginPrompt() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { openLoginModal }  = useLoginModal();
  const location  = useLocation();
  const popupTimer = useRef(null);

  useEffect(() => {
    const isExcluded = EXCLUDED.some((p) => location.pathname.startsWith(p));
    if (isAuthenticated || isExcluded) {
      clearTimeout(popupTimer.current);
      return;
    }

    clearTimeout(popupTimer.current);

    popupTimer.current = setTimeout(() => {
      openLoginModal();
    }, POPUP_DELAY);

    return () => clearTimeout(popupTimer.current);
  }, [isAuthenticated, location.pathname]);

  return null;
}
