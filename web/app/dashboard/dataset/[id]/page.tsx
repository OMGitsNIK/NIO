"use client";

import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/config";
<<<<<<< HEAD
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, MoreVertical, Copy, Trash, Edit } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Page({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
=======
import type { Snapshot } from "@/types/db";
import { Image, Modal } from "antd";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { id: string } }) {
	
	const router = useRouter();
	
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
>>>>>>> 0feff33f1c369507296b17159ca301fcb23a8b0d

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

<<<<<<< HEAD
  if (loading)
    return (
      <div className="p-6 w-full flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="p-6 mx-auto">
      <h1 className="text-3xl font-semibold text-gray-900">{data.name}</h1>
      <p className="text-gray-600 mt-2">{data.description}</p>
      <p className="text-xs text-gray-500 mt-1">
        {data.created_at
          ? format(new Date(data.created_at), "dd-MM-yyyy hh:mm:ss")
          : "Unknown date"}
      </p>
      <Link
        href={`/dashboard/dataset/${params.id}/upload`}
        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
      >
        Upload
      </Link>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
        {data.snapshots.length > 0 ? (
          data.snapshots.map((x) => (
            <div key={x.id} className="relative group">
              <Dialog>
                <DialogTrigger asChild>
                  <Image
                    width={800}
                    height={800}
                    className="aspect-video object-cover rounded-lg shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-md cursor-pointer"
                    alt="Snapshot"
                    src={CONFIG.SERVER_URL + x.src}
                  />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <h2 className="text-lg font-medium">Image Details</h2>
                  </DialogHeader>
                  <Image
                    width={800}
                    height={800}
                    className="w-full rounded-lg"
                    alt="Snapshot"
                    src={CONFIG.SERVER_URL + x.src}
                  />
                  <p className="text-gray-500 mt-2">Filename: {x.filename}</p>
                  <p className="text-gray-500">Size: {x.size} KB</p>
                </DialogContent>
              </Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                  >
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Copy size={16} className="mr-2" /> Copy URL
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit size={16} className="mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">
                    <Trash size={16} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-6 border border-dashed rounded-lg text-gray-400">
            <p>No snapshots available.</p>
          </div>
        )}
      </div>
    </div>
  );
=======
	const handleImageClick = (src: string) => {
		setSelectedImage(src);
		setIsModalVisible(true);
	};

	const handleModalClose = () => {
		setIsModalVisible(false);
		setSelectedImage(null);
	};

	const handleAnalyzeClick = () => {
		if (selectedImage) {
		  localStorage.setItem("analyzeImage", selectedImage);
		  window.location.href = "/analyze";
		}
	  };

	if (loading) return <p>Loading...</p>;

	return (
		<div className="p-8 md:mt-0 mt-16">
			<Link href={'/dashboard/dataset/'+params.id+'/upload'}>Upload</Link>
			<div className="grid grid-col-1 md:grid-cols-3 mt-4 gap-4">
				{(data.snapshots as Snapshot[]).map((x) => (
					<img
						key={x.id}
						className="aspect-video object-cover rounded-lg shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer"
						alt=""
						height={200}
						src={CONFIG.SERVER_URL + x.src}
						onClick={() => handleImageClick(x.src)}
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
						src={CONFIG.SERVER_URL + selectedImage!}
						alt="Selected Image"
						style={{ width: "auto", height: "auto" }}
					/>
					</div>
					<div className="w-1/2 ml-4 flex flex-col gap-2">
						<h2 className="text-xl">Name of Sponge</h2>
						<p><strong>Description:</strong> {data.description}</p>
						<p><strong>Location:</strong> {data.location}</p>
						<Link href={"/analyze/"+selectedImage?.replace('/v1/bucket','')}>
                           Analyze
						</Link>
					</div>
				</div>
			</Modal>
		</div>
	);
>>>>>>> 0feff33f1c369507296b17159ca301fcb23a8b0d
}
