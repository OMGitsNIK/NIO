import { NavBar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid grid-cols-6 ">
      <Sidebar />

      <div className=" col-span-5 grid-rows-12 grid h-screen">
        <div className="row-span-1">
          <NavBar />
        </div>
        <div className="row-span-11">{children}</div>
      </div>
    </main>
  );
}
