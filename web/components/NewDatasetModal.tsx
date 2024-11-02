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
import { useState } from "react"

type NewDatasetModalProps = {
  isOpen: boolean
  onClose: () => void
  onAddDataset: (dataset: Dataset) => void
}

// ... existing code ...

export function NewDatasetModal({ isOpen, onClose, onAddDataset }: NewDatasetModalProps) {
    const [name, setName] = useState("")
    const [species, setSpecies] = useState("")
    const [location, setLocation] = useState("")
    const [date, setDate] = useState("")
    const [thumbnail, setThumbnail] = useState<File | null>(null)
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
  
      // Handle image upload logic here
      const thumbnailUrl = thumbnail ? URL.createObjectURL(thumbnail) : "/placeholder.svg?height=100&width=100"
  
      onAddDataset({
        name,
        species,
        location,
        date,
        access: "Full",
        thumbnail: thumbnailUrl
      })
      onClose()
      // Reset form
      setName("")
      setSpecies("")
      setLocation("")
      setDate("")
      setThumbnail(null)
    }
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Dataset</DialogTitle>
            <DialogDescription>
              Enter the details for your new dataset. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Existing input fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="col-span-3" 
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="species" className="text-right">
                  Species
                </Label>
                <Input 
                  id="species" 
                  value={species} 
                  onChange={(e) => setSpecies(e.target.value)} 
                  className="col-span-3" 
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input 
                  id="location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="col-span-3" 
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="col-span-3" 
                  required
                />
              </div>
              {/* New file input for image */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="thumbnail" className="text-right">
                  Thumbnail
                </Label>
                <Input 
                  id="thumbnail" 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)} 
                  className="col-span-3"
                />
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