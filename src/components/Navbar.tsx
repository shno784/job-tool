// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then((response: { data: { session: any } }) =>
        setSession(response.data.session)
      );
    const { data: sub } = supabase.auth.onAuthStateChange((_: any, s: any) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-semibold">
          AI Job Toolkit
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="flex space-x-4">
            {[
              ["Resume Analyzer", "/resume-analyser"],
              ["Job Matcher", "/job-matcher"],
              ["Cover Letter", "/cover-letter"],
              ["Dashboard", "/dashboard"],
            ].map(([label, href]) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink asChild>
                  <Link href={href}>{label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-2">
          <ModeToggle />

          {session ? (
            <>
              <span className="text-sm">{session.user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => supabase.auth.signOut()}
                className="cursor-pointer"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="cursor-pointer">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
