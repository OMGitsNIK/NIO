export interface Dataset {
	dataset_id: number;
	dataset__name: string;
	dataset__description: string;
	dataset__visibility: number;
	dataset__created_at: Date;
	dataset__created_by_id: string;
	snapshots: Snapshot[];
	num_items: number;
}

export interface Snapshot {
	id: string;
	media__file: string;
	location: number;
	created_on: Date;
	version: number;
	media__id: string;

	src: string;
}
