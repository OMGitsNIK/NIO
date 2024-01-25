"use client";
import { AddCalculator, Calculation } from "@/components/Calculator";
import { MaterialSymbolsAdd } from "@/components/icons";
import Image from "next/image";
import { Key, useState } from "react";
import { Reorder } from "framer-motion";
interface ImageData {
  name: string; // Name of the image processing step
  image_url: string; // URL to the processed image
}

export default function Page() {
  const [imageUrl, setImageUrl] = useState<ImageData[]>();

  const handleUpload = async (e: any) => {
    e.preventDefault();
    const imageInput = e.target.elements.image;
    const imageFile = imageInput.files[0];

    if (!imageFile) {
      return alert("Please select an image to upload.");
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    
    try {
      const response = await fetch("http://127.0.0.1:5000/processImage", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setImageUrl(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!imageUrl) {
    return (
      <main className="p-8 relative">
        <form onSubmit={handleUpload}>
          <input className="" type="file" id="image" name="image" required />
          <button
            className="rounded bg-yellow-500 hover:bg-yellow-300 text-black p-2"
            type="submit"
          >
            Upload Image
          </button>
        </form>
        <SidePanel />
      </main>
    );
  }

  return (
    <main className="p-8 relative">
      <form onSubmit={handleUpload} className="mb-4">
        <input type="file" id="image" name="image" required />
        <button
          className="rounded bg-yellow-500 hover:bg-yellow-300 text-black p-2"
          type="submit"
        >
          Upload Image
        </button>
      </form>
      <div className="flex flex-wrap gap-1 w-full">
        {imageUrl.map((i) => {
          return (
            <div key={i.name}>
              <Image
                src={i.image_url}
                unoptimized
                alt=""
                height={300}
                width={400}
              />
              <h1>{i.name}</h1>
            </div>
          );
        })}
      </div>
      <SidePanel />
    </main>
  );
}
interface CalcStackInterface {
  name: string;
}

const CalcList = [
  { name: "Histogram Equalization" },
  { name: "Blur" },
  { name: "Sobel" },
];



function SidePanel(props: any) {
  const [items, setItems] = useState([
    { id: 0, name: "HE Normalization" },
    { id: 1, name: "Resize" },
    { id: 2, name: "Denoise" },
    { id: 3, name: "Upscale" },
  ]);
  const [CalcStack, setCalcStack] = useState<CalcStackInterface[]>(CalcList);
  const [ActiveCalc, setActiveCalc] = useState(0);

  // Move handleDeleteItem function outside useEffect
  const handleDeleteItem = (index: number) => {
    setCalcStack((prevStack) => prevStack.filter((item, i) => i !== index));
  };

  return (
    <div
      className={`${props.className} absolute right-0 top-0 h-[calc(100vh-5rem)] w-96 bg-zinc-950  border-l-[1px]  border-white/10 p-4 overflow-y-scroll smallScrollBar`}
    >
      <h1 className="text-xl pb-2">Calculation Stack</h1>
      <div className="gap-1 grid">
        <AddCalculator
          onAdd={() => {
            setItems((prev) => {
              return [
                ...prev,
                {
                  id:
                    prev.length > 0
                      ? Math.max(...prev.map((i) => i.id)) + 1
                      : 0,
                  name: "Upscale",
                },
              ];
            });
          }}
        />
      </div>
      <div className="gap-1 grid">
        <Calculators
          items={items}
          setItems={setItems}
          ActiveCalc={ActiveCalc}
          setActiveCalc={setActiveCalc}
        />
      </div>
    </div>
  );
}

function Calculators({
  items,
  setItems,
  ActiveCalc,
  setActiveCalc,
}: {
  setItems: any;
  items: Array<{ id: number; name: string }>;
  ActiveCalc: number;
  setActiveCalc: any;
}) {
  return (
    <>
      <Reorder.Group as="div" axis="y" values={items} onReorder={setItems}>
        {items.map((item: { id: Key | null | undefined; name: string }) => (
          <Calculation
            key={item.id}
            item={item}
            onDeleteCalculator={() => {
              setItems(
                (prev: Array<{ id: Key | null | undefined; name: string }>) => {
                  return prev.filter((i) => i.id !== item.id);
                }
              );
            }}
            onClick={() => setActiveCalc(item)}
            isActive={ActiveCalc == 1}
            name={item.name}
          />
        ))}
      </Reorder.Group>
    </>
  );
}


