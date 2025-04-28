"use client";

import { LogOut } from "lucide-react";
import { type Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export default function UserProfileMenu({ session }: { session: Session }) {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        {session?.user.image ? (
          <div className="relative size-8">
            <Image
              src={session.user.image}
              fill={true}
              alt={`${session?.user.name ?? "User"}'s profile picture`}
              className="rounded-full"
            />
          </div>
        ) : (
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
            <span className="text-l text-primary font-bold">{session?.user.name?.charAt(0).toUpperCase()}</span>
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
