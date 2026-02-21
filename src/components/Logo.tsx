'use client';
import { cn } from "@/lib/utils";
import React from "react";
import Image from "next/image";

const Logo = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center gap-3", className)} {...props}>
        <Image
          src="/nutrivision-logo.png"
          alt="NutriVision logo"
          width={40}
          height={40}
          className="h-8 w-auto"
          priority
        />
        <span className="font-bold text-xl text-foreground font-headline">NutriVision</span>
      </div>
    );
  }
);

Logo.displayName = "Logo";

export default Logo;
