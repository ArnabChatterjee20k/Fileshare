"use client";
import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useConvex, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import UploadButton from "@/components/UploadButton";
export default function Home() {
  const organization = useOrganization();
  const user = useUser();

  let orgId = null;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  user.isLoaded && console.log(user.user?.id);
  // if organisation not present dont run this query using skip
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your Files</h1>
        {orgId && <UploadButton orgId={orgId} />}
      </div>
      {user.isLoaded && files?.map((file) => <h2>{file.name}</h2>)}
    </main>
  );
}
