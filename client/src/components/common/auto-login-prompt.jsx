import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoginModal } from "@/context/LoginModalContext";

const POPUP_DELAY    = 2 * 60 * 1000; // 2 minutes → show popup
const REDIRECT_DELAY = 1 * 60 * 1000; // 1 minute after popup → go to login page

// Pages where we should NOT auto-prompt (auth pages, checkout already guarded)
const EXCLUDED = ["/auth/", "/admin/"];

export default function AutoLoginPrompt() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { open, openLoginModal } = useLoginModal();
  const navigate  = useNavigate();
  const location  = useLocation();
  const popupTimer   = useRef(null);
  const redirectTimer = useRef(null);

  useEffect(() => {
    // Clear all timers if user logs in or is on excluded path
    const isExcluded = EXCLUDED.some((p) => location.pathname.startsWith(p));
    if (isAuthenticated || isExcluded) {
      clearTimeout(popupTimer.current);
      clearTimeout(redirectTimer.current);
      return;
    }

    // Start fresh timers each time unauthenticated user lands on a public page
    clearTimeout(popupTimer.current);
    clearTimeout(redirectTimer.current);

    // After 2 min → show login modal
    popupTimer.current = setTimeout(() => {
      if (!isAuthenticated) {
        openLoginModal();

        // After another 1 min (if still not logged in) → navigate to login
        redirectTimer.current = setTimeout(() => {
          // check auth state at redirect time via window storage trick isn't reliable,
          // so we always navigate — CheckAuth will handle it if they already logged in
          navigate("/auth/login");
        }, REDIRECT_DELAY);
      }
    }, POPUP_DELAY);

    return () => {
      clearTimeout(popupTimer.current);
      clearTimeout(redirectTimer.current);
    };
  }, [isAuthenticated, location.pathname]);

  // Cancel redirect timer if modal was closed (user logged in)
  useEffect(() => {
    if (isAuthenticated) {
      clearTimeout(redirectTimer.current);
    }
  }, [isAuthenticated]);

  return null; // purely side-effect component
}
