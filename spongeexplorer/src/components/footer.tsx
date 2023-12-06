'use client'
import Link from 'next/link'

import {Playfair_Display,Space_Grotesk} from 'next/font/google'


const PlayfairDisplay=Playfair_Display({
  preload: false,
})

const SpaceGrotesk= Space_Grotesk({
  preload:false
})


export default function Footer() {


    return (
      <div className='flex bg-[#0D0D0D] h-96 justify-center'>
        <div className='w-screen  p-8 pt-12'>

        <hr className='w-[100%] border-white/70' />
        <div className='flex w-full justify-between p-2'>
          <ul className={`${SpaceGrotesk.className} flex flex-col gap-0.5`}>
            <li><Link href={'/About'}>About Us</Link></li>
            <li><a href='https://www.nio.res.in/'>CSIR-NIO</a> </li>
            {/* <li>Link 3</li> */}
        </ul>
        <ul className='flex'>
            <li>🌊</li>
            <li>⛵</li>
            <li>🔬</li>
        </ul>  
        </div>
        </div>
      </div>
    )
  }
  