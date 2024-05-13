"use server";
import { auth } from "@clerk/nextjs/server";
import { api } from "../../convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { getAuthToken } from "./_auth";
import { fileTypeFromBuffer } from "file-type";
export type UploadFileType = {
  name: string;
  file: File | null;
};

export default async function uploadFile(payload: FormData) {
  console.log(payload.get("file"));
  const token = await getAuthToken();
  const fileBufferArray = await (payload.get("file") as File).arrayBuffer();
  const fileType = (await fileTypeFromBuffer(fileBufferArray))?.mime;

  await fetchMutation(
    api.files.createFile,
    {
      name: payload.get("name") as string,
      orgId: payload.get("orgId") as string,
      file: fileBufferArray,
      fileType:fileType || "application/octet-stream"
    },
    { token }
  );
}
