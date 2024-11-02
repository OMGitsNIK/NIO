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

type Dataset = {
  id: number
  name: string
  species: string
  location: string
  date: string
  access: "Full" | "View"
  thumbnail: string
}

type EditDatasetModalProps = {
  dataset: Dataset | null
  onClose: () => void
}

export function EditDatasetModal({ dataset, onClose }: EditDatasetModalProps) {
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Name
            </Label>
            <Input id="edit-name" defaultValue={dataset.name} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-species" className="text-right">
              Species
            </Label>
            <Input id="edit-species" defaultValue={dataset.species} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-location" className="text-right">
              Location
            </Label>
            <Input id="edit-location" defaultValue={dataset.location} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-date" className="text-right">
              Date
            </Label>
            <Input id="edit-date" type="date" defaultValue={dataset.date} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onClose}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}s