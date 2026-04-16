"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Check } from "lucide-react";

export default function CheckoutSuccessModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the URL has ?status=success
    if (searchParams.get("status") === "success") {
      setIsOpen(true);
    }
  }, [searchParams]);

  const handleAcknowledge = () => {
    setIsOpen(false);
    // Remove the ?status=success&checkout_id=... from the URL cleanly
    router.replace(pathname);
    router.refresh();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="border-border bg-card text-card-foreground max-w-sm text-center!">
        <AlertDialogHeader className="flex flex-col items-center justify-center gap-2">
          <div className="bg-primary/10 mx-auto flex size-12 items-center justify-center rounded-full">
            <Check className="text-primary size-6" />
          </div>

          <AlertDialogTitle className="mx-auto text-xl tracking-tight">
            Payment Successful
          </AlertDialogTitle>

          <AlertDialogDescription className="text-muted-foreground text-center">
            Your account has been upgraded. Your new generation credits have
            been added and are ready to use.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction
            onClick={handleAcknowledge}
            className="w-full sm:w-auto"
          >
            Start Creating
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
