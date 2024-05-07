"use server";
import { auth } from "@clerk/nextjs/server";
import { api } from "../../convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { getAuthToken } from "./_auth";
export type UploadFileType = {
  name: string;
  file: File | null;
};

export default async function uploadFile({
  name,
  file,
  orgId,
}: UploadFileType & { orgId: string }) {
  const token = await getAuthToken();
  await fetchMutation(
    api.files.createFile,
    {
      name,
      orgId,
    },
    { token }
  );
}
