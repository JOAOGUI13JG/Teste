import { Link } from "wouter";
import { Home, Search, BarChart2, Settings } from "lucide-react";

interface FooterProps {
  activePage: "home" | "search" | "reports" | "settings";
}

export default function Footer({ activePage }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200 fixed bottom-0 w-full md:static">
      <div className="container mx-auto">
        <div className="flex justify-around items-center h-16 px-4 md:px-0">
          <Link href="/">
            <a className={`flex flex-col items-center ${activePage === "home" ? "text-primary" : "text-gray-500 hover:text-primary"}`}>
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </a>
          </Link>
          
          <Link href="/search">
            <a className={`flex flex-col items-center ${activePage === "search" ? "text-primary" : "text-gray-500 hover:text-primary"}`}>
              <Search className="h-5 w-5" />
              <span className="text-xs mt-1">Search</span>
            </a>
          </Link>
          
          <Link href="/reports">
            <a className={`flex flex-col items-center ${activePage === "reports" ? "text-primary" : "text-gray-500 hover:text-primary"}`}>
              <BarChart2 className="h-5 w-5" />
              <span className="text-xs mt-1">Reports</span>
            </a>
          </Link>
          
          <Link href="/settings">
            <a className={`flex flex-col items-center ${activePage === "settings" ? "text-primary" : "text-gray-500 hover:text-primary"}`}>
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Settings</span>
            </a>
          </Link>
        </div>
      </div>
    </footer>
  );
}
