"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import MobileDrawer from "@/components/MobileDrawer";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#0A0A0B] selection:bg-primary/30 selection:text-white">
        {/* Sidebar for Desktop */}
        <Sidebar />

        {/* Main Content Area */}
        <DashboardInner isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen}>
          {children}
        </DashboardInner>

        {/* Mobile Actions Drawer */}
        <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      </div>
    </SidebarProvider>
  );
}

// Inner component to access SidebarContext
function DashboardInner({ 
  children, 
  isDrawerOpen, 
  setIsDrawerOpen 
}: { 
  children: React.ReactNode, 
  isDrawerOpen: boolean, 
  setIsDrawerOpen: (val: boolean) => void 
}) {
  const { isCollapsed } = useSidebar();

  return (
    <main 
      className={cn(
        "flex-1 relative flex flex-col min-w-0 transition-all duration-300 overflow-x-hidden",
        isCollapsed ? "md:pl-20" : "md:pl-64"
      )}
    >
      {/* Content Container */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 md:py-12">
        {children}
      </div>

      {/* Bottom Nav for Mobile */}
      <BottomNav onMenuClick={() => setIsDrawerOpen(true)} />

      {/* Padding for Bottom Nav on Mobile */}
      <div className="h-24 md:hidden" />
    </main>
  );
}
