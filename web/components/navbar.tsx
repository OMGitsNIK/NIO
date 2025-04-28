"use client";
import { ArrowRightIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CONFIG } from "@/lib/config";
import { Space_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const space_mono = Space_Mono({ subsets: ["latin"], weight: ["400"] });

function Nav() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
      router.push(`?${params.toString()}`);
    }
  };
  return (
    <div className="w-full h-full flex border-b relative">
      <div className="relative w-96 h-full">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="peer ps-9 pe-9 h-full rounded-none border-0 border-r"
          placeholder="Search..."
          type="search"
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
        <button
          onClick={handleSearch}
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Submit search"
          type="submit"
        >
          <ArrowRightIcon size={16} aria-hidden="true" />
        </button>
      </div>

      <Alerts />
    </div>
  );
}
export function NavBar() {
  return (
    <Suspense>
      <Nav />
    </Suspense>
  );
}

function Alerts() {
  const router = useRouter();
  const [alert, setAlert] = useState<{
    message: string;
    progress: number;
    type: "REFRESH" | string;
  }>({
    message: "",
    progress: 0,
    type: "",
  });

  useEffect(() => {
    const eventSource = new EventSource(CONFIG.SERVER_URL + "/v1/events/");
    eventSource.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      setAlert(newAlert);
      if (newAlert.type === "REFRESH") {
        window.location.reload();
        router.refresh();
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-start p-2">
      <div className={cn(space_mono.className)}>
        <p>{alert.message}</p>
        <p>Progress: {alert.progress}%</p>
      </div>

      <div className=" w-full h-0.5 absolute -bottom-0.5 inset-x-0">
        <div
          className="h-full overflow-hidden transition-all duration-300 bg-gradient-to-l  from-sky-500 to-blue-400"
          style={{
            width: alert.progress + "%",
            opacity: alert.progress == 100 ? 0 : 100,
          }}
        ></div>
      </div>
    </div>
  );
}
