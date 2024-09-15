"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CONFIG } from "@/lib/config";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file_dropzone";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    console.log("Upload .......");
    console.log(file);

    try {
      const response = await axios.post(
        `${CONFIG.SERVER_URL}/v1/sponge/bulk/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload successful:", response.data);
      uploadAndClose();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const uploadAndClose = () => {
    if (!file) return;
    setDialogOpen(false);
    setFile(null);
  };

  return (
    <>
      <FileDropzone onFile={(nfile) => setFile(nfile)} />
      <div className="flex justify-between mt-4">
        <Button onClick={uploadFile} disabled={!file} className="flex-1">
          Upload
        </Button>
        <Button
          onClick={() => setDialogOpen(false)}
          variant={"destructive"}
          className="flex-1"
        >
          Close
        </Button>
      </div>
    </>
  );
}
