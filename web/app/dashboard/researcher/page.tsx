"use client"

import { DatasetView } from "@/components/DatasetView"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { useState } from "react"
import initialDatasets from "@/public/dataset.json"


export type Dataset = {
  id: number
  name: string
  species: string
  location: string
  date: string
  access: "Full" | "View"
  thumbnail: string
}

export default function Dashboard() {
  const [datasets, setDatasets] = useState(initialDatasets)

  const addDataset = (newDataset: Omit<Dataset, "id">) => {
    const id = Math.max(...datasets.map(d => d.id), 0) + 1
    const datasetWithId = { ...newDataset, id }
    setDatasets([...datasets, datasetWithId])
    // In a real application, you would also update the server here
  }

  const deleteDataset = (id: number) => {
    setDatasets(datasets.filter(dataset => dataset.id !== id))
    // In a real application, you would also update the server here
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <DatasetView 
            datasets={datasets} 
            onAddDataset={addDataset} 
            onDeleteDataset={deleteDataset} 
          />
        </main>
      </div>
    </div>
  )
}