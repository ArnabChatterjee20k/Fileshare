"use client";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogContent,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useFormState, useFormStatus } from "react-dom";
import uploadFile from "@/actions/upload-file-action";
import type { UploadFileType } from "@/actions/upload-file-action";
import { useToast } from "./ui/use-toast";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function UploadButton({ orgId }: { orgId: string }) {
  const { toast } = useToast();
  async function uploadFileHandler(
    prevState: UploadFileType,
    payload: FormData
  ) {
    // @ts-ignore
    // we can check here the file is present or not to remove the ts errors
    const file = payload.get("file")[0] as File;
    const name = payload.get("name") as string;
    try {
      await uploadFile({ name, file, orgId });
      toast({
        title: "File uploaded",
        description: "Now everyone can view your file",
      });
    } catch (error) {
      console.log({ error });
      toast({
        title: "File upload error",
        description: "Some problems occured while uploading files",
      });
    }
    return { file: null, name: "" };
  }
  const [formState, onCreateFileAction] = useFormState<
    UploadFileType,
    FormData
  >(uploadFileHandler, {
    name: "",
    file: null,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Upload</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload your file here</DialogTitle>
          <DialogDescription>
            The file will be accessible by anyone in the organisation
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" action={onCreateFileAction}>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="filename">Filename</Label>
            <Input
              name="name"
              id="filename"
              type="text"
              placeholder="type your filename"
              defaultValue={formState.name}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">File</Label>
            <Input
              name="file"
              id="file"
              type="file"
              value={formState.file ? formState.file.name : undefined}
            />
          </div>
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="flex gap-1" disabled={pending} type="submit">
      {pending && <Loader2 size={15} className="animate-spin text-white" />}
      Submit
    </Button>
  );
}