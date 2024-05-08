"use server";
import { auth } from "@clerk/nextjs/server";
import { api } from "../../convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { getAuthToken } from "./_auth";
export type UploadFileType = {
  name: string;
  file: File | null;
};

export default async function uploadFile(payload: FormData) {
  console.log(payload.get("file"));
  const token = await getAuthToken();
  await fetchMutation(
    api.files.createFile,
    {
      name: payload.get("name") as string,
      orgId: payload.get("orgId") as string,
      file: await (payload.get("file") as File).arrayBuffer(),
    },
    { token }
  );
}
