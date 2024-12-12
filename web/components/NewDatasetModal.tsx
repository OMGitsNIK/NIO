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
import { Plus } from 'lucide-react'

interface NewDatasetModalProps {
  onAddDataset: (dataset: {
    userId: string
    title: string
    description: string
    // image: string
    // items: number
    // createdDate: string
  }) => void
}

export function NewDatasetModal({ onAddDataset }: NewDatasetModalProps) {
  const [open, setOpen] = useState(false)
  const [datasetName, setDatasetName] = useState("")
  const [datasetDescription, setDatasetDescription] = useState("")
  // const [image, setImage] = useState<File | null>(null)
  // const [preview, setPreview] = useState<string>("")

  // const onDrop = useCallback((acceptedFiles: File[]) => {
  //   if (acceptedFiles?.[0]) {
  //     setImage(acceptedFiles[0])
  //     setPreview(URL.createObjectURL(acceptedFiles[0]))
  //   }
  // }, [])

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDrop,
  //   accept: {
  //     'image/jpeg': ['.jpeg', '.jpg'],
  //     'image/png': ['.png'],
  //     'image/webp': ['.webp']
  //   },
  //   multiple: false
  // })

  const refresh = () => {

   }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (datasetName && datasetDescription) { //&&preview
      onAddDataset({
        userId:'',
        title: datasetName,
        description: datasetDescription,
        })
      setOpen(false)
      refresh()
      // setDatasetName("")
      // setDatasetDescription("")
      // setImage(null)
      // setPreview("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-32 py-6 mx-8 bg-[#02B1CC] hover:bg-teal-700 text-white text-xl font-mono rounded-xl">
          <Plus className=" h-4 w-4" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle>Add New Dataset</DialogTitle>
          <DialogDescription>
            Create a new dataset for sponge analysis. Fill out the details below.
          </DialogDescription>
        </DialogHeader>
        {/* private and public button */}
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
                // {...getRootProps()}
                className="col-span-3 border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                {/* <input {...getInputProps()} /> */}
                {/* {preview ? (
                  <div className="relative w-full h-32">
                    <Image
                      src={preview}
                      alt="Dataset preview"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div> */}
                {/* ) : (
                  <p className="text-sm text-gray-500">
                    {isDragActive
                      ? "Drop the image here"
                      : "Drag 'n' drop an image here, or click to select one"}
                  </p>
                )} */}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Dataset</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}