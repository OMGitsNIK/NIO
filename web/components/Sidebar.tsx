"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Layout, Map, Settings, Menu, X, ChevronLast, ChevronLeft, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewDatasetModal } from "./NewDatasetModal";
import { Dataset } from "@/types/db";
import { CONFIG } from "@/lib/config";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";

interface SidebarProps {
	onAddDataset: (dataset: {
		title: string;
		description: string;
		image: string;
		items: number;
		createdDate: string;
	}) => void;
}

export function SidebarComponent() {
	const pathname = usePathname();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const { data: session } = useSession();

	const navItems = [
		{ href: "/dashboard", icon: Layout, label: "Dashboard" },
		// { href: "/map", icon: Map, label: "Map" },
		{ href: "/analyze", icon: Settings, label: "Analyze" },
	];

	return (
		<>
			{/* Full-width Navbar for Mobile Screens */}
			{!isSidebarOpen && (
				<div className="fixed top-0 left-0 right-0 z-50 bg-white text-black border-b shadow md:hidden flex items-center justify-between p-4">
					<div className="flex items-center gap-2">
						{/* Hamburger Icon */}
						<button
							className="p-2 rounded-full bg-white text-black border shadow"
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						>
							<Menu className="h-6 w-6" />
						</button>
						<Image src="/logo.svg" alt="Logo" width={40} height={40} />
						<span className="font-semibold text-xl">Sponge Analyzer</span>
					</div>
					<div className="flex items-center gap-2">
						{/* User Icon with Dropdown Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
									<Avatar className="h-8 w-8">
										<AvatarImage src="/placeholder.svg" alt="User" />
										<AvatarFallback>R</AvatarFallback>
									</Avatar>
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal p-2">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">
											Rhys
										</p>
										<p className="text-xs leading-none text-muted-foreground">
											rhys@gmail.com
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="hover:bg-gray-100">Profile</DropdownMenuItem>
								<DropdownMenuItem className="hover:bg-gray-100">Settings</DropdownMenuItem>
								<DropdownMenuItem className="hover:bg-gray-100" onClick={() => signOut()}>
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed top-0 left-0 z-40 h-full bg-white text-black border-r duration-300 md:relative md:translate-x-0",
					isSidebarOpen
						? "translate-x-0"
						: "-translate-x-full md:translate-x-0",
					isMinimized ? "w-16" : "w-60",
				)}
			>
				{/* Toggle Button */}
				<button
					className="hidden size-8  md:flex items-center justify-center p-2 rounded-full absolute -right-4 top-2  bg-white text-black border shadow "
					onClick={() => setIsMinimized(!isMinimized)}
				>
					<ChevronLeft
						className={cn(
							isMinimized ? "rotate-180" : "rotate-0",
							" size-4",
						)}
					/>
				</button>

				{/* Logo */}
				{!isMinimized && (
					<div className="flex items-center gap-2 font-semibold text-xl px-4 py-6">
						<div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
							<Image src="/logo.svg" alt="Logo" width={40} height={40} />
						</div>
						Sponge Analyzer
					</div>
				)}

				{/* New Dataset Modal */}
				<div className="">{!isMinimized && <NewDatasetModal />}</div>

				{/* Navigation */}
				<nav className="space-y-2 mt-4 p-2">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
								pathname === item.href
									? "bg-gray-200 font-medium"
									: "hover:bg-gray-100",
							)}
						>
							<item.icon className="h-4 w-4" />
							{!isMinimized && item.label}
						</Link>
					))}
				</nav>
			</aside>

			{/* Backdrop for Sidebar on Mobile */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}
		</>
	);
}
