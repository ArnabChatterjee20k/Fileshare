"use server";
import { api } from "../../convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { getAuthToken } from "./_auth";
import type { GenericId } from "convex/values";
export default async function restoreFile({
  fileId,
  orgId,
}: {
  fileId: GenericId<"files">;
  orgId: string;
}) {
  const token = await getAuthToken();
  await fetchMutation(
    api.files.trash,
    {
      fileId,
      orgId,
      operation:"restoreFromTrash"
    },
    { token }
  );
}
