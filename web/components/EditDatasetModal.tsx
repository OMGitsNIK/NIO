import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Dataset } from "@/app/dashboard/researcher/page"
import Image from "next/image"

type EditDatasetModalProps = {
  dataset: Dataset | null
  onClose: () => void
  onUpdateDataset: (updatedDataset: Dataset) => void
}

export function EditDatasetModal({ dataset, onClose, onUpdateDataset }: EditDatasetModalProps) {
  const [name, setName] = useState("")
  const [species, setSpecies] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState("")

  useEffect(() => {
    if (dataset) {
      setName(dataset.name)
      setSpecies(dataset.species)
      setLocation(dataset.location)
      setDate(dataset.date)
      setThumbnailPreview(dataset.thumbnail)
    }
  }, [dataset])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (dataset) {
      const updatedDataset: Dataset = {
        ...dataset,
        name,
        species,
        location,
        date,
        thumbnail: thumbnail ? URL.createObjectURL(thumbnail) : dataset.thumbnail
      }
      onUpdateDataset(updatedDataset)
      onClose()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0])
      setThumbnailPreview(URL.createObjectURL(e.target.files[0]))
    }
  }

  if (!dataset) return null

  return (
    <Dialog open={!!dataset} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Dataset</DialogTitle>
          <DialogDescription>
            Make changes to the dataset. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name"   className="text-right">
                Name
              </Label>
              <Input 
                id="edit-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="col-span-3" 
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-species" className="text-right">
                Species
              </Label>
              <Input 
                id="edit-species" 
                value={species} 
                onChange={(e) => setSpecies(e.target.value)} 
                className="col-span-3" 
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location
              </Label>
              <Input 
                id="edit-location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="col-span-3" 
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Date
              </Label>
              <Input 
                id="edit-date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="col-span-3" 
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-thumbnail" className="text-right">
                Thumbnail
              </Label>
              <div className="col-span-3">
                <Input 
                  id="edit-thumbnail" 
                  type="file" 
                  onChange={handleFileChange} 
                  className="mb-2" 
                  accept="image/*"
                />
                {thumbnailPreview && (
                  <Image 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    width={100} 
                    height={100} 
                    className="object-cover rounded"
                  />
                )}
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