// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // immediately-invoked async function to get initial session
    (async () => {
      const {
        data: { session: initialSession },
        error,
      } = await supabase.auth.getSession();
      if (!error) setSession(initialSession);
    })();

    // subscribe to changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: any, newSession: any) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will fire and set session → null
  };

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

          {session?.user ? (
            <>
              <span className="text-sm cursor-default">
                Hello {session.user.user_metadata.first_name}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
