import React from "react";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditDatasetModal } from "./EditDatasetModal";
import { DeleteModal } from "./DeleteModal";
import Link from "next/link";
import type { Dataset } from "@/types/db";
import { CONFIG } from "@/lib/config";
import { format } from "date-fns";

// interface DatasetViewProps {
// 	datasets: Dataset[];
// 	onEditDataset: (id: number, updatedDataset: Partial<Dataset>) => void;
// 	onDeleteDataset: (id: number) => void;
// }

export function DatasetView({ datasets, onEditDataset, onDeleteDataset }: any) {
	return (
		<div className="grid grid-cols-2 gap-6">
			{datasets.map((dataset: Dataset) => (
				<Card key={dataset.dataset_id}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-md font-bold">{dataset.dataset__name}</CardTitle>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<MoreVertical className="h-4 w-4" />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem>
									<DeleteModal
										datasetId={dataset.dataset_id}
										onDeleteDataset={onDeleteDataset}
									>
										Delete
									</DeleteModal>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<EditDatasetModal
										dataset={dataset}
										onEditDataset={onEditDataset}
									>
										Edit
									</EditDatasetModal>
								</DropdownMenuItem>
								<DropdownMenuItem>Share</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

					</CardHeader>
					<CardContent>
						<Link href={`/dashboard/dataset/${dataset.dataset_id}`}>
							<div className="relative aspect-video rounded-lg overflow-hidden mb-4">
								<Image
									src={
										dataset.snapshots[0].src
											? CONFIG.SERVER_URL + dataset.snapshots[0].src
											: ""
									}
									alt={`${dataset.dataset__name} thumbnail`}
									fill
									sizes="(max-width: 768px) 100vw, 1280px"
									className="object-cover"
								/>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">
									{dataset.dataset__description}
								</p>
								<p className="text-sm text-muted-foreground">
									{dataset.num_items}{" "}
									{dataset.num_items > 1 ? "Items" : "Item"}
								</p>
								<p className="text-sm text-muted-foreground">
									Created on{" "}
									{format(new Date(dataset.dataset__created_at), "dd-MM-yyyy hh:mm:ss")}
								</p>
							</div>
						</Link>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
