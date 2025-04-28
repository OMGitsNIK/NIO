// src/app/datasets/[id]/page.tsx
"use client";

import axiosInstance from "@/lib/axios";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  AlertCircleIcon,
  ImageIcon,
  Trash2,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { CONFIG } from "@/lib/config";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AxiosError } from "axios";

interface Snapshot {
  id: string;
  src: string;
  created_on: string;
  version: number;
}

interface Dataset {
  name: string;
  description: string;
  created_at: string;
  snapshots: Snapshot[];
}

interface UploadableFile {
  id: string;
  file: File;
  preview: string;
  errors?: string[];
}

interface UseFileUploadOptions {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  maxFiles?: number;
}

interface FileUploadState {
  files: UploadableFile[];
  isDragging: boolean;
  errors: string[];
}

interface FileUploadHandlers {
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  openFileDialog: () => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
  setFiles: React.Dispatch<React.SetStateAction<UploadableFile[]>>;
}

const useFileUpload = (
  options: UseFileUploadOptions = {},
): [FileUploadState, FileUploadHandlers] => {
  const {
    accept = "",
    maxSize = Infinity,
    multiple = false,
    maxFiles = Infinity,
  } = options;

  const [files, setFiles] = useState<UploadableFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string[] => {
      const fileErrors: string[] = [];
      if (maxSize && file.size > maxSize) {
        fileErrors.push(
          `File ${file.name} exceeds the max size of ${(maxSize / 1024 / 1024).toFixed(1)}MB.`,
        );
      }
      if (accept) {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const fileType = file.type;
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return fileExtension === type;
          }
          if (type.endsWith("/*")) {
            return fileType.startsWith(type.slice(0, -2));
          }
          return fileType === type;
        });

        if (!isAccepted) {
          fileErrors.push(
            `File type ${fileType || fileExtension} is not accepted.`,
          );
        }
      }
      return fileErrors;
    },
    [accept, maxSize],
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setErrors([]);
      const currentFileCount = files.length;
      const filesToAdd: UploadableFile[] = [];
      const validationErrors: string[] = [];
      let processedCount = 0;

      Array.from(newFiles).forEach((file) => {
        if (currentFileCount + processedCount >= maxFiles) {
          if (
            !validationErrors.includes(
              `Cannot add more than ${maxFiles} files.`,
            )
          ) {
            validationErrors.push(`Cannot add more than ${maxFiles} files.`);
          }
          return;
        }

        const fileErrors = validateFile(file);
        if (fileErrors.length > 0) {
          validationErrors.push(...fileErrors);
        } else {
          const preview = URL.createObjectURL(file);
          filesToAdd.push({ id: crypto.randomUUID(), file, preview });
          processedCount++;
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        filesToAdd.forEach((f) => {
          if (f.errors && f.preview) URL.revokeObjectURL(f.preview);
        });
      }

      setFiles((prevFiles) =>
        [...prevFiles, ...filesToAdd.filter((f) => !f.errors)].slice(
          0,
          maxFiles,
        ),
      );
    },
    [files.length, maxFiles, validateFile],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles.find((f) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter((f) => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles((prevFiles) => {
      prevFiles.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      return [];
    });
    setErrors([]);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [addFiles],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles],
  );

  const openFileDialog = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const getInputProps = useCallback(
    (): React.InputHTMLAttributes<HTMLInputElement> => ({
      type: "file",
      style: { display: "none" },
      accept: accept,
      multiple: multiple,
      onChange: handleFileChange,
    }),
    [accept, multiple, handleFileChange],
  );

  const state: FileUploadState = { files, isDragging, errors };
  const handlers: FileUploadHandlers = {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    openFileDialog,
    removeFile,
    clearFiles,
    getInputProps,
    setFiles,
  };

  return [state, handlers];
};

interface FileUploadAreaProps {
  files: UploadableFile[];
  isDragging: boolean;
  validationErrors: string[];
  fileUploadHandlers: FileUploadHandlers;
  isUploading: boolean;
  uploadError: string | null;
  onUpload: () => void;
  maxFiles: number;
  maxSizeMB: number;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  files,
  isDragging,
  validationErrors,
  fileUploadHandlers,
  isUploading,
  uploadError,
  onUpload,
  maxFiles,
  maxSizeMB,
}) => {
  const {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    openFileDialog,
    removeFile,
    getInputProps,
  } = fileUploadHandlers;

  return (
    <div className="">
      <h3 className="text-xl font-semibold mb-4">Upload New Snapshots</h3>
      <div className="flex flex-col gap-3">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          data-files={files.length > 0 || undefined}
          className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border-2 border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
        >
          <input
            {...getInputProps()}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Upload snapshot files"
            disabled={isUploading}
          />
          {files.length > 0 ? (
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-medium">
                  Files ready for upload ({files.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openFileDialog}
                  disabled={files.length >= maxFiles || isUploading}
                >
                  <UploadIcon
                    className="-ms-0.5 size-3.5 opacity-60"
                    aria-hidden="true"
                  />
                  Add more
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-accent/50 dark:bg-accent/80 relative aspect-square rounded-md overflow-hidden group"
                  >
                    {file.file.type.startsWith("image/") ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="size-full rounded-[inherit] object-cover"
                        onLoad={() => URL.revokeObjectURL(file.preview)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                        <span className="text-xs font-medium truncate w-full px-1">
                          {file.file.name}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    )}
                    <Button
                      onClick={() => removeFile(file.id)}
                      variant="destructive"
                      size="icon"
                      className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove file"
                      disabled={isUploading}
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <ImageIcon className="size-5 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">
                Drop files here or click to browse
              </p>
              <p className="text-muted-foreground text-xs">
                Max {maxFiles} files, up to {maxSizeMB}MB each.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={openFileDialog}
                disabled={isUploading}
              >
                <UploadIcon
                  className="-ms-1 size-4 opacity-60"
                  aria-hidden="true"
                />
                Select Files
              </Button>
            </div>
          )}
        </div>

        {validationErrors.length > 0 && (
          <div
            className="text-destructive flex items-center gap-1 text-xs px-1"
            role="alert"
          >
            <AlertCircleIcon className="size-3.5 shrink-0" />
            <span>{validationErrors[0]}</span>
          </div>
        )}

        {files.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3">
            <Button
              onClick={onUpload}
              disabled={isUploading || files.length === 0}
              className="w-full sm:w-auto"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon
                    className="-ml-1 mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  {`Upload ${files.length} File${files.length > 1 ? "s" : ""}`}
                </>
              )}
            </Button>
            {uploadError && (
              <div className="text-destructive text-xs text-center sm:text-right flex items-center gap-1">
                <AlertCircleIcon className="size-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface SnapshotListItemProps {
  snapshot: Snapshot;
  onSnapshotDeleted: (snapshotId: string) => void; // Add this prop
}

const SnapshotListItem: React.FC<SnapshotListItemProps> = ({
  snapshot,
  onSnapshotDeleted, // Destructure the new prop
}) => {
  const [isDeleting, setIsDeleting] = useState(false); // Add loading state for deletion

  const handleDeleteSnapshot = async (id: string) => {
    setIsDeleting(true); // Set deleting state
    try {
      await axiosInstance.delete(`/v1/snapshot/${id}`);
      toast.success("Snapshot deleted successfully");
      // Instead of reloading, call the parent callback
      onSnapshotDeleted(id);
    } catch {
      toast.error("Failed to delete snapshot");
    } finally {
      setIsDeleting(false); // Reset deleting state
    }
  };

  return (
    <div
      key={snapshot.id}
      className="overflow-hidden group w-full transition-all relative hover:ring-2 ring-blue-300 h-64 text-xs rounded-sm border border-stone-700/10 bg-neutral-50 "
    >
      <img
        src={CONFIG.SERVER_URL + snapshot.src}
        alt={snapshot.src}
        className="h-auto w-full aspect-video object-cover"
      />
      <div className="p-4 ">
        <Button
          size="icon"
          className="absolute size-8 top-1 right-1 delay-75 duration-700 group-hover:opacity-100 opacity-0 transition-all"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteSnapshot(snapshot.id);
          }}
          disabled={isDeleting} // Disable button while deleting
        >
          {isDeleting ? (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <Trash2 />
          )}
        </Button>

        <p>
          <strong>Created At:</strong> {snapshot.created_on}
        </p>
      </div>
    </div>
  );
};

export default function DatasetPage() {
  const { data: session } = useSession();
  const { id: datasetId } = useParams<{ id: string }>();

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State for analysis process
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  // You'll likely need state to select a pipeline
  const [selectedPipelineId] = useState<string | null>(null); // Placeholder

  const maxSizeMB = 100;
  const maxSize = maxSizeMB * 1024 * 1024;
  const maxFiles = 10;

  const [{ files, isDragging, errors: validationErrors }, fileUploadHandlers] =
    useFileUpload({
      accept:
        "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,video/mp4,video/quicktime,application/pdf",
      maxSize,
      multiple: true,
      maxFiles,
    });

  // Function to fetch the dataset details
  const fetchDataset = useCallback(async () => {
    if (!datasetId) return;

    setLoading(true);
    setFetchError(null);
    try {
      // Assuming your backend endpoint for a single dataset by ID is v1/dataset/{id}
      const response = await axiosInstance.get<Dataset>(
        `/v1/dataset/${datasetId}`,
        {
          // Pass user_id as a query parameter if needed for access control
          params: { user_id: session?.user?.id },
        },
      );
      // Adjust the data structure if your GET /v1/dataset/{id} returns it differently
      // The current backend code for GET /v1/dataset/{id} returns a different structure
      // You might need to adjust this based on your actual API design
      // For now, assuming the structure matches the Dataset interface for simplicity
      setDataset(response.data);
    } catch (err) {
      setFetchError("Failed to fetch dataset details.");
      console.error("Fetch dataset error:", err);
    } finally {
      setLoading(false);
    }
  }, [datasetId, session?.user?.id]); // Add session.user.id as a dependency

  // Fetch dataset on initial load and when datasetId or user ID changes
  useEffect(() => {
    if (session?.user?.id) {
      // Only fetch if user ID is available
      fetchDataset();
    }
  }, [fetchDataset, session?.user?.id]);

  // Function to handle snapshot deletion from child component
  const handleSnapshotDeleted = useCallback((deletedSnapshotId: string) => {
    setDataset((prevDataset) => {
      if (!prevDataset) return null;
      return {
        ...prevDataset,
        snapshots: prevDataset.snapshots.filter(
          (snapshot) => snapshot.id !== deletedSnapshotId,
        ),
      };
    });
  }, []);

  const handleUpload = async () => {
    if (files.length === 0 || !datasetId || !session?.user.id) {
      setUploadError(
        "No files selected, dataset ID missing, or user not logged in.",
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const uploadPromises = files.map(async (uploadableFile) => {
      if (!uploadableFile.file) {
        return {
          status: "rejected",
          id: uploadableFile.id,
          error: `File data missing for ${uploadableFile.id}`,
        };
      }

      const formData = new FormData();
      formData.append("file", uploadableFile.file);
      formData.append("name", uploadableFile.file.name);
      formData.append("user_id", session.user.id);
      formData.append("dataset_id", datasetId);

      try {
        const response = await axiosInstance.post("/v1/snapshot", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return {
          status: "fulfilled",
          id: uploadableFile.id,
          responseData: response.data, // Assuming backend returns some relevant data
        };
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          const errorMessage =
            error.response?.data?.message ||
            `Failed to upload ${uploadableFile.file.name}`;
          return {
            status: "rejected",
            id: uploadableFile.id,
            error: errorMessage,
          };
        }
      }
    });

    const results = await Promise.allSettled(uploadPromises);
    setIsUploading(false);

    const failedUploads = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    const successfulUploads = results.filter(
      (result): result is PromiseFulfilledResult<any> =>
        result.status === "fulfilled",
    );

    if (failedUploads.length > 0) {
      const errorMessages = failedUploads.map(
        (result) => result.reason?.error || "Unknown upload error",
      );
      setUploadError(
        `Some files failed to upload: ${errorMessages.join(", ")}`,
      );
      // Remove successfully uploaded files from the upload list
      successfulUploads.forEach((result) => {
        if (result.status === "fulfilled" && result.value?.id) {
          fileUploadHandlers.removeFile(result.value.id);
        }
      });
    } else {
      setUploadError(null);
      // Clear all files from the upload list if all uploads were successful
      if (fileUploadHandlers.clearFiles) {
        fileUploadHandlers.clearFiles();
      } else {
        files.forEach((f) => fileUploadHandlers.removeFile(f.id));
      }
      toast.success(
        `${successfulUploads.length} file(s) uploaded successfully.`,
      );
    }

    // Refetch the dataset to get the updated list of snapshots
    if (successfulUploads.length > 0) {
      fetchDataset();
    }
  };

  // --- Function to handle the Analyze button click ---
  const handleAnalyzeClick = async () => {
    if (!datasetId || !session?.user?.id) {
      setAnalysisError("Dataset ID or User ID is missing.");
      return;
    }

    // TODO: Implement logic to select a pipeline ID
    // For now, using a placeholder. You need a UI element (like a dropdown)
    // to allow the user to choose a pipeline and update selectedPipelineId state.
    if (!selectedPipelineId) {
      setAnalysisError("Please select a pipeline to analyze with.");
      // You might want to open a modal or show a selection UI here
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Make the POST request to your AnalyzeDataset endpoint
      const response = await axiosInstance.post("/v1/analyze_dataset/", {
        // Adjust URL if needed
        dataset_id: datasetId,
        pipeline_id: selectedPipelineId, // Use the selected pipeline ID
        user_id: session.user.id,
      });

      console.log("Analysis request sent:", response.data);
      // The actual analysis results will likely come via SSE,
      // so you might not need to do much with this immediate response
      // other than confirming the request was accepted.

      // You would typically start listening for SSE events here or
      // have a global SSE listener that updates relevant state.
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error || "Failed to start dataset analysis.";
        setAnalysisError(errorMessage);
      }
      console.error("Analyze dataset error:", error);
    } finally {
      setIsAnalyzing(false); // Set to false when the *request* is complete.
      // The actual analysis running state will be managed by SSE.
    }
  };
  // --- End of Analyze button click handler ---

  if (loading && !dataset) {
    return <div className="p-6 text-center">Loading dataset details...</div>;
  }

  if (fetchError) {
    return <div className="p-6 text-red-500 text-center">{fetchError}</div>;
  }

  if (!dataset) {
    return (
      <div className="p-6 text-center">
        Dataset not found or could not be loaded.
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6 pb-4 border-b flex justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">{dataset.name}</h2>{" "}
          {/* Adjusted field name */}
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {dataset.description || "No description provided."}{" "}
            {/* Adjusted field name */}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Created: {new Date(dataset.created_at).toLocaleString()}{" "}
            {/* Adjusted field name */}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {" "}
          {/* Added flex and spacing */}
          {/* Add a UI element here to select a pipeline */}
          {/* Example: <PipelineSelect onPipelineSelected={setSelectedPipelineId} /> */}
          <Button
            onClick={handleAnalyzeClick} // Attach the click handler
            disabled={isAnalyzing} // Disable while analyzing or if no pipeline selected
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Snapshot</Button>
            </DialogTrigger>
            <DialogContent>
              <div className="hidden">
                {" "}
                {/* Consider making this visible */}
                <DialogTitle>File Upload</DialogTitle>
              </div>
              <FileUploadArea
                files={files}
                isDragging={isDragging}
                validationErrors={validationErrors}
                fileUploadHandlers={fileUploadHandlers}
                isUploading={isUploading}
                uploadError={uploadError}
                onUpload={handleUpload}
                maxFiles={maxFiles}
                maxSizeMB={maxSizeMB}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Display analysis error if any */}
      {analysisError && (
        <div className="mb-4 text-red-500">{analysisError}</div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">
          Existing Snapshots ({dataset.snapshots.length})
        </h3>{" "}
        {/* Added item count */}
        {dataset.snapshots.length === 0 ? (
          <p className="text-gray-500 italic">
            No snapshots have been uploaded yet.
          </p>
        ) : (
          <ul className=" gap-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {" "}
            {/* Improved grid responsiveness */}
            {dataset.snapshots.map((snapshot) => (
              <SnapshotListItem
                key={snapshot.id}
                snapshot={snapshot}
                onSnapshotDeleted={handleSnapshotDeleted} // Pass the callback here
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
