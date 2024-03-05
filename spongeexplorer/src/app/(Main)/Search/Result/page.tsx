'use client'
import { SearchBar } from "@/components/Search";
import Link from "next/link";
import Image from 'next/image'
import { useEffect, useState } from "react";
import { config } from "@/config";
export default function Page() {
const [results,setResults]=useState<string[]>([''])

const [query,setQuery]=useState('')
	useEffect(()=>{
		console.log(results)
		fetch(`http://127.0.0.1:5000/Search?q=${decodeURI(query)}`, {
			method: "get",
			redirect: "follow",
		  })
			.then((response) => response.json())
			.then((result) => {
				console.log(result)
				setResults(result);
			})
			.catch((error) => console.log("error", error));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[query])
	useEffect(()=>{console.log(results)},[results])
	return (
		<div className="h-full min-h-screen w-full bg-neutral-900 relative">
			<section className="  z-50 h-full w-full px-8 sticky top-0 bg-neutral-900  border-b border-white/10 py-4 ">
				<div className="w-2/3 ">
					<SearchBar onChange={(e)=>setQuery((e.target as HTMLInputElement).value)} className="h-12 " />
					
					</div>
			</section>
			{/* <div className="  sticky right-0 top-20">
<div className="absolute  w-96 bg-neutral-900 border-l border-t border-white/5 h-[calc(100vh-5rem)] right-0 p-4">

			<h1>Name Of Sponge</h1>

</div>
			
			</div> */}
			<section className="p-8 w-2/3">
			<AllResults data={results}/>
				
			
			</section>
			
		</div>
	);
}


function AllResults({data}:{data:string[]}){
if(data.length<=1){
	return<></>
}
return<>	{
	
// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
(data.map((i:any,idx:number)=><Result key={idx} title={i.value.Name} href={`/Search/Result/${i.value.Name}`} searchTerm={i.ClosestAttribute}  src={`${i.value.Image}`} description={i.value.Description} />))

}</>

}
function Result({ title, href ,searchTerm,src,description}: { title: string; href: string; searchTerm:string;src:string;description:string }) {
	return (
		<div className="border-b  border-white/5 py-4 min-h-40 flex gap-4 relative">
			<Image className="shadow-xl rounded relative z-10  h-32 w-auto aspect-square  object-cover" src={`${config.SERVER_URL}/public/${src}`} alt="" height={500} width={500}/>
			<Image className="absolute opacity-10  blur-3xl rounded  h-32 w-auto aspect-square  object-cover" src={`${config.SERVER_URL}/public/${src}`} alt="" height={500} width={500}/>
			<div >
			<Link className="  text-blue-400 hover:underline  text-lg" href={href}>
				{title}
			</Link>
			<p className='text-sm  italic font-thin text-yellow-200 '>
				{searchTerm}
			</p>	
			<p>{description}</p>
			
			</div>
			
		</div>
	);
}
