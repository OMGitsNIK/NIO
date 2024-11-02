import { DatasetView } from "@/components/DatasetView"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import datasets from "@/public/dataset.json"

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <DatasetView datasets={datasets} /> {/* Use the imported datasets */}
        </main>
      </div>
    </div>
  )
}