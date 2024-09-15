"use client";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import { MaterialSymbolsSearchRounded } from "../components/icons";
import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const spaceGrotesk = Space_Grotesk({
  preload: false,
  style: ["normal"],
});

export function SearchBar({className,onChange}:{className?:string;onChange?:React.ChangeEventHandler}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{similarity:number}>>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  useEffect(() => {
			if (query.replaceAll(" ", "") === "") {
				setResults([]);
			} else {
				setShowResults(false);
				fetch(`http://127.0.0.1:5000/Search?q=${query}`, {
					method: "get",
					redirect: "follow",
				})
					.then((response) => response.text())
					.then((result) => {
						setResults(JSON.parse(result));
					})
					.catch((error) => console.log("error", error));
			}
			results.length === 0 ? setShowResults(false) : setShowResults(true);
			// searchFocused? setShowResults(true) : setShowResults(false);
		}, [query, results.length, searchFocused]);
  return (
			<div
				className={`${className} w-full`}
				onFocus={() => setSearchFocused(true)}
				onBlur={() => setSearchFocused(false)}
			>
				<div
					className={`w-full h-full min-h-12 ${
						results.length === 0
							? "rounded-full"
							: " rounded-t-[1.5rem] border-b-white/0"
					} overflow-hidden border transition-all duration-200  border-neutral-800 bg-neutral-950 flex`}
				>
					<input
						onChange={(e) =>
							onChange ? onChange(e) : setQuery(e.target.value)
						}
						type="text"
						className={
							"font-   indent-2  text-sm h-full flex-grow bg-inherit p-2 flex items-center focus:outline-0 opacity-50"
						}
					/>
					<button
						type="button"
						onClick={() => {
							router.push(`/Search/Result?q=${query}`);
						}}
						className="h-full w-auto aspect-square bg-[#0F0F0F] hover:bg-[#1f1f1f] grid place-items-center "
					>
						<MaterialSymbolsSearchRounded />
					</button>
				</div>
				{/* Results */}
				<div className="h-0 z-50 relative">
					<div
						className={`${
							showResults ? "h-32 " : "h-0"
						}  text-sm  w-full overflow-y-scroll rounded-b-xl smallScrollBar`}
					>
						{results
							.sort((a: any, b: any) => -a.similarity + b.similarity)
							.map((item: any) => {
								return (
									<Link
										href={`/Search/Result/${item["value"]["Name"]}`}
										key={item["value"]["Name"]}
										className="bg-[#060606] h-10 p-2 flex items-center gap-2 hover:bg-[#0F0F0F] w-full"
									>
										{item["value"]["Name"]}
										<p className="text-xs text-white/20 h-full flex items-center overflow-hidden text-ellipsis">
											{item["ClosestAttribute"]}
										</p>
									</Link>
								);
							})}
					</div>
				</div>
			</div>
		);
}
