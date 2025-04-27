"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Button } from "@/components/ui/button"
// import { DashboardHeader } from "@/components/DashboardHeader"
import { SidebarComponent } from "@/components/Sidebar"
import { BarChart3, Search, Hash,PanelLeft, Wand2 } from "lucide-react"
import { Tooltip, TooltipContent,TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AnalysisSidebar } from "@/components/AnalysisSidebar"
import ProgressTracker from "@/components/ProgressTracker"


export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [currentTask, setCurrentTask] = useState<string>("waiting")
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)

  useEffect(() => {
    const storedImage = localStorage.getItem("analyzeImage");
    if (storedImage) {
      setPreview(storedImage);
      localStorage.removeItem("analyzeImage");
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      setFile(acceptedFiles[0])
      setPreview(URL.createObjectURL(acceptedFiles[0]))
      //analysis
      setCurrentTask("segmentaion")
      setTimeElapsed(300)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: false
  })

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
  };

  const actionButtons = [
    { icon: BarChart3, tooltip: "Report Generation" },
    { icon: Search, tooltip: "Image Classification" },
    { icon: Hash, tooltip: "Object Counting" },
    { icon: PanelLeft, tooltip: "Depth Estimation" },
    { icon: Wand2, tooltip: "Similar Search" },
  ]
  

  if (preview) {
    return (
      <div className="flex h-screen overflow-hidden bg-white">
        <SidebarComponent  />
    
          <main className="flex-1 overflow-auto bg-black/5">
            {/* Status Bar */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <span>current task : {currentTask}</span>
                <span>time elapsed : {timeElapsed} ms</span>
                <ProgressTracker />
              </div>
            </div>

            {/* Image Display */}
            <div className="relative flex flex-col items-center justify-between min-h-[calc(100%-60px)]">
              <div className={`relative w-full max-w-5xl mx-auto my-8  h-[calc(100vh-300px)] ${isAnalyzing ? 'img-effect' : ''}`}>
                <Image
                  src={preview}
                  alt="Uploaded sponge image"
                  fill
                  className=" object-contain"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-8 flex justify-center w-full">
                <TooltipProvider delayDuration={0}>
                  <div className="flex gap-2 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-lg">
                    {actionButtons.map((action, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`relative rounded-full w-12 h-12 transition-all duration-300 hover:scale-110 group hover:bg-[#02B1CC] text-black`}
                          >
                            <action.icon className="w-5 h-5" />
                            <span className="sr-only">{action.tooltip}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          className="text-black font-medium bg-background/80 backdrop-blur-sm"
                        >
                          {action.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </div>
            </div>
          </main>
       
        <AnalysisSidebar file={file} onAnalysisStart={handleAnalysisStart} onAnalysisComplete={handleAnalysisComplete} />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <SidebarComponent />
  
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center min-h-full p-6">
            <div className="w-full max-w-2xl mx-auto text-center">
              <div
                {...getRootProps()}
                className="relative p-12 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-2xl text-black font-semibold">
                      {isDragActive ? "Drop the image here" : "Drag and Drop an Image"}
                    </p>
                    <p className="text-lg text-muted-foreground">
                      or{" "}
                      <span 
                        className="text-[#02B1CC] text-2xl font-semibold hover:underline cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            const input = document.querySelector('input[type="file"]')
                            // if (input) {
                            //   input.click()
                            // }
                          }
                        }}
                      >
                        browse to upload
                      </span>
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    className="bg-[#02B1CC] hover:bg-white hover:text-[#02B1CC] border border-[#02B1CC] py-12 px-12 text-white text-xl font-semibold rounded-3xl"
                    onClick={(e) => {
                      e.stopPropagation()
                      const input = document.querySelector('input[type="file"]')
                      if (input) {
                        input.click()
                      }
                    }}
                  >
                    Upload your Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    File must be JPEG, JPG, PNG or WebP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main> 
     
    </div>
  )
}