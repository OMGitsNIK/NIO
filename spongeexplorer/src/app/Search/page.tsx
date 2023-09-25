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
    <div className=''>
      <h1>Search</h1>
      <div className='w-96 h-10 bg-slate-950'></div>
      <div>
        <h4>Suggested</h4>
        <ul>
          <li>Blue Sponge</li>
          <li>Yellow Sponge</li>
          <li>Green Sponge</li>
        </ul>
      </div>
    </div>
  )
}
