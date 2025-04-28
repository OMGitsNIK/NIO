"use client";
import { ArrowRightIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function Nav() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
      router.push(`?${params.toString()}`);
    }
  };
  return (
    <div className="w-full h-full border-b">
      <div className="relative w-96 h-full">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="peer ps-9 pe-9 h-full rounded-none border-0 border-r"
          placeholder="Search..."
          type="search"
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
        <button
          onClick={handleSearch}
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Submit search"
          type="submit"
        >
          <ArrowRightIcon size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
export function NavBar() {
  return (
    <Suspense>
      <Nav />
    </Suspense>
  );
}
