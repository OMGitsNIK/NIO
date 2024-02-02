import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import "material-icons/iconfont/material-icons.css";

const JetBrainsMono = JetBrains_Mono({
  preload: false,
  style: ["italic", "normal"],
});
const PlayFair = Playfair_Display({
  weight: "800",
  preload: false,
  style: "italic",
});

export default function ClathriaTuberosaPage() {
  return (
    <div className="w-screen grid place-items-center mt-9">
      <div className="md:w-[550px] w-[80%] flex flex-col items-center">
        <h1
          className={`${PlayFair.className} italic font-black text-5xl text-[#FFB800] mb-4`}
        >
          Clathria tuberosa
        </h1>
        <div className={`${JetBrainsMono.className} w-full mt-2 `}>
          <h4 className="font-medium">Scientific Name:</h4>
          <p className="font-thin text-sm opacity-60">Clathria tuberosa</p>
          <h4 className="font-medium mt-2">Founded by:</h4>
          <p className="font-thin text-sm opacity-60">(Bowerbank, 1875)</p>
          <h4 className="font-medium mt-2">Known As:</h4>
          <p className="font-thin text-sm opacity-60">Club Sponge</p>
          <h4 className="font-medium mt-2">Range:</h4>
          <p className="font-thin text-sm opacity-60">Indo-Pacific Ocean</p>
          <h4 className="font-medium mt-2">Natural Environment:</h4>
          <p className="font-thin text-sm opacity-60">
            Inhabits caves, crevices, and slope areas where current is swift.
          </p>
          <h4 className="font-medium mt-2">Aquarium Suitability:</h4>
          <p className="font-thin text-sm opacity-60">
            Not collected for the home aquarium trade. Best left in the wild.
          </p>
          <h4 className="font-medium mt-2">Taxonomy:</h4>
          <ul className="font-thin text-sm opacity-60">
            <li>Kingdom: Animalia</li>
            <li>Phylum: Porifera</li>
            <li>Class: Demospongiae</li>
            <li>Subclass: Heteroscleromorpha</li>
            <li>Order: Poecilosclerida</li>
            <li>Family: Microcionidae</li>
            <li>Genus: Clathria</li>
          </ul>
          <p className="font-thin text-sm opacity-60">
            FYI: Shown here for identification only.
          </p>
          <p className="font-thin text-sm opacity-60">
            Sponges posses no nervous, digestive or excretory systems, and feed
            by filtering suspended bacteria and fine detritus. Strong water
            movement is vital to almost all, not only for carrying food to these
            sessile creatures but also to carry waste/unused matter away. In
            fact, a sponge the size of a baseball can filter about fifty gallons
            of water per hour!
          </p>
        </div>
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
