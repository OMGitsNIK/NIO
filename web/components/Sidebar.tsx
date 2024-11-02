import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <div className="w-64 bg-black p-4 hidden md:block border-r border-gray-800">
      <h2 className="text-xl font-bold mb-4">Organize by:</h2>
      <nav>
        <Button variant="ghost" className="w-full justify-start mb-2">Species</Button>
        <Button variant="ghost" className="w-full justify-start mb-2">Location</Button>
        <Button variant="ghost" className="w-full justify-start mb-2">Projects</Button>
      </nav>
    </div>
  )
}