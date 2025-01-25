"use client";

import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/config";
import type { Snapshot } from "@/types/db";
import { Image } from "antd";
import { format } from "date-fns";
import Link from "next/link";

export default function Page({ params }: { params: { id: string } }) {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch(`${CONFIG.SERVER_URL}/v1/dataset/${params.id}`);
				const jsonData = await res.json();
				setData(jsonData);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [params.id]);

	if (loading) return <p>Loading...</p>;

	return (
		<div className="p-8">
			<h1 className="text-3xl">{data.name}</h1>
			<p className="">{data.description}</p>
			<p className="text-xs">
				{format(data.created_at, "dd-MM-yyyy hh:mm:ss")}
			</p>
			<Link href={`/dashboard/dataset/${params.id}/upload`}>Upload</Link>
			<div className="grid grid-cols-4 mt-4  gap-2">
				{(data.snapshots as Snapshot[]).map((x) => (
					<Image
						key={x.id}
						className="aspect-video object-cover "
						alt=""
						height={200}
						src={CONFIG.SERVER_URL + x.src}
					/>
				))}
			</div>
		</div>
	);
}
