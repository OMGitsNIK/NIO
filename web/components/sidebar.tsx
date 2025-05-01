"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Activity } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signOut, useSession } from "next-auth/react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";

export const Sidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateDataset = async () => {
    if (!name || !session?.user) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("visibility", "private");
      formData.append("user_id", session.user.id);

      const { data } = await axiosInstance.post(
        `/v1/${session.user.id}/dataset/`,
        formData,
      );

      // Assume backend returns new dataset id, adjust if needed
      const datasetId = data.id;

      router.push(`/dashboard/dataset/${datasetId}`);
    } catch (error) {
      console.error("Error creating dataset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white border-r border-gray-100 p-6 flex flex-col items-start">
      <div className="flex items-center gap-3 mb-10">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <h1 className="text-lg font-medium tracking-tight text-gray-900">
          Sponge Analyzer
        </h1>
      </div>

      {session?.user && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-sky-500 hover:bg-sky-400">
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-4 p-6 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              {/* <DialogDescription>
                  Enter a name and description for your new collection.
                </DialogDescription> */}
            </DialogHeader>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection Name"
              required
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
            />
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleCreateDataset}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Collection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="w-full space-y-3">
        <Link
          href="/dashboard"
          className="w-full justify-start flex items-center py-2 text-gray-700 hover:text-indigo-600 transition-colors duration-150"
        >
          <LayoutDashboard className="mr-3 h-4 w-4" /> Dashboard
        </Link>
        {/* <Link
          href="/analyze"
          className="w-full justify-start items-center flex py-2 text-gray-700 hover:text-indigo-600 transition-colors duration-150"
        >
          <Activity className="mr-3 h-4 w-4" /> Analyze
        </Link> */}
      </div>
      <Button onClick={() => signOut()}>Logout</Button>
    </div>
  );
};
