import { Link } from "wouter";
import { Home, Search, BarChart2, Settings } from "lucide-react";

interface FooterProps {
  activePage: "home" | "search" | "reports" | "settings";
}

export default function Footer({ activePage }: FooterProps) {
  // Fix the nested a tags issue by using div instead of a for the Link wrapper
  return (
    <footer className="bg-white border-t border-gray-200 fixed bottom-0 w-full md:static shadow-lg">
      <div className="container mx-auto">
        <div className="flex justify-around items-center h-16 px-4 md:px-0">
          <Link href="/">
            <div className={`flex flex-col items-center cursor-pointer ${activePage === "home" 
              ? "text-primary font-medium" 
              : "text-gray-500 hover:text-primary"}`}
            >
              <div className={`p-1.5 rounded-lg ${activePage === "home" ? "bg-primary/10" : ""}`}>
                <Home className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Home</span>
            </div>
          </Link>
          
          <Link href="/search">
            <div className={`flex flex-col items-center cursor-pointer ${activePage === "search" 
              ? "text-primary font-medium" 
              : "text-gray-500 hover:text-primary"}`}
            >
              <div className={`p-1.5 rounded-lg ${activePage === "search" ? "bg-primary/10" : ""}`}>
                <Search className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Search</span>
            </div>
          </Link>
          
          <Link href="/reports">
            <div className={`flex flex-col items-center cursor-pointer ${activePage === "reports" 
              ? "text-primary font-medium" 
              : "text-gray-500 hover:text-primary"}`}
            >
              <div className={`p-1.5 rounded-lg ${activePage === "reports" ? "bg-primary/10" : ""}`}>
                <BarChart2 className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Reports</span>
            </div>
          </Link>
          
          <Link href="/settings">
            <div className={`flex flex-col items-center cursor-pointer ${activePage === "settings" 
              ? "text-primary font-medium" 
              : "text-gray-500 hover:text-primary"}`}
            >
              <div className={`p-1.5 rounded-lg ${activePage === "settings" ? "bg-primary/10" : ""}`}>
                <Settings className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Settings</span>
            </div>
          </Link>
        </div>
      </div>
    </footer>
  );
}
