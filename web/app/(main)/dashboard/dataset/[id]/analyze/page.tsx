"use client";
import { useParams } from "next/navigation";

export default function AnalyzePage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Analyze Dataset {id}</h1>
    </div>
  );
}
