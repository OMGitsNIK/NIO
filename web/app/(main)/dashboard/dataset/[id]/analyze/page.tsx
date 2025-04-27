"use client";
import { useParams } from "next/navigation";

export default async function AnalyzePage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Analyze Dataset</h1>
    </div>
  );
}
