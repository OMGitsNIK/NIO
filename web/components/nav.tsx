import Link from "next/link";

export function NavBar() {
  return (
    <nav className="w-full p-6 border-b flex justify-between items-center">
      <Link className="font-serif text-2xl" href={"/"}>
        Sponge Explorer
      </Link>

      <div className="flex gap-4">
        <Link className="italic text-sm text-white/50" href={"/"}>
          Home
        </Link>
        <Link className="italic text-sm text-white/50" href={"/Explore"}>
          Search
        </Link>
      </div>
    </nav>
  );
}
