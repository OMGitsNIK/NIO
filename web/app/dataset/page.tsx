
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import axios from "axios" // Import axios for making API requests
import { CONFIG } from "@/lib/config"

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
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xl font-semibold mb-4">Sponges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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