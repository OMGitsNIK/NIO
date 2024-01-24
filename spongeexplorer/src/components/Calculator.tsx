"use client";
import { useState } from "react";
import {
  MaterialSymbolsKeyboardArrowDownRounded,
  MaterialSymbolsChevronRightRounded,
  GravityUiChartAreaStackedNormalized,
  MdiEyeOutline,
  MdiEyeClosed,
  MaterialSymbolsCloseRounded,
  TeenyiconsDragHorizontalOutline,
} from "./icons";
import { Reorder, useDragControls } from "framer-motion";

export function Calculation({
  onClick,
  isActive,
  name,
  onDeleteCalculator,
  item,
}: {
  onClick: React.MouseEventHandler;
  onDeleteCalculator: React.MouseEventHandler;
  isActive: boolean;
  name: string;
  item: any;
}) {
  const controls = useDragControls();
  const [isOpen, setCalcOpen] = useState(false);
  const [calculatorState, setCalculatorActive] = useState(true);
  return (
    <Reorder.Item
      as="div"
      // className="my-1"
      //   animate={false}

      dragListener={false}
      dragControls={controls}
      key={item}
      value={item}
      className={`p-1 mt-1 bg-zinc-900 w-[22rem] border-[1px] border-white/10 ${
        isActive ? "border-blue-400/60" : ""
      } rounded-md  select-none`}
      onClick={onClick}
    >
      <div className="grid grid-flow-col items-center w-full  relative  ">
        <div
          className="hover:bg-slate-600/10  rounded-full p-1 transition justify-self-start"
          onClick={() => setCalcOpen(!isOpen)}
        >
          {isOpen ? (
            <MaterialSymbolsKeyboardArrowDownRounded />
          ) : (
            <MaterialSymbolsChevronRightRounded />
          )}
        </div>
        <div className="flex items-center justify-center">
          <span className="w-5 h-auto aspect-square items-center flex text-sm font-thin text-orange-400 justify-center ">
            <GravityUiChartAreaStackedNormalized />
            {item.id}
          </span>
          <input
            className="w-40 bg-zinc-950 p-0.5 px-1  rounded font-thin ml-2 text-sm "
            type="text"
            value={name}
            onChange={() => {}}
          />
        </div>
        <div className="flex items-center">
          <div
            onClick={() => setCalculatorActive(!calculatorState)}
            className="hover:bg-slate-600/10 rounded-full p-1 transition"
          >
            {calculatorState ? <MdiEyeOutline /> : <MdiEyeClosed />}
          </div>
          <div onClick={onDeleteCalculator} className="  rounded-full p-0.5">
            <MaterialSymbolsCloseRounded />
          </div>

          <TeenyiconsDragHorizontalOutline
            onPointerDown={(e) => controls.start(e)}
            className=" cursor-grab active:cursor-grabbing rounded-full p-0.5"
          />
        </div>
      </div>
      <div className={`${isOpen ? "h-32" : "h-0"} transition-none`}></div>
    </Reorder.Item>
  );
}
