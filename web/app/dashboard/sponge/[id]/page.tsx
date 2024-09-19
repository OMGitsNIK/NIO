"use client";
import React, { useEffect, useState } from "react";
import { CONFIG } from "@/lib/config";
import axios from "axios";
import { ImageUpload } from "@/components/ImageUpload";

export default function Page({ params }: { params: { id: string } }) {
  const [sponge, setSponge] = useState<{
    id: string;
    color: string;
    description: string;
    habitat: string;
    location: string;
    name: string;
    pores: string;
    scientific_name: string;
    size: string;
    texture: string;
  } | null>(null);

  useEffect(() => {
    axios
      .get(`${CONFIG.SERVER_URL}/v1/sponge/${params.id}`)
      .then((resp) => setSponge(resp.data));
  }, [params.id]);

  if (!sponge) return <div>Loading...</div>;

  return (
    <main className="p-8  ">
      <div className="flex">
        <ImageUpload sponge={{ id: params.id }} />
        <div className="w-1/2 pl-8">
          <h1 className="text-4xl font-bold  mb-2">{sponge.name}</h1>
          <p className="text-lg mb-4">{sponge.description}</p>
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 pr-4 font-semibold">Size</td>
                <td>{sponge.size}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold">Color</td>
                <td>{sponge.color}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold">Texture</td>
                <td>{sponge.texture}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold">Pores</td>
                <td>{sponge.pores}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold">Habitat</td>
                <td>{sponge.habitat}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold">Location</td>
                <td>{sponge.location}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold">Scientific name</td>
                <td>{sponge.scientific_name}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
