import React from "react";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <main>{children}</main>
      <ToastViewport />
    </ToastProvider>
  );
}
