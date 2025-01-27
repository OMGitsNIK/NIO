"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Dataset } from "@/types/db";


interface EditDatasetModalProps {
  children: React.ReactNode
  dataset: Dataset
  onEditDataset: (id: number, updatedDataset: Partial<Dataset>) => void
}

export function EditDatasetModal({ children, dataset, onEditDataset }: EditDatasetModalProps) {
  const [open, setOpen] = useState(false)
  const [datasetName, setDatasetName] = useState(dataset.title)
  const [datasetDescription, setDatasetDescription] = useState(dataset.description)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>(dataset.image)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      setImage(acceptedFiles[0])
      setPreview(URL.createObjectURL(acceptedFiles[0]))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: false
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onEditDataset(dataset.id, {
      title: datasetName,
      description: datasetDescription,
      image: preview,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Dataset</DialogTitle>
          <DialogDescription>
            Make changes to your dataset here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={datasetDescription}
                onChange={(e) => setDatasetDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Image</Label>
              <div
                {...getRootProps()}
                className="col-span-3 border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <input {...getInputProps()} />
                <div className="relative w-full h-32">
                  <Image
                    src={preview}
                    alt="Dataset preview"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {isDragActive
                    ? "Drop the image here"
                    : "Drag 'n' drop a new image here, or click to select one"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}