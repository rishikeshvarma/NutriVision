
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, ClipboardList, User, LogOut, Camera } from "lucide-react";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ScanModal from "./dashboard/ScanModal";
import { CelebrationProvider } from "@/context/CelebrationContext";
import PartyPopper from "./PartyPopper";


const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: BookOpen },
  { href: "/plans", label: "Plans", icon: ClipboardList },
  { href: "/profile", label: "Profile", icon: User },
];

const leftNavItems = navItems.slice(0, 2);
const rightNavItems = navItems.slice(2);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  return (
    <CelebrationProvider>
      <div className="flex flex-col h-screen">
        <header className="hidden md:flex items-center justify-between p-4 border-b">
          <div className="flex-1">
             <Logo />
          </div>
          <nav className="flex flex-1 items-center justify-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
           <div className="flex flex-1 justify-end">
             <Button
                variant="outline"
                onClick={() => setIsScanModalOpen(true)}
                className="ml-4"
              >
                <Camera className="h-5 w-5 mr-2" />
                Scan Meal
              </Button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-t-lg z-10 h-16">
          <div className="flex justify-around items-center h-full">
            {leftNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full transition-colors",
                  pathname.startsWith(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}

            <div className="w-full"></div> 

            {rightNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full transition-colors",
                  pathname.startsWith(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Button 
                size="icon" 
                className="rounded-full w-20 h-20 bg-primary text-primary-foreground shadow-lg border-4 border-background"
                onClick={() => setIsScanModalOpen(true)}
            >
                <Camera className="h-8 w-8" />
                <span className="sr-only">Scan Meal</span>
            </Button>
          </div>
        </nav>
      </div>
      <ScanModal isOpen={isScanModalOpen} setIsOpen={setIsScanModalOpen} />
      <PartyPopper />
    </CelebrationProvider>
  );
}
