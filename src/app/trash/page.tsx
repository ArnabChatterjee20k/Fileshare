"use client"
import useAuth from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../convex/_generated/api";
import { Loader2Icon } from "lucide-react";
import FileCard from "@/components/FileCard";

export default function Trash() {
  const { orgId, user } = useAuth();
  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, fileType: "deleted" } : "skip"
  );
  if (files === undefined)
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2Icon className="h-14 w-14 animate-spin" />
        <p>Loading....</p>
      </div>
    );
  return (
    <main className="container mx-auto pt-12">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {user.isLoaded && files?.map((file) => <FileCard file={file} />)}
      </div>
    </main>
  );
}
