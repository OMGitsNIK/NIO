import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CONFIG } from "@/lib/config";

export function ImageUpload({ sponge }: { sponge: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setDialogOpen(true); // Open the dialog after selecting an image
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch(
        `${CONFIG.SERVER_URL}/v1/sponge/image/${sponge.id}/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        className="hidden"
      />
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className="relative aspect-square cursor-pointer bg-gray-300 size-96 group"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src={
            selectedImage
              ? URL.createObjectURL(selectedImage)
              : `${CONFIG.SERVER_URL}/v1/sponge/image/${sponge.id}/`
          }
          alt=""
          className="aspect-square relative z-0  h-full w-full object-cover rounded-xs"
          width={400}
          height={400}
          unoptimized
        />
        <div className=" z-10 group-hover:backdrop-blur  transition-all inset-0 absolute bg-transparent group-hover:bg-neutral-900/20" />
        <UploadCloud className=" absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 size-12 transition text-transparent group-hover:text-white" />
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="flex flex-row gap-4">
            <Image
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : "/tom-frances-palattao-P20lUFepldA-unsplash.jpg"
              }
              alt=""
              className="aspect-square relative z-0   object-cover rounded size-32"
              width={400}
              height={400}
              unoptimized
            />
            <div className="flex flex-col items-start">
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will replace the selected image.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleUpload();
                setDialogOpen(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
