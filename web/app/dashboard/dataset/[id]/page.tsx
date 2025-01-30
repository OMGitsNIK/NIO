"use client";

import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/config";
import type { Snapshot } from "@/types/db";
import { Image, Modal } from "antd";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page({ params }: { params: { id: string } }) {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

	const handleImageClick = (src: string) => {
		setSelectedImage(src);
		setIsModalVisible(true);
	};

	const handleModalClose = () => {
		setIsModalVisible(false);
		setSelectedImage(null);
	};

	if (loading) return <p>Loading...</p>;

	return (
		<div className="p-8 md:mt-0 mt-16">
			<div className="grid grid-col-1 md:grid-cols-3 mt-4 gap-4">
				{(data.snapshots as Snapshot[]).map((x) => (
					<img
						key={x.id}
						className="aspect-video object-cover rounded-lg shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer"
						alt=""
						height={200}
						src={CONFIG.SERVER_URL + x.src}
						onClick={() => handleImageClick(CONFIG.SERVER_URL + x.src)}
					/>
				))}
			</div>

			{/* Image Preview Modal */}
			<Modal
				visible={isModalVisible}
				onCancel={handleModalClose}
				footer={null}
				width={1000}
			>
				<div className="flex w-full">
				<div className="w-1/2">
					<Image
						src={selectedImage!}
						alt="Selected Image"
						style={{ width: "auto", height: "auto" }}
					/>
					</div>
					<div className="w-1/2 ml-4 flex flex-col gap-2">
						<h2 className="text-xl">Name of Sponge</h2>
						<p><strong>Description:</strong> {data.description}</p>
						<p><strong>Location:</strong> {data.location}</p>
						<Link href={""}>
							<Button>Analyze</Button>
						</Link>
					</div>
				</div>
			</Modal>
		</div>
	);
}
