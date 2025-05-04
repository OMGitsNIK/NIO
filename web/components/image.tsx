"use client";
import { cn } from "@/lib/utils";

export default function Image({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <h1>Loading</h1>
      <img src={src} alt="Image" className="w-full h-full" />
    </div>
  );
}
