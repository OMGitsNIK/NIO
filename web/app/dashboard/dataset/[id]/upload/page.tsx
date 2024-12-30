"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

const UploadPage = () => {
	const [files, setFiles] = useState<File[]>([]);
	const { data: session } = useSession();
	const path = usePathname();
	const router = useRouter();

	// Extract dataset_id from the URL parameters
	const dataset_id = path
		.replace("/dashboard/dataset/", "")
		.replace("/upload", "");
	console.log(dataset_id);

	const onDrop = (acceptedFiles: File[]) => {
		setFiles([...files, ...acceptedFiles]);
	};

	const handleUpload = async () => {
		console.log(path);

		if (!session?.user?.id || !dataset_id) {
			console.error("User ID or dataset ID is missing");
			return;
		}
		console.log(path);

		for (const file of files) {
			const formData = new FormData();
			formData.append("dataset_id", dataset_id);
			formData.append("user_id", session.user.id);
			formData.append("file", file);
			formData.append("name", "Snapshot");

			try {
				const response = await axios.post(
					"http://localhost:8000/v1/snapshot",
					formData,
					{
						headers: { "Content-Type": "multipart/form-data" },
					},
				);
				console.log(response.data);
			} catch (error) {
				console.error(error);
			}
		}
		toast.success("Event has been created.");
		setTimeout(() => {
			router.push(`/dashboard/dataset/${dataset_id}`);
		}, 2000);
	};

	const { getRootProps, getInputProps } = useDropzone({ onDrop });

	return (
		<div className="w-full  h-96 p-12">
			<div
				className="h-full w-full"
				{...getRootProps()}
				style={{
					border: "2px dashed #ccc",
					padding: "20px",
					cursor: "pointer",
				}}
			>
				<input {...getInputProps()} />
				<p>Drag & drop files here, or click to select files</p>
			</div>

			{/* Render the list of files */}
			<div className="mt-4">
				<h3>Selected Files:</h3>
				<ul>
					{files.map((file, index) => (
						<li key={index} className="mt-2">
							{file.name} ({(file.size / 1024).toFixed(2)} KB)
						</li>
					))}
				</ul>
			</div>

			<button
				onClick={handleUpload}
				disabled={files.length === 0}
				className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
			>
				Upload
			</button>
		</div>
	);
};

export default UploadPage;
