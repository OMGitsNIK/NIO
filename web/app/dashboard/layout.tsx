import { SidebarComponent } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex h-screen ">
			<SidebarComponent />
			<Toaster />

			{children}
		</div>
	);
}
