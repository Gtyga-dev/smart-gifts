import { ReactNode } from "react";
import { DashboardNavigation } from "../components/dashboard/DashboardNavigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MenuIcon, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { unstable_noStore as noStore } from "next/cache";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const allowedEmails = [
  "geofreypaul40@gmail.com",
  "thalapatrick2003@gmail.com",
  "makungwafortune78@gmail.com",
  "msosadaina@gmail.com",
  "mikefchimwaza03@gmail.com",
  "brendaallie577@gmail.com"
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return redirect("/");
  }

  // Get user initials for avatar fallback
  const initials = user.given_name && user.family_name
    ? `${user.given_name[0]}${user.family_name[0]}`
    : user.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.05),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(var(--primary-rgb),0.05),transparent_40%)]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-primary to-primary/80 text-white">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-lg hidden md:inline-block">Admin Dashboard</span>
                </Link>

                <nav className="hidden md:flex md:items-center md:gap-6">
                  <DashboardNavigation />
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full relative overflow-hidden group">
                      <Avatar className="h-8 w-8 transition-all border-2 border-transparent group-hover:border-primary/20">
                        <AvatarImage src={user.picture || ""} alt={user.given_name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1 border border-border/50 shadow-lg">
                    <DropdownMenuLabel className="flex flex-col gap-1 py-3">
                      <span className="font-medium">{user.given_name} {user.family_name}</span>
                      <span className="text-xs text-muted-foreground font-normal truncate">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <Link href="/dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="text-red-500 focus:text-red-500 cursor-pointer">
                      <LogoutLink className="w-full">Logout</LogoutLink>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      className="md:hidden"
                      variant="outline"
                      size="icon"
                    >
                      <MenuIcon className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="border-r border-border/50">
                    <div className="flex items-center gap-2 mb-8 mt-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-primary to-primary/80 text-white">
                        <LayoutDashboard className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-lg">Admin Dashboard</span>
                    </div>
                    <nav className="flex flex-col gap-4">
                      <DashboardNavigation />
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-background/60 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm p-6">
            {children}
          </div>
        </main>

        <footer className="border-t border-border/50 py-6 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
