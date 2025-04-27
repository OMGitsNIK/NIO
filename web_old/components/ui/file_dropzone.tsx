"use client";
import prettyBytes from "pretty-bytes";
import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface FileDropzoneProps {
	onFile: (file: File) => void; // Define the onFile prop
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFile }) => {
	const [file, setFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const droppedFile = event.dataTransfer.files[0];
		if (droppedFile) {
			setFile(droppedFile);
			onFile(droppedFile); // Call the onFile prop with the dropped file
		}
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files[0];
		if (selectedFile) {
			setFile(selectedFile);
			onFile(selectedFile); // Call the onFile prop with the selected file
		}
	};

	const handleClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div
			className="border-dashed border border-neutral-700 hover:border-neutral-500/50 hover:bg-neutral-800/30 transition-all rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer"
			onDrop={handleDrop}
			onDragOver={(event) => event.preventDefault()}
			onClick={handleClick}
		>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				onChange={handleChange}
			/>
			<p className="text-neutral-600">
				Drag and drop your file here or click to upload
			</p>
			{file && (
				<p className="mt-2 text-neutral-800">
					Selected file: {file.name} | {prettyBytes(file.size)}
				</p>
			)}
		</div>
	);
};

export { FileDropzone };
