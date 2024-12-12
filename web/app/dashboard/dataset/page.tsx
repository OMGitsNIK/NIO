
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import axios from "axios" // Import axios for making API requests
import { CONFIG } from "@/lib/config"
import { DashboardHeader } from "@/components/DashboardHeader"
import { SidebarComponent } from "@/components/Sidebar"

export default function DatasetImages() {
    const [results, setResults] = useState<null | Array<{
        color: string | null;
        created_at: string;
        habitat: string | null;
        id: number;
        location: string | null;
        name: string | null;
        pores: string | null;
        scientific_name: string | null;
        size: string | null;
        texture: string | null;
      }>>(null);
      useEffect(() => {
        axios
          .get(`${CONFIG.SERVER_URL}/v1/sponge/?limit=0`)
          .then((response) => {
            setResults(response.data);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      }, []);
    
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
    <SidebarComponent onAddDataset={function (dataset: { title: string; description: string; image: string; items: number; createdDate: string }): void {
              throw new Error("Function not implemented.")
          } } />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:w-[80%] w-full">
          <h2 className="text-black text-xl font-semibold mb-4">Sponges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results?.map((sponge) => (
          <Link
            href={`/dashboard/sponge/${sponge.id}`}
            key={sponge.id}
            className="aspect-square w-full block relative cursor-pointer   "
          >
            <Image
              src={`${CONFIG.SERVER_URL}/v1/sponge/image/${sponge.id}/`}
              alt=""
              className="aspect-square object-cover"
              width={500}
              height={500}
              unoptimized
            />
            <div className="absolute bottom-0 left-0  p-2 backdrop-blur-md w-full">
              <h1 className="font-bold">{sponge.name}</h1>
              <h1 className="text-sm">{sponge.scientific_name}</h1>
            </div>
          </Link>
        ))}
          </div>
        </main>
      </div>
    </div>
  )
}