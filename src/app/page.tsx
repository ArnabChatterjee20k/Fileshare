import { Button } from "@/components/ui/button";
import { SignOutButton, SignedIn,SignInButton,SignedOut } from "@clerk/nextjs";

export default function Home() {
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
