import { useState } from "react";
import { MaterialSymbolsKeyboardArrowDownRounded, MaterialSymbolsChevronRightRounded, GravityUiChartAreaStackedNormalized, MdiEyeOutline, MdiEyeClosed, MaterialSymbolsCloseRounded, TeenyiconsDragHorizontalOutline, MaterialSymbolsAdd } from "./icons";


export function Calculation(props: any) {
    const [isOpen, setCalcOpen] = useState(false);
    const [calculatorState, setCalculatorActive] = useState(true);
    return (
      <div
        className={`p-1 bg-zinc-900 w-[22rem] border-[1px] transition ${props.isActive ? "border-blue-200/30" : "border-white/10 "
          } rounded-md  select-none `}
        onClick={props.onClick}
      >
        <div className="grid grid-flow-col items-center w-full  relative  ">
          <button
            className="hover:bg-slate-600/10  rounded-full p-1 transition justify-self-start"
            onClick={() => setCalcOpen(!isOpen)}
          >
            {isOpen ? (
              <MaterialSymbolsKeyboardArrowDownRounded />
            ) : (
              <MaterialSymbolsChevronRightRounded />
            )}
          </button>
          <div className="flex items-center justify-center">
            <span className="w-5 h-auto aspect-square items-center flex text-sm font-thin text-orange-400 justify-center ">
              <GravityUiChartAreaStackedNormalized />
            </span>
            <input
              className="w-40 bg-zinc-950 p-0.5 px-1  rounded font-thin ml-2 text-sm "
              type="text"
              value={props.name}
            />
          </div>
          <div className="flex items-center j justify-self-end">
            <button
              onClick={() => setCalculatorActive(!calculatorState)}
              className="hover:bg-slate-600/10 rounded-full p-1 transition"
            >
              {calculatorState ? <MdiEyeOutline /> : <MdiEyeClosed />}
            </button>
            <button className="hover:bg-slate-600/10 rounded-full p-1 transition" onClick={props.onDelete}
             >
              <MaterialSymbolsCloseRounded />
            </button>
  
            <TeenyiconsDragHorizontalOutline className=" cursor-grab active:cursor-grabbing rounded-full p-0.5" />
          </div>
        </div>
        <div className={`${isOpen ? "h-32" : "h-0"}`}></div>
      </div>
    );
  }
  export function AddCalculatorDropdown(props:any) {
    return <div></div>;
  }
  export function AddCalculator(props:any) {
    return (
      <div onClick={props.onAdd} className="p-1 w-[22rem] h-8 mb-3 bg-zinc-900 border-[1px] border-white/10 rounded-md  select-none flex items-center">
        <MaterialSymbolsAdd />
        <h1 className="text-sm">Add Calculator</h1>
      </div>
    );
  }