"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Projects", href: "/projects" },
  { name: "Tasks", href: "/tasks" },
  { name: "Reports", href: "/reports" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loggedIn, logout, hydrated } = useAuthStore();
  const router = useRouter();

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout();
    router.push("/");
    // Optionally redirect or handle post-logout
  };

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
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.name}>
                  <NavigationMenuLink asChild>
                    <Link href={link.href}>{link.name}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              {isAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/members">Members</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
              {/* Auth Buttons */}
              {!hydrated ? (
                <NavigationMenuItem>
                  <Skeleton className="h-8 w-8" />
                </NavigationMenuItem>
              ) : !loggedIn ? (
                <>
                  <NavigationMenuItem className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </NavigationMenuItem>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback>
                            {user?.name
                              ? user.name.slice(0, 2).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                      {isAdmin && <Badge className="mx-2">admin</Badge>}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </NavigationMenuList>
          </NavigationMenu>
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
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    key="Members"
                    href="/members"
                    onClick={() => setOpen(false)}
                  >
                    Members
                  </Link>
                )}
                {/* Auth Buttons */}
                {!hydrated ? (
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                ) : !loggedIn ? (
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div>
                        <Button
                          variant="ghost"
                          className="relative h-8 w-8 rounded-full"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback>
                              {user?.name
                                ? user.name.slice(0, 2).toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                        {isAdmin && <Badge className="mx-2">admin</Badge>}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" onClick={() => setOpen(false)}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          handleLogout();
                          setOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
