"use client"

import { useState } from "react"
// import Image from "next/image"
// import { useDropzone } from "react-dropzone"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from 'lucide-react'
import axios from "axios";
import { CONFIG } from "@/lib/config";
// import { Dataset } from "@/types/db";
import { useSession } from "next-auth/react";

// interface NewDatasetModalProps {
// 	handleAddDataset: (dataset: {
// 		userId: string;
// 		title: string;
// 		description: string;
// 		// image: string
// 		// items: number
// 		// createdDate: string
// 	}) => void;
// }

export function NewDatasetModal() {
	const session = useSession();
	const [open, setOpen] = useState(false);
	const [datasetName, setDatasetName] = useState("");
	const [files, setFiles] = useState<File[]>([]);

	const [datasetVisibility, setDatasetVisibility] = useState<
		"private" | "public"
	>("private");
	const [datasetDescription, setDatasetDescription] = useState("");

	const handleAddDataset = () => {
		if (!session.data?.user) return;

		const formData = new FormData();
		formData.append("name", datasetName);
		formData.append("visibility", datasetVisibility);
		formData.append("description", datasetDescription);
		formData.append("user_id", session.data?.user.id);

		for (const file of files) {
			formData.append("files", file);
		}

		try {
			axios.post(`${CONFIG.SERVER_URL}/v1/dataset`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
		} catch (error) {
			console.error("Error uploading dataset:", error);
		}
	};

	const refresh = () => {};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (datasetName && datasetDescription) {
			//&&preview
			handleAddDataset();
			setOpen(false);
			refresh();
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-32 py-6 mx-8 bg-[#02B1CC] hover:bg-teal-700 text-white text-xl font-mono rounded-xl">
					<Plus className=" h-4 w-4" />
					New
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] bg-white text-black">
				<DialogHeader>
					<DialogTitle>Add New Dataset</DialogTitle>
					<DialogDescription>
						Create a new dataset for sponge analysis. Fill out the details
						below.
					</DialogDescription>
				</DialogHeader>
				{/* private and public button */}
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Input
								id="name"
								value={datasetName}
								onChange={(e) => setDatasetName(e.target.value)}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="description" className="text-right">
								Description
							</Label>
							<Input
								id="description"
								value={datasetDescription}
								onChange={(e) => setDatasetDescription(e.target.value)}
								className="col-span-3"
							/>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="visibility" className="text-right">
								Visibility
							</Label>
							<Select
								value={datasetVisibility}
								onValueChange={(value) =>
									setDatasetVisibility(value as "private" | "public")
								}
							>
								<SelectTrigger className="col-span-3 w-full">
									<SelectValue placeholder="Select visibility" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="private">Private</SelectItem>
									<SelectItem value="public">Public</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label className="text-right">Images</Label>
							<div className="col-span-3 border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-400 transition-colors">
								<Input
									type="file"
									multiple
									accept="image/*"
									id="file-upload"
									onChange={(e) => setFiles(Array.from(e.target.files || []))}
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Add Dataset</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}