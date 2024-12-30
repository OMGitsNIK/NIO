"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Layout, Map, Settings, Menu, X, ChevronLast, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewDatasetModal } from "./NewDatasetModal";

interface SidebarProps {
  onAddDataset: (dataset: {
    title: string;
    description: string;
    image: string;
    items: number;
    createdDate: string;
  }) => void;
}

export function SidebarComponent({ onAddDataset }: SidebarProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const navItems = [
    { href: "/dashboard", icon: Layout, label: "Dashboard" },
    { href: "/map", icon: Map, label: "Map" },
    { href: "/analyze", icon: Settings, label: "Analyze" },
  ];

  return (
    <>
      {/* Hamburger Icon for Smaller Screens */}
      <button
        className={`fixed top-4 md:hidden transition-transform duration-300 z-50 p-2 rounded-full bg-white text-black border shadow ${isSidebarOpen ? 'left-64' : 'left-4'}`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0  left-0 z-40 h-full bg-white text-black border-r transition-all duration-300 md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isMinimized ? "w-16" : "w-60"
        )}
      >
        {/* Toggle Button */}
        <button
          className="hidden size-8  md:flex items-center justify-center p-2 rounded-full absolute -right-4 top-2  bg-white text-black border shadow "
          onClick={() => setIsMinimized(!isMinimized)}
        >
        <ChevronLeft className={cn(isMinimized?"rotate-180":"rotate-0","transition-transform size-4")}/>
        </button>

        {/* Logo */}
        {!isMinimized && (
          <div className="flex items-center gap-2 font-semibold text-xl px-4 py-6">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <Image src="/logo.svg" alt="Logo" width={40} height={40} />
            </div>
            Sponge Analyzer
          </div>
        )}

        {/* New Dataset Modal */}
        <div className="p-2 justify-center items-center">
          {!isMinimized && <NewDatasetModal onAddDataset={onAddDataset} />}
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mt-4 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-gray-200 font-medium"
                  : "hover:bg-gray-100"
              )}
            >
              <item.icon className="h-4 w-4" />
              {!isMinimized && item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Backdrop for Sidebar on Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}
