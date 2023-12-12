import Image from "next/image";
// import "./globals.css";
import { Playfair_Display, Space_Grotesk } from "next/font/google";

const SpaceGrotesk = Space_Grotesk({
  preload: false,
});

export default function Custom404() {
  return (
    <div className="flex flex-col  h-[35rem] items-center justify-center">
      <Image src={"/SpongeToon.png"} width={300} height={300} alt={"Alt"} />
      <h1 className={`${SpaceGrotesk.className} font-thin text-2xl`}>
        Sorry The requested page could not be found.
      </h1>
    </div>
  );
}
