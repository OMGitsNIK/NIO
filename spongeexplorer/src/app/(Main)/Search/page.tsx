"use client";
import { Playfair_Display, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "material-icons/iconfont/material-icons.css";
import { MaterialSymbolsSearchRounded } from "@/components/icons";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/Search";

// const DM_Serif=DM_Serif_Display({
//   weight: '400',
//   preload: false,
// })

// const NotoSans= Noto_Sans({
//   weight:'100',
//   preload:false
// })

const jetBrainsMono = JetBrains_Mono({
  preload: false,
  style: ["italic", "normal"],
});
const SpaceGrotesk = Space_Grotesk({
  preload: false,
  style: [ "normal"],
});
const playFair = Playfair_Display({
  weight: "800",
  preload: false,
  style: "italic",
});

// fetch("http://127.0.0.1:5000/Search?q=Aplysina", requestOptions)
// 		.then(response => response.text())
// 		.then(result => console.log(result))
// 		.catch(error => console.log('error', error));

export default function Home() {
  const [getSearch, setGetSearch] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  useEffect(() => {
    if (query.replaceAll(" ", "") == "") {
      setResults([]);

    } else {
      setShowResults(false);
      fetch(`http://127.0.0.1:5000/Search?q=${query}`, {
        method: "get",
        redirect: "follow",
      })
        .then((response) => response.text())
        .then((result) => setResults(JSON.parse(result)))
        .catch((error) => console.log("error", error));
    }
    results.length==0?setShowResults(true):setShowResults(false);

    
  }, [getSearch, query, results.length]);
  return (
    <div className="w-screen grid place-items-center mt-9">
      <div className="md:w-[550px] w-[80%] flex flex-col items-center ">
        <h1
          className={`${playFair.className} italic font-black text-5xl text-[#FFB800]`}
        >
          Search
        </h1>
        <SearchBar className='w-[34rem]'/>
        
        <svg
          width="600"
          height="600"
          style={{
            position: "absolute",
            zIndex: -1,
            top: 0,
            filter: "blur(70px)",
            opacity: 0.1,
            scale: 1.1,
          }}
          viewBox="0 0 1600 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_f_3_83)">
            <path
              d="M650.17 -146.696C794.841 -144.33 1118.61 -96.8799 1210.07 23.6973C1301.53 144.274 1403.92 411.367 1331.65 520.77C1259.39 630.174 941.176 689.65 776.466 680.118C611.756 670.587 415.797 575.352 343.393 463.583C270.988 351.814 268.79 120.548 342.038 9.50233"
              fill="url(#paint0_linear_3_83)"
            />
          </g>
          <defs>
            {/* <filter id="filter0_f_3_83" x="-306.913" y="-741.696" width="2257.99" height="2017.81" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="297.5" result="effect1_foregroundBlur_3_83"/>
</filter> */}
            <linearGradient
              id="paint0_linear_3_83"
              x1="589.718"
              y1="655.294"
              x2="1069.66"
              y2="-102.454"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB800" />
              <stop offset="1" stopColor="#FCFF80" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
