"use client";
import axiosInstance from "@/lib/axios";
import { CONFIG } from "@/lib/config";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const formatDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) {
    return "N/A";
  }
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
};

interface Snapshot {
  id: string;
  media_name: string;
  src: string;
  location_title: string;
  created_on: string;
  version: number;
  created_by_name: string;
}

interface Report {
  id: string;
  dataset_name: string;
  user_name: string;
  report_file_url: string | null;
  created_at: string;
  status: string;
  snapshots: Snapshot[];
}

export default function ReportPage() {
  const { id: reportId } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="font-sans p-5 ">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-3">
        Report: {report.dataset_name}
      </h1>

      <div className="mb-8 p-4 border border-gray-200 rounded bg-gray-50">
        <p>
          <strong className="font-semibold">Report ID:</strong> {report.id}
        </p>
        <p>
          <strong className="font-semibold">User:</strong> {report.user_name}
        </p>
        <p>
          <strong className="font-semibold">Status:</strong>
          <span
            className={`ml-1 font-bold ${report.status === "completed" ? "text-green-600" : "text-orange-500"}`}
          >
            {report.status}
          </span>
        </p>
        <p>
          <strong className="font-semibold">Created At:</strong>{" "}
          {formatDateTime(report.created_at)}
        </p>
        {report.report_file_url && (
          <p>
            <strong className="font-semibold">Report File:</strong>{" "}
            <a
              href={report.report_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Download Report
            </a>
          </p>
        )}
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mt-8 mb-4 border-b border-gray-200 pb-2">
        Snapshots ({report.snapshots?.length || 0})
      </h2>
      {report.snapshots && report.snapshots.length > 0 ? (
        <div className="grid grid-cols-4 gap-5">
          {report.snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm flex flex-col"
            >
              {snapshot.media_name && (
                <img
                  src={CONFIG.SERVER_URL + snapshot.src}
                  alt={`Snapshot: ${snapshot.media_name}`}
                  className="h-auto w-full aspect-video object-cover mb-3 "
                />
              )}
              <div className="p-2">
                <p>
                  <strong className="font-semibold">Media:</strong>{" "}
                  {snapshot.media_name}
                </p>
                {snapshot.location_title && (
                  <p>
                    <strong className="font-semibold">Location:</strong>{" "}
                    {snapshot.location_title}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  <strong className="font-semibold">Created On:</strong>{" "}
                  {formatDateTime(snapshot.created_on)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong className="font-semibold">Created By:</strong>{" "}
                  {snapshot.created_by_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No snapshots available for this report.</p>
      )}
    </div>
  );
}
