import {DM_Serif_Display,Noto_Sans} from 'next/font/google'

const DM_Serif=DM_Serif_Display({
  weight: '400',
  preload: false,
})

const NotoSans= Noto_Sans({
  weight:'100',
  preload:false
})


export default function Home() {
  return (
    <div >
      <div className='ml-8 mt-8 mb-[20%]'>
        <h1 className={`${DM_Serif.className} text-5xl text-[#FFB800] mb-4`}>Sponge Explorer</h1>
    <p className={`${NotoSans.className} text-sm w-[30rem]`}>Sponges, often referred to as the simplest multicellular animals, are fascinating creatures in the world of marine biology. These aquatic organisms, while lacking complex organs and tissues, play a vital role in marine ecosystems. Sponges are filter feeders, constantly pumping water through their porous bodies, which allows them to efficiently capture tiny particles and nutrients. Their remarkable ability to filter large volumes of water makes them an essential component in maintaining water quality and nutrient cycling in oceans. Moreover, scientists are increasingly studying sponges for their potential in biotechnology, as they produce unique chemical compounds that have shown promise in pharmaceutical and medical applications. So, sponges not only contribute to the health of our oceans but also hold exciting potential for future scientific discoveries.</p> 
      </div>
   
    <div className='bg-[#FFB800] min-h-screen w-full'></div>
    </div>
  )
}
