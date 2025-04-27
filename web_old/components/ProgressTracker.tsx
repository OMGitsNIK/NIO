"use client";

import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function ProgressTracker() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const SERVER_URL = "http://127.0.0.1:8000/"; 

  useEffect(() => {
  const eventSource = new EventSource(`${SERVER_URL}/events`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setMessage(data.message);
      toast(data.message);
    } catch (error) {
      console.error("Error parsing event data:", error);
    }
  };

  eventSource.onerror = (error) => {
    console.error("EventSource error:", error);
    eventSource.close();
    toast.error("Connection error. Reconnecting...");
    // Optional: Implement reconnect logic here
  };

  return () => {
    eventSource.close();
  };
}, []);

  return (
    <div className="w-full max-w-md mx-auto">
            <Progress value={progress} className="h-4 mt-2" />

      <p className="text-lg font-semibold text-black">{message}</p>
      <p className="text-sm mt-2">{progress}% Completed</p>
    </div>
  );
}
