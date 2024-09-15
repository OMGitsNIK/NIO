"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Database } from "@/types/supabase";

type Sponge = Database["public"]["Tables"]["sponges"]["Row"];

export default function Component() {
	const [sponges, setSponges] = useState<Sponge[] | null>(null);
	const [search, setSearch] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			const { data: sponges, error } = await supabase
				.from("sponges")
				.select("*")
				.or(
					`name.ilike.%${search}%,scientific_name.ilike.%${search}%,habitat.ilike.%${search}%,location.ilike.%${search}%`,
				);

			setSponges(sponges);
			setIsLoading(false);
		};

		const debounce = setTimeout(() => {
			fetchData();
		}, 300);

		return () => clearTimeout(debounce);
	}, [search]);

	return (
		<div className="w-full h-full relative">
			<h1 className="text-3xl font-bold text-center">Sponge Search</h1>
			<Input
				className="max-w-md mx-auto"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search by name or scientific name"
			/>
			{isLoading ? (
				<div className="text-center">Loading...</div>
			) : sponges && sponges.length > 0 ? (
				<div className="relative flex flex-wrap gap-4 p-4">
					{sponges.map((sponge) => (
						<div key={sponge.id} className="w-64 h-80 relative bg-neutral-950">
							<img
								className="w-full h-72"
								src="https://via.placeholder.com/263x279"
								alt={sponge.name}
							/>
							<div className="absolute bottom-0 left-0 w-full h-20 bg-stone-950">
								<div className="text-center text-white text-xl font-thin font-['JetBrains Mono']">
									{sponge.name}
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="text-center">No sponges found</div>
			)}
		</div>
	);
}