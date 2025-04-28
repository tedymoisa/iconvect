"use client";

import { cn } from "@/lib/utils";
import { useDialogStore } from "@/store/dialog";
import { Coins, Menu, X } from "lucide-react";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./logo";
import ThemeChanger from "./theme-changer";
import { Button } from "./ui/button";
import UserProfileIcon from "./user-profile-menu";

const navigation = [
  {
    name: "Homepage",
    href: "/"
  },
  {
    name: "Prices",
    href: "/prices"
  }
];

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isCursorAtTop, setIsCursorAtTop] = useState(false);

  useEffect(() => {
    const scrollHideThreshold = 50;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      if (!isCursorAtTop) {
        if (scrollingDown && currentScrollY > scrollHideThreshold) {
          setIsVisible(false);
        } else if (!scrollingDown || currentScrollY <= scrollHideThreshold) {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(Math.max(0, currentScrollY));
    };

    const mouseTopZone = 125;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= mouseTopZone) {
        if (!isCursorAtTop) {
          setIsCursorAtTop(true);
          setIsVisible(true);
        }
      } else {
        if (isCursorAtTop) {
          setIsCursorAtTop(false);
          if (window.scrollY > scrollHideThreshold) {
            setIsVisible(false);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [lastScrollY, isCursorAtTop]);

  return (
    <nav
      className={cn(
        "bg-background fixed top-0 left-0 z-50 w-full transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/">
          <div className="flex items-center gap-x-4">
            <Logo className="text-primary h-10 w-auto" />
            <span className="text-2xl font-extrabold tracking-tight">IconVect</span>
          </div>
        </Link>

        <div className="flex items-center gap-x-4">
          <NavbarLinks />
          <LeftSideNavbar />
          <HamburgerMenu />
        </div>
      </div>
    </nav>
  );
}

const NavbarLinks = () => {
  return (
    <div className="hidden gap-x-4 md:flex">
      <ThemeChanger />
      {navigation.map((item) => (
        <Button key={item.name} asChild variant={"ghost"}>
          <Link href={item.href}>{item.name}</Link>
        </Button>
      ))}
    </div>
  );
};

const HamburgerMenu = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex md:hidden">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        className="size-7"
        asChild
      >
        {mobileMenuOpen ? <X /> : <Menu />}
      </Button>

      <div
        className={cn(
          "bg-background absolute top-16 left-0 w-full overflow-hidden transition-all duration-300 md:hidden",
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-y-2 p-4">
          {navigation.map((item) => (
            <Button
              key={item.name}
              asChild
              variant={"secondary"}
              className="w-fit justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ))}
          <ThemeChanger />
        </div>
      </div>
    </div>
  );
};

const LeftSideNavbar = () => {
  const { data: session, status } = useSession();
  const { setIsOpen } = useDialogStore();

  const isAuthenticated = status === "authenticated";

  if (status === "loading") {
    return undefined;
  }

  return (
    <div className={cn("flex items-center gap-x-4")}>
      {isAuthenticated ? (
        <>
          <Credits session={session} />
          <UserProfileIcon session={session} />
        </>
      ) : (
        <Button onClick={() => setIsOpen(true)}>Login</Button>
      )}
    </div>
  );
};

const Credits = ({ session }: { session: Session }) => {
  return (
    <Link href="/prices">
      <div className="bg-muted flex w-fit items-center gap-x-1 rounded-md border px-3 py-1 text-sm">
        <Coins className="h-4 w-4" />
        <span className="font-bold">{session.user.credits}</span>
      </div>
    </Link>
  );
};
