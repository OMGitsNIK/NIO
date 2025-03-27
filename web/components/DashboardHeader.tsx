"use client"

import { useEffect, useState } from "react"
import { Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react";

export function DashboardHeader() {
    const session = useSession();
    const [date, setDate] = useState(new Date())

    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: '2-digit'
    })
	useEffect(()=>{
setDate(new Date())
	},[])

    return (
					<header className="border-b bg-background">
						<div className="flex items-center justify-between p-4 gap-8">
							<div className="flex items-center gap-6 flex-1">
								<div className="md:block ml-12 relative flex-1 md:w-full max-w-md">
									<Input
										type="search"
										placeholder="Search datasets..."
										className="pl-4 pr-10 text-black"
									/>
									<Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								</div>
								{/* <Button variant="outline" size="icon">
                        <Grid className="h-4 w-4 text-black" />
                    </Button> */}
							</div>
							<div className="flex items-center gap-4 text-black">
								<span className=" hidden md:block text-sm text-muted-foreground ">
									{formattedDate}
								</span>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="relative h-8 w-8 rounded-full"
										>
											<Avatar>
												<AvatarImage
													src="https://github.com/shadcn.png"
													alt="@shadcn"
												/>
												<AvatarFallback>{session.data?.user.name?.split(' ').map(n => n[0]).join('') }</AvatarFallback>
											</Avatar>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-56" align="end" forceMount>
										<DropdownMenuLabel className="font-normal">
											<div className="flex flex-col space-y-1">
												<p className="text-sm font-medium leading-none">
													{session.data?.user.name}
												</p>
												<p className="text-xs leading-none text-muted-foreground">
													{session.data?.user.email}
												</p>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem>Profile</DropdownMenuItem>
										<DropdownMenuItem>Settings</DropdownMenuItem>
										<DropdownMenuItem onClick={() => signOut()}>
											Log out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</header>
				);
}