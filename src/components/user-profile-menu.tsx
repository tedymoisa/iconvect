"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export default function UserProfileMenu({ imagePath }: { imagePath: string }) {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        {imagePath ? (
          <div className="relative size-8">
            <Image
              src={imagePath}
              fill={true}
              sizes="32px"
              alt={`${imagePath ?? "User"}'s profile picture`}
              className="rounded-full"
            />
          </div>
        ) : (
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
            <span className="text-l text-primary font-bold">{imagePath.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem className="cursor-pointer" onClick={() => handleSignOut()}>
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
