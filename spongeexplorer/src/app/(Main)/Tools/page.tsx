"use client";
import {
  GravityUiChartAreaStackedNormalized,
  MaterialSymbolsAdd,
  MaterialSymbolsChevronRightRounded,
  MaterialSymbolsCloseRounded,
  MaterialSymbolsKeyboardArrowDownRounded,
  MdiEyeClosed,
  MdiEyeOutline,
  TeenyiconsDragHorizontalOutline,
} from "@/components/icons";
import Image from "next/image";
import { useState } from "react";

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

function Calculation(props: any) {
  const [isOpen, setCalcOpen] = useState(false);
  const [calculatorState, setCalculatorActive] = useState(true);
  return (
    <div className="p-1 bg-zinc-900 w-[22rem] border-[1px] border-white/10 active:border-blue-400/60 rounded-md  select-none">
      <div className="flex items-center w-full justify-center relative">
        <button
          className="hover:bg-slate-600/10 rounded-full p-1 transition"
          onClick={() => setCalcOpen(!isOpen)}
        >
          {isOpen ? (
            <MaterialSymbolsKeyboardArrowDownRounded />
          ) : (
            <MaterialSymbolsChevronRightRounded />
          )}
        </button>
        <span className="w-5 h-auto aspect-square items-center flex  text-sm font-thin text-orange-400 justify-center ">
          <GravityUiChartAreaStackedNormalized />
        </span>
        <input
          className="w-40 bg-zinc-950 p-0.5 px-1  rounded font-thin ml-2 text-sm "
          type="text"
          value={props.name}
        />
        {/* <span className="w-40 bg-zinc-950 p-0.5 px-1  rounded font-thin ml-2 text-sm "></span> */}
        <button
          onClick={() => setCalculatorActive(!calculatorState)}
          className="hover:bg-slate-600/10 rounded-full p-1 transition"
        >
          {calculatorState ? <MdiEyeOutline /> : <MdiEyeClosed />}
        </button>
        <button className="  rounded-full p-0.5">
          <MaterialSymbolsCloseRounded />
        </button>

        <TeenyiconsDragHorizontalOutline className="justify-self-end" />
      </div>
      <div className={`${isOpen ? "h-32" : "h-0"}`}></div>
    </div>
  );
}
function AddCalculatorDropdown() {
  return <div></div>;
}
function AddCalculator() {
  return (
    <div className="p-1 w-[22rem] h-8 mb-3 bg-zinc-900 border-[1px] border-white/10 rounded-md  select-none flex items-center">
      <MaterialSymbolsAdd />
      <h1 className="text-sm">Add Calculator</h1>
    </div>
  );
}
function SidePanel(props: any) {
  return (
    <div
      className={`${props.className} absolute right-0 top-0 h-[calc(100vh-5rem)] w-96 bg-zinc-950  border-l-[1px]  border-white/10 p-4 overflow-y-scroll smallScrollBar`}
    >
      <h1 className="text-xl pb-2">Calculation Stack</h1>
      <div className="gap-1 grid">
        <AddCalculator />
      </div>
      <div className="gap-1 grid">
        <Calculation name="HE Normalization" />
        <Calculation name="Blur" />
        <Calculation name="Equalize" />
        <Calculation name="BW-RGB" />
      </div>
    </div>
  );
}
