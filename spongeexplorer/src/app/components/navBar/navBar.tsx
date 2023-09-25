import Image from 'next/image'
import Link from 'next/link'





export default function NavBar() {
    return (
      <div className='flex bg-[#0D0D0D] h-20 justify-between items-center p-8 '>
      <div className={"grid grid-flow-col items-center justify-start gap-6"}>
       <Image
      src="/NIO_Logo.png"
      width={50}
      height={50}
      alt="Picture of the author"
    />
    <Link href="/">Home</Link>
    <Link href="/Search">Search</Link>
      </div>
      <div>

      </div>
      </div>
    )
  }
  