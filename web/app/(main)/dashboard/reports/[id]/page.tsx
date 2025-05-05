"use client";
import axiosInstance from "@/lib/axios";
import { CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClassificationPieChart,
  SegmentationDonutChart,
} from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, MapPin, User, Calendar, Tag } from "lucide-react";

// Helper function to format date and time
const formatDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) {
    return "N/A";
  }
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid Date";
  }
};

// Interface definitions
interface Snapshot {
  id: string;
  media_name: string;
  src: string;
  location_title: string;
  created_on: string;
  version: number;
  created_by_name: string;
  [key: string]: any;
}

interface ObjectCounts {
  osculum: number;
  tentacle: number;
  [key: string]: number;
}

interface ClassificationCounts {
  [key: string]: number;
}

interface Report {
  id: string;
  dataset_name: string;
  user_name: string;
  report_file_url: string | null;
  created_at: string;
  status: string;
  snapshots: Snapshot[];
  total_segmented_objects: number;
  object_counts: ObjectCounts;
  classification_counts: ClassificationCounts;
  [key: string]: any;
}

// Main ReportPage component
export default function ReportPage() {
  const { id: reportId } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(
    null,
  );

  useEffect(() => {
    if (!reportId) {
      setLoading(false);
      setError("Report ID not provided.");
      return;
    }

    setLoading(true);
    setError(null);

    axiosInstance
      .get<Report>("/v1/report/" + reportId)
      .then((response) => {
        setReport(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching report:", err);
        setError("Failed to load report data.");
        setLoading(false);
      });
  }, [reportId]);

  if (loading) {
    return (
      <div className="p-5 text-center">
        <h1 className="text-2xl font-bold mb-3">Loading Report...</h1>
        <p>Fetching report data. Please wait.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-center">
        <h1 className="text-2xl font-bold mb-3">Error</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-5 text-center">
        <h1 className="text-2xl font-bold mb-3">Report Not Found</h1>
        <p>No report data available.</p>
      </div>
    );
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    }
  };

  return (
    <div className="font-sans flex h-screen overflow-hidden">
      <div
        className={cn(
          "flex-grow overflow-y-auto p-6 transition-all duration-300",
          selectedSnapshot ? "w-2/3" : "w-full",
        )}
      >
        {/* Report Header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              {report.dataset_name}
            </h1>
            <Badge
              className={cn("text-sm px-3 py-1", getStatusColor(report.status))}
            >
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Report ID: {report.id} • Created {formatDateTime(report.created_at)}
          </p>
        </div>

        {/* Report Details and Charts */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="snapshots">
              Snapshots ({report.snapshots?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Report Summary</CardTitle>
                <CardDescription>
                  Key metrics and information about this dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Segmented Objects
                  </span>
                  <span className="text-2xl font-bold">
                    {report.total_segmented_objects}
                  </span>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm font-medium text-muted-foreground">
                    User
                  </span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{report.user_name}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm font-medium text-muted-foreground">
                    Created
                  </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateTime(report.created_at)}</span>
                  </div>
                </div>
              </CardContent>
              {report.report_file_url && (
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a
                      href={report.report_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Report</span>
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sponge Classifications</CardTitle>
                  <CardDescription>
                    Distribution of classifications in the dataset
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClassificationPieChart
                    classification_counts={report.classification_counts}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sponge Parts</CardTitle>
                  <CardDescription>
                    Distribution of segmented objects by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SegmentationDonutChart
                    object_counts={report.object_counts}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Information</CardTitle>
                <CardDescription>
                  Complete dataset report details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Object Counts
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(report.object_counts).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span className="capitalize">
                                {key.replace(/_/g, " ")}
                              </span>
                            </div>
                            <Badge variant="secondary">{value}</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Classification Counts
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(report.classification_counts).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span className="capitalize">
                                {key.replace(/_/g, " ")}
                              </span>
                            </div>
                            <Badge variant="secondary">{value}</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="snapshots">
            {report.snapshots && report.snapshots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {report.snapshots.map((snapshot) => (
                  <div
                    onClick={() => setSelectedSnapshot(snapshot)}
                    key={snapshot.id}
                    className={cn(
                      "cursor-pointer border border-gray-300 rounded-md overflow-hidden bg-white duration-200 flex flex-col",
                      selectedSnapshot === snapshot
                        ? "ring-2 ring-blue-500"
                        : "",
                    )}
                  >
                    {snapshot.src && (
                      <div className="bg-stone-950 w-full h-full">
                        <img
                          src={
                            CONFIG.SERVER_URL +
                            snapshot.src +
                            "?quality=20&size=400"
                          }
                          alt={`Snapshot: ${snapshot.media_name}`}
                          className="h-auto w-full aspect-video object-contain"
                        />
                      </div>
                    )}
                    <div className="p-3 flex-grow">
                      <p className="text-sm mb-1">
                        <strong className="font-semibold">Media:</strong>{" "}
                        {snapshot.media_name || "N/A"}
                      </p>
                      {snapshot.location_title && (
                        <p className="text-sm mb-1">
                          <strong className="font-semibold">Location:</strong>{" "}
                          {snapshot.location_title}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        <strong className="font-semibold">Created On:</strong>{" "}
                        {formatDateTime(snapshot.created_on)}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong className="font-semibold">Created By:</strong>{" "}
                        {snapshot.created_by_name || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No snapshots available</h3>
                <p className="text-muted-foreground mt-1">
                  This report doesn't contain any snapshot data.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {selectedSnapshot && (
        <SnapshotDetails
          snapshot={selectedSnapshot}
          onClearSnapshot={() => setSelectedSnapshot(null)}
        />
      )}
    </div>
  );
}

function SnapshotDetails({
  snapshot,
  onClearSnapshot,
}: {
  snapshot: Snapshot;
  onClearSnapshot: () => void;
}) {
  type reportSnapshot = {
    id: string;
    media_name: string;
    location_title: string;
    created_on: string;
    version: number;
    created_by_name: string;
    src: string;
    metadata: {
      name: string;
      rel: {
        src: string;
      };
      type: "image" | "cls";
      [key: string]: any;
    };
  };
  const [snapshotData, setSnapshotData] = useState<reportSnapshot | null>(null);

  useEffect(() => {
    if (snapshot?.id) {
      axiosInstance
        .get(`/v1/report/snapshots/${snapshot.id}`)
        .then((response) => {
          console.log(response.data);
          setSnapshotData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching snapshot data:", error);
          setSnapshotData(null);
        });
    } else {
      setSnapshotData(null);
    }
  }, [snapshot]);

  return (
    <div
      className={cn(
        "w-[64rem] border-l border-gray-300 relative flex-shrink-0 overflow-y-auto transition-transform duration-300 ease-in-out",
        snapshot ? "translate-x-0" : "translate-x-full",
        snapshot ? "block" : "hidden md:block",
        "md:w-96 lg:w-1/4 xl:w-1/5",
        snapshot ? "" : "md:hidden",
      )}
    >
      {snapshot && (
        <>
          <div className="mb-4 absolute z-10 right-1 top-1">
            <button
              onClick={onClearSnapshot}
              className="text-gray-600 hover:text-gray-900 bg-white hover:bg-red-500 text-base flex rounded-md items-center justify-center size-6"
              aria-label="Close sidebar"
            >
              x
            </button>
          </div>

          {snapshotData?.src && (
            <div className="inset-x-0 bg-red-300 relative">
              <img
                src={
                  CONFIG.SERVER_URL + snapshotData.src + "?quality=50&size=400"
                }
                key={snapshotData.id}
                alt={`Snapshot: ${snapshotData.metadata?.name || snapshotData.media_name || "N/A"}`}
                className="h-auto w-full aspect-video object-cover"
              />
            </div>
          )}

          <div className="p-2 pt-3">
            <div className="space-y-3 text-xs font-mono">
              <h3 className="text-sm font-bold">Snapshot Details</h3>
              {snapshotData && (
                <>
                  <p>
                    <strong className="font-semibold">ID:</strong>{" "}
                    {snapshotData.id}
                  </p>
                  <p>
                    <strong className="font-semibold">Media Name:</strong>{" "}
                    {snapshotData.media_name || "N/A"}
                  </p>
                  {snapshotData.location_title && (
                    <p>
                      <strong className="font-semibold">Location:</strong>{" "}
                      {snapshotData.location_title}
                    </p>
                  )}
                  <p>
                    <strong className="font-semibold">Created On:</strong>{" "}
                    {formatDateTime(snapshotData.created_on)}
                  </p>
                  <p>
                    <strong className="font-semibold">Created By:</strong>{" "}
                    {snapshotData.created_by_name || "N/A"}
                  </p>
                  {snapshotData.metadata && (
                    <div>
                      <strong className="font-semibold">Source:</strong>
                      {snapshotData.metadata.rel.src && (
                        <img
                          src={
                            CONFIG.SERVER_URL + snapshotData.metadata.rel.src
                          }
                          key={snapshotData.metadata.rel.src}
                          alt={`Snapshot: ${snapshotData.metadata?.name || snapshotData.media_name || "N/A"}`}
                          className="h-auto w-full aspect-video object-cover"
                        />
                      )}
                      {snapshotData.metadata.type === "cls" && (
                        <div>
                          <strong className="font-semibold">
                            Classification Result:
                          </strong>
                          <p>{snapshotData.metadata.result}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <strong className="font-semibold mt-2 mb-1">Metadata:</strong>
                  <div className="font-space break-words whitespace-break-spaces text-xs">
                    {JSON.stringify(snapshotData.metadata)}
                  </div>
                </>
              )}
              {!snapshotData && (
                <p className="text-gray-500">Loading snapshot details...</p>
              )}
            </div>
          </div>
        </>
      )}
      {!snapshot && (
        <div className="p-2 pt-3 text-gray-600">
          Select a snapshot to view details.
        </div>
      )}
    </div>
  );
}
