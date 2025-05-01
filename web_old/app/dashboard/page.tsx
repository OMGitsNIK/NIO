"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { SidebarComponent } from "@/components/Sidebar"
import { DatasetView } from "@/components/DatasetView"
import axios from "axios"
import { CONFIG } from "@/lib/config"

interface Dataset {
  id: number
  title: string
  description: string
  items: number
  createdDate: string
  image: string
}

export default function DashboardPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      
      const response = await fetch(`${CONFIG.SERVER_URL}/v1/dataset`);
      const data = await response.json();
      setDatasets(data);
    };

    fetchData();
  }, []);

 

  const editDataset = (id: number, updatedDataset: Partial<Dataset>) => {
			setDatasets((prevDatasets) =>
				prevDatasets.map((dataset) =>
					dataset.id === id ? { ...dataset, ...updatedDataset } : dataset,
				),
			);
		};

  const deleteDataset = (id:number) => {
    setDatasets(prevDatasets =>
      prevDatasets.filter(dataset =>dataset.id!=id)
    )
  }

  return (
				<main className="flex-1 overflow-auto p-6 md:w-[75%] w-full mt-8 md:mt-4">
          <DatasetView
						datasets={datasets}
						onEditDataset={editDataset}
						onDeleteDataset={deleteDataset}
					/>
				</main>
		);
}