"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AppMobileNav } from "@/components/app-mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { config } = useSidebarConfig();
  const pathname = usePathname();
  const hideFooter = /\/(dashboard|coach|creador-de-escenas|narrador)\/?$/.test(pathname);
  const isImmersiveRoute = /\/(coach|creador-de-escenas|narrador)\/?$/.test(pathname);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3rem",
        "--header-height": "calc(var(--spacing) * 14)",
      } as React.CSSProperties}
      className={config.collapsible === "none" ? "sidebar-none-mode" : ""}
    >
      {config.side === "left" ? (
        <>
          <AppSidebar
            variant={config.variant}
            collapsible={config.collapsible}
            side={config.side}
          />
          <SidebarInset className="odiseo-dashboard-shell">
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className={`flex flex-col gap-4 md:gap-6 md:py-6 ${isImmersiveRoute ? "h-[100dvh] py-0 pb-0 md:h-auto" : "py-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-6"}`}>
                  {children}
                </div>
              </div>
            </div>
            {!hideFooter && <SiteFooter />}
          </SidebarInset>
        </>
      ) : (
        <>
          <SidebarInset className="odiseo-dashboard-shell">
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className={`flex flex-col gap-4 md:gap-6 md:py-6 ${isImmersiveRoute ? "h-[100dvh] py-0 pb-0 md:h-auto" : "py-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-6"}`}>
                  {children}
                </div>
              </div>
            </div>
            {!hideFooter && <SiteFooter />}
          </SidebarInset>
          <AppSidebar
            variant={config.variant}
            collapsible={config.collapsible}
            side={config.side}
          />
        </>
      )}

      <AppMobileNav />
      <Toaster richColors position="top-center" />
    </SidebarProvider>
  );
}
