import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { CONFIG } from "@/lib/config";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface AnalysisSidebarProps {
  file: File | null;
  imageSrc: string | null;
}

export function AnalysisSidebar({ file, imageSrc }: AnalysisSidebarProps) {
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [reportFormat, setReportFormat] = useState("PDF");
  const [region, setRegion] = useState("Region (1)");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleCheckboxChange = (item: string) => {
    setSelectedObjects((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleImageCheckboxChange = (item: string) => {
    setSelectedImages((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAnalysis = () => {
    if (!file && !imageSrc) return;

    if (file) {
      const fd = new FormData();
      fd.append("image", file);
      fd.append(
        "operations",
        JSON.stringify({
          count: selectedObjects,
          include_images: selectedImages,
          report_format: reportFormat,
        })
      );

      axios.post(`${CONFIG.SERVER_URL}/v1/process_image`, fd).then((r) => {
        console.log(r.data);
        downloadPdf(r.data.pdf, "report.pdf");
      });
    } else if (imageSrc) {
      axios
        .post(`${CONFIG.SERVER_URL}/v1/process_image`, {
          image_url: imageSrc,
          operations: {
            count: selectedObjects,
            include_images: selectedImages,
            report_format: reportFormat,
          },
        })
        .then((r) => {
          console.log(r.data);
          downloadPdf(r.data.pdf, "report.pdf");
        });
    }
  };

  const downloadPdf = (b64: string, filename: string) => {
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${b64}`;
    link.download = filename;
    link.click();
  };

  return (
    <div className="border-l bg-background p-6 flex flex-col gap-6 overflow-y-scroll text-black">
      <h2 className="text-lg font-semibold">Report Generation</h2>

      <div className="space-y-4">
        <div>
          <Label className="text-base">Count Objects</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="tentacles"
              checked={selectedObjects.includes("tentacles")}
              onCheckedChange={() => handleCheckboxChange("tentacles")}
            />
            <Label htmlFor="tentacles">Tentacles</Label>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="buds"
              checked={selectedObjects.includes("buds")}
              onCheckedChange={() => handleCheckboxChange("buds")}
            />
            <Label htmlFor="buds">Buds</Label>
          </div>
        </div>

        <div>
          <Label className="text-base">Use Region</Label>
          <Input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-base">Include Images</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="edge-detection"
              checked={selectedImages.includes("edge-detection")}
              onCheckedChange={() => handleImageCheckboxChange("edge-detection")}
            />
            <Label htmlFor="edge-detection">Edge Detection</Label>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="deblured"
              checked={selectedImages.includes("deblured")}
              onCheckedChange={() => handleImageCheckboxChange("deblured")}
            />
            <Label htmlFor="deblured">Deblured</Label>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="histogram"
              checked={selectedImages.includes("histogram")}
              onCheckedChange={() => handleImageCheckboxChange("histogram")}
            />
            <Label htmlFor="histogram">Histogram</Label>
          </div>
        </div>

        <div>
          <Label className="text-base">Report Format</Label>
          <Select
            value={reportFormat}
            onValueChange={(value) => setReportFormat(value)}
          >
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="Doc">WEB</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button className="w-full mt-auto" onClick={handleAnalysis}>
        Analyze
      </Button>

      {file && (
        <div className="text-sm text-muted-foreground space-y-1 mt-4">
          <p>Filename: {file.name}</p>
          <p>Image Type: {file.type}</p>
          <p>Size: {(file.size / 1024).toFixed(1)} kB</p>
        </div>
      )}

      {imageSrc && !file && (
        <div className="text-sm text-muted-foreground space-y-1 mt-4">
          <p>Image Source: {imageSrc}</p>
        </div>
      )}
    </div>
  );
}
