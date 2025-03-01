"use client";

import React from "react";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Editor from "@/components/editor";

export default function NewWriteupPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1 mb-4">
                <ChevronLeft className="h-4 w-4" />
                Back to dashboard
              </Button>
            </Link>
          </div>
          <Editor />
        </div>
      </main>
    </div>
  );
}
