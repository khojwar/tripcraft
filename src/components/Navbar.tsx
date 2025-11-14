import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import { ModeToggle } from "./ModeToggle"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Menu } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="w-full border-b shadow-sm sticky top-0 bg-white dark:bg-gray-900 z-60 px-3">
        <div className="container flex justify-between items-center py-3">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
                <span className="text-blue-700">Trip</span>Craft
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild >
                                <Link href="/work">How it works</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink asChild >
                                <Link href="/examples">Examples</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <ModeToggle />
                        
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* mobile menu */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger>
                        <Menu />
                    </SheetTrigger>
                    <SheetContent side="right" className="top-14 w-[60%]">
                        <div className="flex flex-col justify-start items-start space-y-4 mt-4 ">
                            <Link href="/work" className="pl-3">How it works</Link>
                            <Link href="/examples" className="pl-3">Examples</Link>
                            <ModeToggle />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

        </div>
        
    </nav>
  )
}

export default Navbar