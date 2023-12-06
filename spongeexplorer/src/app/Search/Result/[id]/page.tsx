"use client";
import Image from "next/image";
import { Noto_Sans, Space_Grotesk } from "next/font/google";
import { SearchBar } from "@/app/components/Search";
import { useEffect, useState } from "react";

const NotoSans = Noto_Sans({ subsets: ["latin"], weight: ["900"] });
const SpaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
export default function Page({ params }: { params: { id: string } }) {
  interface SpongeDetails {
    Color?: string;
    Depth?: string;
    Distribution?: string;
    Habitat?: string;
    Name?: string;
    Size?: string;
    Type?: string;
  }
  const [spongeDetails, setSpongeDetails] = useState<SpongeDetails>({});
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/Search?q=${decodeURI(params.id)}`, {
      method: "get",
      redirect: "follow",
    })
      .then((response) => response.json())
      .then((result) => setSpongeDetails(result[0]))
      .catch((error) => console.log("error", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <main className="p-8">
      <svg
        className="absolute -z-10 blur-[200px]"
        width="500"
        height="500"
        viewBox="0 0 1694 1340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_3_178)">
          <path
            d="M478.17 2.30379C622.841 4.66961 946.606 52.1202 1038.07 172.697C1129.53 293.274 1231.92 560.367 1159.65 669.77C1087.39 779.174 769.176 838.65 604.466 829.118C439.756 819.587 243.797 724.352 171.393 612.583C98.9881 500.814 96.7902 269.548 170.038 158.502"
            fill="url(#paint0_linear_3_178)"
            fillOpacity="1"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_3_178"
            x1="417.718"
            y1="804.294"
            x2="944.5"
            y2="36.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00FF1A" />
            <stop offset="1" stopColor="#80FFC9" />
          </linearGradient>
        </defs>
      </svg>

      <SearchBar className="w-[36rem] mb-2 -mt-8" />

      <div className="flex gap-2">
        <Image
          className="h-96 w-auto aspect-square"
          src={"/Sponges/tube.png"}
          height={300}
          width={300}
          alt={""}
        />
        <div>

          <h1 className={`text-3xl font-black ${NotoSans.className}`}>
            {spongeDetails.Name}
          </h1>
          <h2 className={`text-lg font-black ${NotoSans.className}`}>
            {" "}
            {spongeDetails.Type}
          </h2>
          <p className={`${SpaceGrotesk.className} text-sm font-thin w-96`}>
            &quot;The Great Yellow Sea Sponge&quot; is a remarkable marine
            organism known for its distinctive bright yellow coloration and its
            significance in the underwater world. This sponge species, often
            found in the shallow waters of tropical and subtropical oceans,
            stands out for its striking appearance. Beyond its visual appeal,
            the Great Yellow Sea Sponge plays a critical ecological role as a
            filter feeder, helping maintain the balance of marine ecosystems by
            efficiently removing small particles and nutrients from the water.
            Additionally, its unique properties have attracted attention from
            researchers exploring its potential applications in various fields,
            such as biotechnology and pharmaceuticals. The Great Yellow Sea
            Sponge serves as a testament to the beauty and importance of the
            diverse life forms that thrive beneath the ocean&lsquo;s surface.
          </p>
        </div>
      </div>
    </main>
  );
}
