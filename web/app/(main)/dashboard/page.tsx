"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Space_Mono } from "next/font/google";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { BrainCog, FilesIcon, Trash2 } from "lucide-react";

import { useRouter } from "next/navigation";
import { CONFIG } from "@/lib/config";

const space_mono = Space_Mono({ subsets: ["latin"], weight: ["400"] });

type Snapshot = {
  id: string;
  media__file: string;
  location: number;
  created_on: string;
  version: number;
  media__id: string;
  src: string;
};

type Dataset = {
  dataset_id: string;
  dataset__name: string;
  dataset__description: string;
  dataset__visibility: "private" | "public";
  dataset__created_by_id: string;
  dataset__created_by_id__name: string;
  dataset__created_at: string;
  snapshots: Snapshot[] | [];
  num_items: number;
};

interface DatasetDetails {
  name: string;
  description: string;
  created_at: string;
  snapshots: Snapshot[];
}

interface MoreInfoProps {
  dataset_id: string;
}

const MoreInfo: React.FC<MoreInfoProps> = ({ dataset_id }) => {
  const { data: session } = useSession();
  const [datasetDetails, setDatasetDetails] = useState<DatasetDetails | null>(
    null,
  );

  useEffect(() => {
    if (!session?.user) return;
    axiosInstance
      .get(`/v1/dataset/${dataset_id}?user_id=${session.user.id}`)
      .then((response) => {
        setDatasetDetails(response.data);
      })
      .catch((error) => {
        console.error("Error fetching dataset details:", error);
      });
  }, [session, dataset_id]);

  if (!datasetDetails) {
    return <div>Loading...</div>;
  }

  const { name, description, created_at, snapshots } = datasetDetails;

  return (
    <div className="w-1/4 border-l flex flex-col">
      <div className="mb-4 grid grid-cols-3 gap-2">
        {snapshots.slice(0, 6).map((snapshot) => (
          <img
            key={snapshot.id}
            src={CONFIG.SERVER_URL + snapshot.src}
            alt="preview"
            className="h-48 w-full object-contain rounded"
          />
        ))}
      </div>
      <div
        className={cn(
          space_mono.className,
          "p-2 flex flex-col font-normal text-xs",
        )}
      >
        <p>Name: {name}</p>
        <p>Description: {description}</p>
        <p>Created At: {new Date(created_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter(); // inside Page()

  const [dataset, setDataset] = useState<Dataset[] | null>(null);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    axiosInstance
      .get("/v1/" + session.user.id + "/dataset/")
      .then((d) => setDataset(d.data));
  }, [session]);

  const handleDeleteDataset = async (dataset_id: string) => {
    if (!confirm("Are you sure you want to delete this dataset?")) return;
    try {
      await axiosInstance.delete(`/v1/dataset/${dataset_id}/delete/`);
      setDataset(
        (prev) => prev?.filter((d) => d.dataset_id !== dataset_id) || null,
      );
      if (activeDataset?.dataset_id === dataset_id) setActiveDataset(null);
    } catch (error) {
      console.error("Failed to delete dataset", error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-3/4 p-4 h-full overflow-y-auto grid grid-cols-4 gap-4">
        {dataset && dataset.length > 0 ? (
          dataset?.map((data) => (
            <div
              onClick={() => setActiveDataset(data)}
              onDoubleClick={() =>
                router.push(`/dashboard/dataset/${data.dataset_id}`)
              }
              key={data.dataset_id}
              className="overflow-hidden group w-72 transition-all relative hover:ring-2 ring-blue-300 h-64 text-xs rounded-sm border border-stone-700/10 bg-neutral-50 "
            >
              <img
                src={
                  CONFIG.SERVER_URL +
                  "/v1/bucket/" +
                  (data.snapshots.length > 0 ? data.snapshots[0].media__id : "")
                }
                alt={data.dataset__name}
                className="h-auto w-full aspect-video object-cover"
              />
              <div className="p-4 ">
                <Button
                  size="icon"
                  className="absolute size-8 top-1 right-1 delay-75 duration-700 group-hover:opacity-100 opacity-0 transition-all"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation(); // important to not trigger card click
                    handleDeleteDataset(data.dataset_id);
                  }}
                >
                  <Trash2 />
                </Button>
                <Button
                  size="icon"
                  className="absolute size-8 top-1 right-10 delay-75 duration-700 group-hover:opacity-100 opacity-0 transition-all"
                  onClick={() => {
                    router.push(
                      `/dashboard/dataset/${data.dataset_id}/analyze`,
                    );
                  }}
                >
                  <BrainCog />
                </Button>

                <p className="text-sm">{data.dataset__name}</p>
                <p>
                  <strong>Created By:</strong>{" "}
                  {data.dataset__created_by_id__name}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(data.dataset__created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 flex flex-col justify-center items-center text-gray-500 py-10">
            <FilesIcon className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">No Collections found</p>
            <p className="text-sm text-muted-foreground">
              Start by creating a new collection to see it here.
            </p>
          </div>
        )}
      </div>

      {activeDataset && <MoreInfo dataset_id={activeDataset.dataset_id} />}
    </div>
  );
}
