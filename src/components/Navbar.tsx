
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Settings, 
  User, 
  Package, 
  Users, 
  LayoutDashboard, 
  Connection, 
  Workflow,
  FileVideo, 
  Repeat, 
  Plus 
} from "lucide-react";
import PurposifyLogo from "./PurposifyLogo";

interface NavLink {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

const Navbar = () => {
  const { user, signOut: authSignOut } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks: NavLink[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-1" />
    },
    {
      name: "Content",
      path: "/content",
      icon: <FileVideo className="h-4 w-4 mr-1" />
    },
    {
      name: "Workflows",
      path: "/workflows",
      icon: <Workflow className="h-4 w-4 mr-1" />
    },
    {
      name: "Contenu Republié",
      path: "/republished-content",
      icon: <Repeat className="h-4 w-4 mr-1" />
    },
    {
      name: "Connections",
      path: "/connections",
      icon: <Connection className="h-4 w-4 mr-1" />
    },
    {
      name: "Parrainage",
      path: "/referrals",
      icon: <Users className="h-4 w-4 mr-1" />
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    return location.pathname.startsWith(path) && path !== "/dashboard";
  };

  const handleSignOut = async () => {
    try {
      await authSignOut?.();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container px-4 mx-auto flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center">
            <PurposifyLogo />
          </Link>
        </div>

        {!isMobile && (
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant={isActive(link.path) ? "secondary" : "ghost"}
                  className="flex items-center gap-1"
                >
                  {link.icon}
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.user_metadata?.avatar_url || ""}
                        alt="User avatar"
                      />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Account</TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || user?.email || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isMobile && (
                <>
                  {navLinks.map((link) => (
                    <DropdownMenuItem key={link.path} asChild>
                      <Link to={link.path} className="flex items-center gap-1 cursor-pointer">
                        {link.icon}
                        {link.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link to="/settings/account" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Paramètres du compte
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings/subscription" className="flex items-center gap-2 cursor-pointer">
                  <Package className="h-4 w-4" />
                  Gérer l'abonnement
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
