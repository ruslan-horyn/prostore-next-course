import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { EllipsisVertical, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "./mode-toggle";
import { UserButton } from "./user-button";

export const Menu = () => {
  return (
    <>
      <div className="flex justify-end gap-3">
        <nav className="md:flex hidden w-full max-w-xs gap-1">
          <ModeToggle />
          <Button asChild variant="ghost">
            <Link href="/cart">
              <ShoppingCart />
              Cart
            </Link>
          </Button>
          <UserButton />
        </nav>
        <nav className="md:hidden">
          <Sheet>
            <SheetTrigger className="align-middle">
              <EllipsisVertical />
            </SheetTrigger>
            <SheetContent className="flex flex-col items-start px-3 py-4">
              <SheetTitle>Menu</SheetTitle>
              <ModeToggle />
              <Button asChild variant="ghost">
                <Link href="/cart">
                  <ShoppingCart />
                  Cart
                </Link>
              </Button>
              <UserButton />
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </>
  );
};
