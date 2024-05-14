import { Button } from "@/components/ui/button";
import {
  UserButton,
  UserProfile,
  OrganizationSwitcher,
  SignedOut,
  SignInButton,
  Protect,
} from "@clerk/nextjs";
import Link from "next/link";

export function Header() {
  return (
    <header className="text-gray-50 body-font shadow-md">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
          <span className="ml-3 text-xl">FileShare</span>
        </a>
        <nav className="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400	flex flex-wrap items-center text-base justify-center">
          <Link
            href="/"
            className="mr-5 text-gray-500 hover:text-gray-900 font-medium cursor-pointer"
          >
            All Files
          </Link>
          <Link
            href="/trash"
            className="mr-5 text-gray-500 hover:text-gray-900 font-medium cursor-pointer"
          >
            Trash
          </Link>
        </nav>
        <div className="flex gap-3">
          <OrganizationSwitcher />
          <UserButton />
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
