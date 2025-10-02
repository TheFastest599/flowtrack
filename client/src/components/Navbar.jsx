"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold">
          FlowTrack
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/projects">Projects</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/contact">Contact</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-3/4">
              <nav className="flex flex-col gap-4 mt-8 mx-4">
                <SheetTitle className="text-xl font-semibold">
                  FlowTrack
                </SheetTitle>
                <Link href="/" onClick={() => setOpen(false)}>
                  Home
                </Link>
                <Link href="/about" onClick={() => setOpen(false)}>
                  About
                </Link>
                <Link href="/projects" onClick={() => setOpen(false)}>
                  Projects
                </Link>
                <Link href="/contact" onClick={() => setOpen(false)}>
                  Contact
                </Link>
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup" onClick={() => setOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
