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
import { EllipsisVertical, Loader2, TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Doc } from "../../convex/_generated/dataModel";
import { DialogClose } from "@radix-ui/react-dialog";
import deleteFile from "@/actions/delete-file-action";
import { toast } from "./ui/use-toast";

export default function FileCard({ file }: { file: Doc<"files"> }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransistion, startTransition] = useTransition();
  function deleteFileAction() {
    startTransition(() => {
      deleteFile({ fileId: file._id, orgId: file.orgId || "" })
        .then(() => {
          toast({
            variant: "default",
            description: `${file.name} deleted`,
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
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>{file.name}</CardTitle>
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
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <Button>Download</Button>
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
