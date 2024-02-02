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

export default function CallyspongiaPage() {
  return (
    <div className="w-screen grid place-items-center mt-9">
      <div className="md:w-[550px] w-[80%] flex flex-col items-center">
        <h1
          className={`${PlayFair.className} italic font-black text-5xl text-[#FFB800] mb-4`}
        >
          Callyspongia Information
        </h1>
        <div className="w-full h-72 mb-4 bg-gray-300 rounded-md overflow-hidden">
          <img
            src=""
            alt="Callyspongia"
            className="w-full h-full object-cover"
          />
        </div>
        <div className={`${JetBrainsMono.className} w-full mt-2 `}>
          <h4 className="font-medium">Description</h4>
          <p className="font-thin text-sm opacity-60">
            Body erect, tubular, flabellate or even repent in form; branches are
            5-10mm in diameter. Colour is violet when alive; Compressible
            consistency with good resiliency. This species may also show a
            tendency to incorporate pebbles etc. into their body. Oscules are
            scattered irregularly or marginal and serial; diameter up to 5mm and
            compound. Pores minute, one per mesh. Surface is reticulated and
            hispid, and this hispidity is due to the presence of vertically
            arranged oxeas from the surface. Main fibres and connectives are
            quite distinct. The main fibres are coarse and multispicular with
            diameter up to 0.1mm. Connectives are also multispicular, diameter
            up to 0.05mm. Spicules: (1) Oxeas. Size, 0.063-0.118×0.002-0.009mm.
          </p>

          <h4 className="font-medium mt-2">Taxonomy:</h4>
          <ul className="font-thin text-sm opacity-60">
            <li>Kingdom: Animalia</li>
            <li>Phylum: Porifera</li>
            <li>Class: Demospongiae</li>
            <li>Order: Haplosclerida</li>
            <li>Family: Callyspongiidae</li>
            
          </ul>
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
