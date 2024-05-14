"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import UploadButton from "@/components/UploadButton";
import FileCard from "@/components/FileCard";
import EmptyBox from "@/components/EmptyBox";
import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function Home() {
  const {orgId,user} = useAuth()
  // if organisation not present dont run this query using skip
  const files = useQuery(api.files.getFiles, orgId ? { orgId,fileType:"nondeleted" } : "skip");
  if (files === undefined)
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2Icon className="h-14 w-14 animate-spin" />
        <p>Loading....</p>
      </div>
    );
  return (
    <main className="container mx-auto pt-12">
      {files?.length ? (
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Your Files</h1>
          {orgId && <UploadButton orgId={orgId} />}
        </div>
      ) : null}
      {files?.length === 0 && (
        <div className="mx-auto flex flex-col items-center justify-center gap-4 min-h-[60vh]">
          <EmptyBox className="max-w-[300px]" />
          <p className="text-2xl mx-auto text-center">
            You have no files, upload one now
          </p>
          {orgId && <UploadButton orgId={orgId} />}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {user.isLoaded && files?.map((file) => <FileCard file={file} />)}
      </div>
    </main>
  );
}
