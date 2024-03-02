"use client";
import Image from "next/image";
import { Noto_Sans, Space_Grotesk } from "next/font/google";
import { SearchBar } from "@/components/Search";
import { useEffect, useState } from "react";
import { config } from "@/config";

const NotoSans = Noto_Sans({ subsets: ["latin"], weight: ["900"] });
const SpaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
export default function Page({ params }: { params: { id: string } }) {
  interface SpongeDetails {
  
		[key:string]:string;
    //   Color: string;
    //   Depth: string;
    //   Distribution: string;
    //   Habitat: string;
    //   Name: string;
    //   Size: string;
    //   Type: string;
	//   Image:string;
	//   Description:string
    
  }
  const [spongeDetails, setSpongeDetails] = useState<SpongeDetails>({


      Color: "",
      Depth: "",
      Distribution: "",
      Habitat: "",
      Name: "",
      Size: "",
      Type: "",
	  Image:"",
	  Description:""
    
  });
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/GetDetails?q=${decodeURI(params.id)}`, {
      method: "get",
      redirect: "follow",
    })
      .then((response) => response.json())
      .then((result) => {
        setSpongeDetails(result);
		console.log(result)
      })
      .catch((error) => console.log("error", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (Object.keys(spongeDetails).length === 0)
			return <div>ADD SOME LOADING SKELETON</div>;
  return (
			<main className="p-8">
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
				{/* <svg
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
				</svg> */}
<div className="w-2/3">

				<SearchBar className=" h-12 mb-2" />
</div>

				<div className="flex gap-2 relative">
					<Image
						className="absolute blur-[200px]  transition-all -z-10 h-96 w-auto aspect-square rounded-lg object-cover"
						src={`${config.SERVER_URL}/public/${spongeDetails.Image}`}
						height={300}
						width={300}
						alt={""}
					/>
					<Image
						className="h-96 w-auto aspect-square rounded-xl object-cover"
						src={`${config.SERVER_URL}/public/${spongeDetails.Image}`}
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
						{spongeDetails.Description}
						</p>
						<div className="mt-4 w-96 flex flex-col">
		{Object.keys(spongeDetails).filter(i=>i!=="Image"&&i!=="Description").map(ke=><div key={ke} className="flex"><h1 className="font-bold">{ke}</h1> : {spongeDetails[ke]}
</div>)}
	


						</div>
					</div>
				</div>
			</main>
		);
}
