"use client";
import {
  Playfair_Display,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import { MaterialSymbolsSearchRounded } from "../components/icons";
import { useEffect, useState } from "react";
import Link from "next/link";

const JetBrainsMono = JetBrains_Mono({
  preload: false,
  style: ["italic", "normal"],
});
const SpaceGrotesk = Space_Grotesk({
  preload: false,
  style: ["normal"],
});
const PlayFair = Playfair_Display({
  weight: "800",
  preload: false,
  style: "italic",
});

export function SearchBar(params: any) {
  const [getSearch, setGetSearch] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  useEffect(() => {
    if (query.replaceAll(" ", "") == "") {
      setResults([]);
    } else {
      setShowResults(false);
      fetch(`http://127.0.0.1:5000/Search?q=${query}`, {
        method: "get",
        redirect: "follow",
      })
        .then((response) => response.text())
        .then((result) => setResults(JSON.parse(result)))
        .catch((error) => console.log("error", error));
    }
    results.length == 0 ? setShowResults(true) : setShowResults(false);
  }, [getSearch, query, results.length]);
  return (
    <div className={...params.className}>
      <form className="w-full h-10  bg-[#090909] mt-3 flex">
        <input
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          className={`${JetBrainsMono.className} font-thin h-full flex-grow bg-inherit p-2 flex items-center focus:outline-0 opacity-25`}
        />
        <button
          onChange={() => setGetSearch(!getSearch)}
          className="w-10 h-10 bg-[#0F0F0F] grid place-items-center"
        >
          <MaterialSymbolsSearchRounded />
        </button>
      </form>
      {/* Results */}
      <div className="h-0 z-50 relative">
        <div
          className={`${showResults ? "h-0 " : "h-32"} ${
            SpaceGrotesk.className
          } text-sm  w-full overflow-y-scroll smallScrollBar`}
        >
          {results.map((item) => {
            return (
              <Link
                href={`/Search/Result/${item["Name"]}`}
                key={item["Name"]}
                className="bg-[#060606] h-10 p-2 flex items-center hover:bg-[#0F0F0F] w-full"
              >
                {item["Name"]}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
