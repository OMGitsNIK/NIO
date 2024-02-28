import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import "material-icons/iconfont/material-icons.css";
import { SearchBar } from "@/components/Search";

// const DM_Serif=DM_Serif_Display({
//   weight: '400',
//   preload: false,
// })

// const NotoSans= Noto_Sans({
//   weight:'100',
//   preload:false
// })

const JetBrainsMono = JetBrains_Mono({
  preload: false,
  style: ["italic", "normal"],
});
const PlayFair = Playfair_Display({
  weight: "800",
  preload: false,
  style: "italic",
});

export default function Home() {
  return (
			<div className="w-screen grid place-items-center mt-9">
				<div className="md:w-[550px] w-[80%] flex flex-col items-center">
					<h1
						className={`${PlayFair.className} italic font-black text-5xl text-[#FFB800]`}
					>
						Search
					</h1>
					{/* <form className="w-full h-10  bg-[#090909] mt-3 flex">
          <input
            type="text"
            className={`${JetBrainsMono.className} font-thin h-full flex-grow bg-inherit p-2 flex items-center focus:outline-0 opacity-25`}
          />
          <button className="w-10 h-10 bg-[#0F0F0F] grid place-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5em"
              height="1.5em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M9.5 16q-2.725 0-4.612-1.888T3 9.5q0-2.725 1.888-4.612T9.5 3q2.725 0 4.612 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16Zm0-2q1.875 0 3.188-1.313T14 9.5q0-1.875-1.313-3.188T9.5 5Q7.625 5 6.312 6.313T5 9.5q0 1.875 1.313 3.188T9.5 14Z"
              ></path>
            </svg>
          </button>
        </form> */}
					<SearchBar className={"mt-3 h-10"} />
					{/* <div className={`${JetBrainsMono.className} w-full mt-2 `}>
						<h4 className="font-medium">Suggested</h4>
						<ul className="font-thin italic text-sm opacity-60">
							<li>Blue Sponge</li>
							<li>Yellow Sponge</li>
							<li>Green Sponge</li>
						</ul>
					</div> */}
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
								<stop stop-color="#FFB800" />
								<stop offset="1" stop-color="#FCFF80" />
							</linearGradient>
						</defs>
					</svg>
				</div>
			</div>
		);
}
