"use client"
import { Button } from "@/components/ui/button";
import {
  SignOutButton,
  SignedIn,
  SignInButton,
  SignedOut,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useConvex, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();

  let orgId = null;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  // if organisation not present dont run this query using skip
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* if signed in it will be visible */}
      <SignedIn>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn>
      {/* if signed out then this will be visible */}
      <SignedOut>
        <SignInButton mode="modal">
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
    </main>
  );
}
