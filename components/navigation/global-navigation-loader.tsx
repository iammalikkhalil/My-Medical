"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type GlobalNavigationLoaderContextValue = {
  isNavigationLoading: boolean;
  startNavigation: () => void;
  stopNavigation: () => void;
};

const GlobalNavigationLoaderContext = createContext<GlobalNavigationLoaderContextValue | null>(null);

const MIN_VISIBLE_MS = 350;
const MAX_VISIBLE_MS = 12000;

export function GlobalNavigationLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigationLoading, setIsNavigationLoading] = useState(false);

  const startAtRef = useRef<number>(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  const stopNavigation = useCallback(() => {
    if (!isNavigationLoading) {
      return;
    }

    const elapsed = Date.now() - startAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setIsNavigationLoading(false);
      clearTimers();
    }, remaining);
  }, [clearTimers, isNavigationLoading]);

  const startNavigation = useCallback(() => {
    if (!isNavigationLoading) {
      startAtRef.current = Date.now();
      setIsNavigationLoading(true);
    }

    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
    }
    maxTimerRef.current = setTimeout(() => {
      setIsNavigationLoading(false);
      clearTimers();
    }, MAX_VISIBLE_MS);
  }, [clearTimers, isNavigationLoading]);

  useEffect(() => {
    if (!isNavigationLoading) {
      return;
    }
    stopNavigation();
  }, [isNavigationLoading, pathname, stopNavigation]);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.dataset.noGlobalLoader === "true") {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);

      if (url.origin !== current.origin) {
        return;
      }

      if (url.pathname === current.pathname && url.search === current.search) {
        return;
      }

      startNavigation();
    }

    function onPopState() {
      startNavigation();
    }

    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [startNavigation]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const value = useMemo<GlobalNavigationLoaderContextValue>(
    () => ({
      isNavigationLoading,
      startNavigation,
      stopNavigation,
    }),
    [isNavigationLoading, startNavigation, stopNavigation],
  );

  return (
    <GlobalNavigationLoaderContext.Provider value={value}>
      {children}
      <div className={`global-nav-loader ${isNavigationLoading ? "is-visible" : ""}`} aria-hidden={!isNavigationLoading}>
        <div className="global-nav-loader__backdrop" />
        <div className="global-nav-loader__panel" role="status" aria-live="polite" aria-label="Navigating to next screen">
          <div className="global-nav-loader__ring" />
          <div className="global-nav-loader__content">
            <p className="global-nav-loader__title">Loading next screen</p>
            <div className="global-nav-loader__bar">
              <div className="global-nav-loader__bar-fill" />
            </div>
          </div>
        </div>
      </div>
    </GlobalNavigationLoaderContext.Provider>
  );
}

export function useGlobalNavigationLoader() {
  const context = useContext(GlobalNavigationLoaderContext);
  if (!context) {
    return {
      isNavigationLoading: false,
      startNavigation: () => {},
      stopNavigation: () => {},
    };
  }
  return context;
}
