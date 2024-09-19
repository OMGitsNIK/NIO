"use client";

import { CONFIG } from "@/lib/config";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
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
    <main className="p-8">
      <h1 className="text-2xl">Sponges</h1>

      <div className="columns-2 md:columns-4 space-y-3 mt-3">
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
  );
}
