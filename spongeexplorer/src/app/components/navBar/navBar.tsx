'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from "next/navigation";




export default function NavBar() {
  const pathname = usePathname();

  return (
    <div className='flex bg-[#0D0D0D] h-20 justify-between items-center p-8 '>
      <div className={"grid grid-flow-col items-center justify-start gap-6"}>
        <Image
          src="/NIO_Logo.png"
          width={50}
          height={50}
          alt="Picture of the author"
        />
        <Link href="/" className={pathname == "/" ? "text-[#9672FF]" : ""}>
          Home
        </Link>
        <Link href="/Search" className={pathname == "/Search" ? "text-[#9672FF]" : ""}>Search</Link>
      </div>
      <div>

      </div>
    </div>
  )
}
