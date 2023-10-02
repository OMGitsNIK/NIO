import Image from "next/image"


import {Playfair_Display,Space_Grotesk} from 'next/font/google'


const PlayfairDisplay=Playfair_Display({
  preload: false,
})


export default function Custom404() {
    return (
    <div className="flex flex-col  h-[35rem] items-center justify-center">
      <Image src={'/SpongeToon.png'} width={300} height={300} alt={'Alt'}/>
      <h1 className={`${PlayfairDisplay.className}`}>Sorry The requested page could not be found.</h1>
    </div>
      )
  }