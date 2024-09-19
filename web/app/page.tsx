import { SearchBox } from "@/components/searchBox";


export default function Page() {
	return (
    <main className="p-8">
      <div className="flex gap-8 flex-col items-center justify-center  pt-16">
        <h1 className="text-5xl whitespace-nowrap font-black italic font-serif">
          Sponge Explorer
        </h1>
        <SearchBox />
      </div>
    </main>
  );
}