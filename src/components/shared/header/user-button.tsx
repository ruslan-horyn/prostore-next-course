import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/user.actions";
import { UserIcon } from "lucide-react";

export const UserButton = async () => {
  const session = await auth();

  if (!session || !session.user) {
    return (
      <Button asChild>
        <Link href="/sign-in">
          <UserIcon />
          Sign In
        </Link>
      </Button>
    );
  }
  const userName = session.user.name ?? "User";
  const firstInitial = userName.trim().charAt(0).toUpperCase();

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="default"
              className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center"
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem className="p-0 mb-1">
            <form action={signOut} className="w-full">
              <Button
                className="w-full py-4 px-2 h-4 justify-start"
                variant="ghost"
              >
                Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
