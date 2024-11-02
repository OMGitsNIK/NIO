import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Grid, List, MoreHorizontal, Plus } from "lucide-react"
import { NewDatasetModal } from "./NewDatasetModal"
import { EditDatasetModal } from "./EditDatasetModal"
import { Dataset } from "./Dashboard"
import Image from "next/image"

type DatasetViewProps = {
  datasets: Dataset[]
  onAddDataset: (newDataset: Omit<Dataset, "id">) => void
  onDeleteDataset: (id: number) => void
}

export function DatasetView({ datasets, onAddDataset, onDeleteDataset }: DatasetViewProps) {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [isNewDatasetModalOpen, setIsNewDatasetModalOpen] = useState(false)

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Datasets</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setView("grid")}>
            <Grid className={`h-4 w-4 ${view === 'grid' ? 'text-primary' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setView("list")}>
            <List className={`h-4 w-4 ${view === 'list' ? 'text-primary' : ''}`} />
          </Button>
          <Button onClick={() => setIsNewDatasetModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Dataset
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map((dataset) => (
            <Card key={dataset.id}>
              <CardHeader className="relative">
                <Image src={dataset.thumbnail} alt={dataset.name} width={300} height={200} className="w-full h-40 object-cover rounded-t-lg" />
                <CardTitle className="mt-2">{dataset.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setSelectedDataset(dataset)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onDeleteDataset(dataset.id)}>Delete</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p><strong>Species:</strong> {dataset.species}</p>
                <p><strong>Location:</strong> {dataset.location}</p>
                <p><strong>Date:</strong> {dataset.date}</p>
              </CardContent>
              <CardFooter>
                <Button variant={dataset.access === "Full" ? "default" : "secondary"} className="w-full">
                  {dataset.access === "Full" ? "Edit Dataset" : "View Dataset"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {datasets.map((dataset) => (
            <div key={dataset.id} className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <Image src={dataset.thumbnail} alt={dataset.name} width={80} height={80} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{dataset.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dataset.species} | {dataset.location} | {dataset.date}
                </p>
              </div>
              <Button variant={dataset.access === "Full" ? "default" : "secondary"}>
                {dataset.access === "Full" ? "Edit" : "View"}
              </Button>
            </div>
          ))}
        </div>
      )}

      <NewDatasetModal 
        isOpen={isNewDatasetModalOpen} 
        onClose={() => setIsNewDatasetModalOpen(false)} 
        onAddDataset={onAddDataset}
      />
      <EditDatasetModal dataset={selectedDataset} onClose={() => setSelectedDataset(null)} />
    </>
  )
}