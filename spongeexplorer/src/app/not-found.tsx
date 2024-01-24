"use client";
import Image from "next/image";
import sponge_lottie_animation_data from "../../public/sponge_lottie.json";

// import "./globals.css";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import Lottie from "lottie-react";

const SpaceGrotesk = Space_Grotesk({
  preload: false,
});

export default function Custom404() {
  return (
    <div className="flex flex-col  h-[35rem] items-center justify-center">
      <Lottie
        animationData={sponge_lottie_animation_data}
        className="flex justify-center items-center w-80 h-auto aspect-square"
        loop={true}
      />
      {/* <Image src={"/SpongeToon.png"} width={300} height={300} alt={"Alt"} /> */}
      <h1 className={`${SpaceGrotesk.className} font-thin md:text-2xl`}>
        Sorry The requested page could not be found.
      </h1>
    </div>
  );
}
