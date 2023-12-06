"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialSymbolsLogoutRounded } from "./icons";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <div className="flex bg-[#0D0D0D] h-20 justify-between items-center p-8 ">
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
        <Link
          href="/Search"
          className={pathname == "/Search" ? "text-[#9672FF]" : ""}
        >
          Search
        </Link>
      </div>
      <div>
        <Link
          href={"/api/auth/signout"}
          className="flex items-center gap-2 text-lg hover:bg-zinc-900 p-2 rounded-full"
        >
          <span className="text-sm text-white/50">Logout</span>
          <MaterialSymbolsLogoutRounded />
        </Link>
      </div>
    </div>
  );
}
