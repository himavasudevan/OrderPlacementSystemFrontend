import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UserCog,
  Users,
  ClipboardList,
  LayoutDashboard,
  Menu as MenuIcon,
  LogOut,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";

// keep this in sync with your AuthContext Role type
type Role = "admin" | "Konsulent";

type MenuItem = { name: string; path: string; icon: React.ComponentType<{ className?: string }> };

const menuByRole: Record<Role, MenuItem[]> = {
  admin: [
    { name: "Consultant Management", path: "/admin/konsulent", icon: UserCog },
    { name: "Customer Management", path: "/admin/customers", icon: Users },
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  ],
  Konsulent: [
    { name: "Dashboard", path: "/konsulent", icon: LayoutDashboard },
    { name: "Customer Management", path: "/konsulent/customers", icon: Users },
    { name: "Order Management", path: "/konsulent/orders", icon: ClipboardList },
  ],
} as const;

type AppLayoutProps = { children: ReactNode };

const AppLayout = ({ children }: AppLayoutProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // if user isn't ready yet, avoid flashing
  if (!user) return null;

  const role = user.role as Role; // from AuthContext
  const roleSegment = role.toLowerCase(); // "admin" | "konsulent" for URLs
  const menuItems = menuByRole[role] ?? [];

  // Only Konsulent should be able to update password (customers don't have passwords; admins excluded by requirement)
  const showUpdatePassword = role === "Konsulent";

  // prefer real name from JWT; fallback to email username
  const displayName = user.name?.trim() || user.email.split("@")[0];

  const renderNav = () =>
    menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;
      return (
        <motion.div key={item.name} whileHover={{ scale: 1.03 }}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            aria-current={isActive ? "page" : undefined}
            className="w-full justify-start gap-2 px-3 py-2 rounded-lg transition-colors"
            onClick={() => navigate(item.path)}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </Button>
        </motion.div>
      );
    });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-card border-r border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.jpeg" alt="Logo" className="h-8 w-8 object-contain rounded" />
          <span className="text-xl font-bold">TMC {role}</span>
        </div>
        <nav className="flex flex-col gap-1">{renderNav()}</nav>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-border">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" aria-label="Open menu">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4">
                  <div className="flex items-center gap-3 mb-6">
                    <img src="/logo.jpg" alt="Logo" className="h-8 w-8 object-contain rounded" />
                    <span className="text-xl font-bold">RMS {role}</span>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Button
                          key={item.name}
                          variant={isActive ? "secondary" : "ghost"}
                          aria-current={isActive ? "page" : undefined}
                          className="justify-start gap-2 px-3 py-2 rounded-md transition-colors"
                          onClick={() => {
                            navigate(item.path);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                        </Button>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <span className="text-base font-semibold text-muted-foreground hidden sm:inline">
              Welcome, {displayName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <ModeToggle />

            {/* Account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <img
                  src="/person.png"
                  alt="User Avatar"
                  className="h-9 w-9 rounded-full object-cover border border-border cursor-pointer transition duration-200 hover:shadow-md"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {showUpdatePassword && (
                  <DropdownMenuItem
                    onClick={() => navigate(`/${roleSegment}/password`)}
                    className="cursor-pointer"
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Update Password
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 bg-background overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
