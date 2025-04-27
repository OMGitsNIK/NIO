"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SidebarComponent } from "@/components/Sidebar";
import { AnalysisSidebar } from "@/components/AnalysisSidebar";
import { useRouter } from "next/navigation";
import { CONFIG } from "@/lib/config";

export default function AnalyzePage({ params }: { params: { id: string } }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<string>("waiting");
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); // Supports local file upload
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      setImageSrc(`${CONFIG.SERVER_URL}/v1/bucket/${params.id}`);
      setCurrentTask("segmentation");
      setTimeElapsed(300);
    }
  }, [params.id]);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <SidebarComponent />
      <main className="flex-1 overflow-auto bg-black/5">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <span>current task: {currentTask}</span>
            <span>time elapsed: {timeElapsed} ms</span>
          </div>
        </div>
        <div className="relative flex flex-col items-center justify-center min-h-[calc(100%-60px)]">
          <div className="relative w-full max-w-5xl mx-auto my-8 h-[calc(100vh-300px)]">
            <Image
              src={imageSrc || ""}
              alt="Selected sponge image"
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        </div>
      </main>
      <AnalysisSidebar file={uploadedFile} imageSrc={imageSrc} />
    </div>
  );
}
