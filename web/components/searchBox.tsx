"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONFIG } from "@/lib/config";
import axios from "axios";
import { Search } from "lucide-react";
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
	const searchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const query = e.target.value;
		console.log(query);

		axios
			.get(`${CONFIG.SERVER_URL}/v1/sponge/`, {
				params: { q: query },
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
			<div>
				{results?.map((sponge) => (
					<div key={sponge.id}>{sponge.name}</div>
				))}
			</div>
		</div>
	);
}