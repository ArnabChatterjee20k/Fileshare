"use client";
import React, { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMaterialFileIcon } from "file-extension-icon-js";

import { EllipsisVertical, Loader2, TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Doc } from "../../convex/_generated/dataModel";
import { DialogClose } from "@radix-ui/react-dialog";
import deleteFile from "@/actions/delete-file-action";
import { toast } from "./ui/use-toast";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FileCard({ file }: { file: Doc<"files"> }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransistion, startTransition] = useTransition();
  function deleteFileAction() {
    startTransition(() => {
      deleteFile({ fileId: file._id, orgId: file.orgId || "" })
        .then(() => {
          toast({
            variant: "default",
            title: `${file.name} marked for deleteion`,
            description: (
              <span>
                You can restore the file from <Link href="/trash">trash</Link>
              </span>
            ),
          });
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            description: `Error while deleting ${file.name}`,
          });
        });
    });
  }
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-1 items-center">
          {file.fileType && (
            <img
              src={`${getMaterialFileIcon(file?.fileType?.split("/")[1] as string)}`}
              alt="js"
              width="18"
            />
          )}
          {file.name}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger className="absolute right-0 top-5 mx-2">
            <EllipsisVertical size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={() => setIsDialogOpen(true)}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CardDescription>
          {new Date(file._creationTime).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[70px]">
        {file.thumbnailURL ? (
          <img
            src={file.thumbnailURL}
            alt="Image"
            className="object-cover w-full h-full"
          />
        ) : (
          <p>No preview available</p>
        )}
      </CardContent>
      <CardFooter>
        {file.storageId ? (
          <a href={file.storageURL} target="_blank">
            <Button>Download</Button>
          </a>
        ) : (
          <Badge
            className="flex items-center gap-1 py-1 px-2"
            variant="secondary"
          >
            <Loader2 className="animate-spin" size={15} />
            Uploading
          </Badge>
        )}
      </CardFooter>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              file
              <form action={deleteFileAction}>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Close
                    </Button>
                  </DialogClose>
                  <Button variant="destructive" disabled={isTransistion}>
                    {isTransistion && (
                      <Loader2 size={15} className="animate-spin text-white" />
                    )}
                    Delete
                  </Button>
                </DialogFooter>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
