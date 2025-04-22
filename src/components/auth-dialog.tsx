"use client";

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { useDialogStore } from "@/store/dialog";
import { LoginForm } from "./login-form";
import { Button } from "./ui/button";

export default function AuthModal() {
  const { isOpen, setIsOpen } = useDialogStore();
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>Login with your Github or Google account to generate something</DialogDescription>
          <LoginForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
