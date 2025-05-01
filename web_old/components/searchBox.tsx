"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONFIG } from "@/lib/config";
import axios from "axios";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function SearchBox() {
  const [results, setResults] = useState<null | Array<{
    color: string | null;
    created_at: string;
    habitat: string | null;
    id: number;
    location: string | null;
    name: string | null;
    pores: string | null;
    scientific_name: string | null;
    size: string | null;
    texture: string | null;
  }>>(null);
  const [query, setQuery] = useState("");
  const searchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const _query = e.target.value;
    setQuery(_query);
    console.log(_query);

    axios
      .get(`${CONFIG.SERVER_URL}/v1/sponge/`, {
        params: { q: _query },
      })
      .then((response) => {
        setResults(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <div className="md:w-1/2 w-[90%] ">
      <div className=" flex items-center gap-2">
        <Input onChange={searchChange} />
        <Button variant={"secondary"} className="aspect-square p-0">
          <Search className="size-4" />
        </Button>
      </div>
      <div className="mt-1">
        {results?.map((sponge) => (
          <Link
            href={`/sponge/${sponge.id}`}
            className="w-full p-2  hover:bg-neutral-800 text-start items-start justify-start flex gap-2   "
            key={sponge.id}
          >
            <p>
              {sponge.name
                ?.split(new RegExp(`(${query})`, "gi"))
                .map((part, index) =>
                  part.toLowerCase() === query.toLowerCase() ? (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={index}
                      className="bg-yellow-300 py-1 rounded  text-yellow-950"
                    >
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
            </p>

            {"  "}
            <i className="text-sm opacity-60">
              {" "}
              {sponge.scientific_name
                ?.split(new RegExp(`(${query})`, "gi"))
                .map((part, index) =>
                  part.toLowerCase() === query.toLowerCase() ? (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={index}
                      className="bg-yellow-300 py-1 rounded  text-yellow-950"
                    >
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
            </i>
          </Link>
        ))}
      </div>
    </div>
  );
}