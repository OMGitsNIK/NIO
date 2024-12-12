import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface AnalysisSidebarProps {
  file: File | null
}

export function AnalysisSidebar({ file }: AnalysisSidebarProps) {
  return (
    <div className=" border-l bg-background p-6 flex flex-col gap-6 overflow-y-scroll text-black">
      <h2 className="text-lg font-semibold">Report Generation</h2>
      
      <div className="space-y-4">
        <div>
          <Label className="text-base">Count Objects</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox id="tentacles" />
            <Label htmlFor="tentacles">Tentacles</Label>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox id="buds" />
            <Label htmlFor="buds">Buds</Label>
          </div>
        </div>

        <div>
          <Label className="text-base">Use Region</Label>
          <Input value="Region (1)" className="mt-2" />
        </div>

        <div>
          <Label className="text-base">Include Images</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox id="edge-detection" />
            <Label htmlFor="edge-detection">Edge Detection</Label>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox id="deblured" />
            <Label htmlFor="deblured">Deblured</Label>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox id="histogram" />
            <Label htmlFor="histogram">Histogram</Label>
          </div>
        </div>

        <div>
          <Label className="text-base">Report Format</Label>
          <Input value="PDF" className="mt-2" />
        </div>
      </div>

      <Button className="w-full mt-auto">Analyze</Button>

      {file && (
        <div className="text-sm text-muted-foreground space-y-1 mt-4">
          <p>Filename: {file.name}</p>
          <p>Image Type: {file.type}</p>
          <p>Size: {(file.size / 1024).toFixed(1)} kB</p>
          <p>Width: 2560 pixels</p>
          <p>Height: 1440 pixels</p>
        </div>
      )}
    </div>
  )
}