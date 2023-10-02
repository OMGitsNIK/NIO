import { Playfair_Display, Space_Grotesk } from 'next/font/google'
import Image from 'next/image'
import Footer from './components/navBar/footer'

const PlayfairDisplay = Playfair_Display({
  preload: false,
})

const SpaceGrotesk = Space_Grotesk({
  preload: false
})


export default function Home() {
  return (
    <div >
      <div className='ml-8 mt-8 mb-[20%]'>
        <h1 className={`${PlayfairDisplay.className} text-5xl text-[#FFB800] mb-4 font-black`}>Sponge Explorer</h1>
        <p className={`${SpaceGrotesk.className} w-[40rem] text-[.9em] font-light`}>Sponges, often referred to as the simplest multicellular animals, are fascinating creatures in the world of marine biology. These aquatic organisms, while lacking complex organs and tissues, play a vital role in marine ecosystems. Sponges are filter feeders, constantly pumping water through their porous bodies, which allows them to efficiently capture tiny particles and nutrients. Their remarkable ability to filter large volumes of water makes them an essential component in maintaining water quality and nutrient cycling in oceans. Moreover, scientists are increasingly studying sponges for their potential in biotechnology, as they produce unique chemical compounds that have shown promise in pharmaceutical and medical applications. So, sponges not only contribute to the health of our oceans but also hold exciting potential for future scientific discoveries.</p>

        <svg width="400" height="400" style={{ position: 'absolute', zIndex: -1, right: "35%", top: '50%', filter: 'blur(60px)', scale: 1.8 }} viewBox="700 300 500 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_3_47)">
            <path d="M919.443 1237.89C803.155 1239.84 616.086 1118.52 576.696 1031.29C537.307 944.053 621.519 818.96 683.108 714.481C744.697 610.001 849.142 427.186 946.232 404.412C1043.32 381.638 1210.95 475.303 1265.65 577.835C1320.35 680.367 1332.12 909.594 1274.42 1019.6" fill="url(#paint0_linear_3_47)" fill-opacity="0.2" />
          </g>
          <defs>
            {/* <filter id="filter0_f_3_47" x="0" y="0" width="1000" height="1968.95" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="283" result="effect1_foregroundBlur_3_47"/>
</filter> */}
            <linearGradient id="paint0_linear_3_47" x1="1306.55" y1="167.807" x2="779.108" y2="1228.06" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FCFF80" />
              <stop offset="1" stop-color="#FFB800" />
            </linearGradient>
          </defs>
        </svg>



      </div>

   
    <div className='bg-[#FFB800] w-full flex flex-col-reverse lg:flex-row'>
      <div className='text-black p-8'>
<h1 className={`${PlayfairDisplay.className} text-5xl mb-4 font-black`}>Did You Know ?</h1>
      <p className={`${SpaceGrotesk.className} flex-grow text-lg`}>Sponges, the aquatic animals, are some of the simplest multicellular organisms on Earth? They belong to the phylum Porifera and are known for their ability to filter tiny particles from the water through their porous bodies. Some sponges have been found to be over 500 million years old, making them one of the earliest forms of animal life on our planet. It`s fascinating how such simple creatures have been around for so long!</p>
      </div>
<Image src="/Sponges/tube.png"
     height={450}
     width={450}
     className='aspect-square object-cover w-full'
      alt="Picture of the author"/>  

      </div>


      <Footer />
    </div>
  )
}
