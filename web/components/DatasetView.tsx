"use client"

import Image from "next/image"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditDatasetModal } from "./EditDatasetModal"
import Link from "next/link"

interface Dataset {
  id: number
  title: string
  description: string
  items: number
  createdDate: string
  image: string
}

interface DatasetViewProps {
  datasets: Dataset[]
  onEditDataset: (id: number, updatedDataset: Partial<Dataset>) => void
  onDeleteDataset: (id: number) => void
}

export function DatasetView({ datasets, onEditDataset, onDeleteDataset }: DatasetViewProps) {

  return (
    <div className="grid grid-cols-2 gap-6">
      {datasets.map((dataset) => (
        <Card key={dataset.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-bold">{dataset.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditDatasetModal dataset={dataset} onEditDataset={onEditDataset} >
                  <DropdownMenuItem >
                    Edit
                  </DropdownMenuItem>
                </EditDatasetModal>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDeleteDataset(dataset.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
              <Link href={`/dashboard/dataset`}>
                <Image
                  src={dataset.image}
                  alt={`${dataset.title} thumbnail`}
                  fill
                  sizes="(max-width: 768px) 100vw, 1280px"
                  className="object-cover"
                />
              </Link>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{dataset.description}</p>
              <p className="text-sm text-muted-foreground">{dataset.items} Items</p>
              <p className="text-sm text-muted-foreground">Created on {dataset.createdDate}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}