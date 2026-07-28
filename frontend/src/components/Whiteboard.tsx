"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as Y from "yjs";
import { getStroke } from "perfect-freehand";
import { Trash2, PenTool, Eraser } from "lucide-react";
import { useTheme } from "next-themes";

type Point = [number, number, number];


interface WhiteboardProps {
  yDoc: Y.Doc | null;
  onClose: () => void;
}

const COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#2dd4bf", "#60a5fa", "#c084fc", "#f472b6", "#e4e4e7"];
const SIZES = [4, 8, 12, 16];

export default function Whiteboard({ yDoc }: WhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [color, setColor] = useState(COLORS[5]);
  const [size, setSize] = useState(SIZES[1]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const { resolvedTheme } = useTheme();
  
  // Background color changes based on theme, so the eraser must match it
  const bgColor = resolvedTheme === "light" ? "#ffffff" : "#09090b";

  // Local state for the stroke currently being drawn
  const currentStrokeRef = useRef<{ id: string; points: Point[] } | null>(null);

  // Resize canvas to fill container
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas) {
        const rect = container.getBoundingClientRect();
        // Handle high DPI displays for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        redraw();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSvgPathFromStroke = (stroke: number[][]) => {
    if (!stroke.length) return "";
    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length];
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        return acc;
      },
      ["M", ...stroke[0], "Q"]
    );
    d.push("Z");
    return d.join(" ");
  };

  const redraw = useCallback(() => {
    if (!canvasRef.current || !yDoc) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    const yStrokes = yDoc.getMap<Y.Map<any>>("whiteboard-strokes");
    
    // Helper to draw a single stroke
    const drawStroke = (points: Point[], strokeColor: string, strokeSize: number) => {
      if (points.length === 0) return;
      const strokeOutline = getStroke(points, {
        size: strokeSize,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      });
      const pathData = getSvgPathFromStroke(strokeOutline);
      const path = new Path2D(pathData);
      ctx.fillStyle = strokeColor;
      ctx.fill(path);
    };

    // Draw confirmed remote/local strokes
    yStrokes.forEach((yStrokeMap) => {
      const points = yStrokeMap.get("points") as Point[] || [];
      const c = yStrokeMap.get("color") as string;
      const s = yStrokeMap.get("size") as number;
      drawStroke(points, c, s);
    });

    // Draw current active stroke
    if (currentStrokeRef.current) {
      drawStroke(currentStrokeRef.current.points, tool === "eraser" ? bgColor : color, tool === "eraser" ? size * 4 : size);
    }
  }, [yDoc, color, size, tool, bgColor]);

  // Subscribe to Yjs changes
  useEffect(() => {
    if (!yDoc) return;
    const yStrokes = yDoc.getMap<Y.Map<any>>("whiteboard-strokes");
    
    const handleChange = () => {
      redraw();
    };
    
    yStrokes.observeDeep(handleChange);
    return () => {
      yStrokes.unobserveDeep(handleChange);
    };
  }, [yDoc, redraw]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure !== 0 ? e.pressure : 0.5;

    currentStrokeRef.current = {
      id: Date.now().toString() + Math.random().toString(),
      points: [[x, y, pressure]],
    };
    redraw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentStrokeRef.current || e.buttons !== 1) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure !== 0 ? e.pressure : 0.5;

    currentStrokeRef.current.points.push([x, y, pressure]);
    redraw(); // Fast local redraw
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (!currentStrokeRef.current || !yDoc) return;
    const { id, points } = currentStrokeRef.current;
    
    // Commit to Yjs
    const yStrokes = yDoc.getMap<Y.Map<any>>("whiteboard-strokes");
    
    yDoc.transact(() => {
      if (tool === "eraser") {
        // Eraser logic: Find and delete intersecting strokes
        // For simplicity in a collaborative environment without complex geometric intersection,
        // drawing with the background color is a cheap "eraser" hack.
        // A better eraser deletes actual Yjs objects, but requires polygon intersection.
        const yStrokeMap = new Y.Map();
        yStrokeMap.set("id", id);
        yStrokeMap.set("points", points);
        yStrokeMap.set("color", bgColor); // Erase by drawing with background color
        yStrokeMap.set("size", size * 4); // Erasers are usually thicker
        yStrokes.set(id, yStrokeMap);
      } else {
        const yStrokeMap = new Y.Map();
        yStrokeMap.set("id", id);
        yStrokeMap.set("points", points);
        yStrokeMap.set("color", color);
        yStrokeMap.set("size", size);
        yStrokes.set(id, yStrokeMap);
      }
    });

    currentStrokeRef.current = null;
    redraw();
  };

  const clearBoard = () => {
    if (!yDoc) return;
    const yStrokes = yDoc.getMap<Y.Map<any>>("whiteboard-strokes");
    yDoc.transact(() => {
      const keys = Array.from(yStrokes.keys());
      keys.forEach((k) => yStrokes.delete(k));
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 relative overflow-hidden" ref={containerRef}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerOut={handlePointerUp}
        className="touch-none w-full h-full cursor-crosshair"
      />

      {/* Floating Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-xl shadow-2xl">
        
        {/* Tools */}
        <div className="flex bg-zinc-800/50 rounded-lg p-1 gap-1 border border-zinc-700/50">
          <button
            onClick={() => setTool("pen")}
            className={`p-2 rounded-md transition-all ${
              tool === "pen" ? "bg-primary text-zinc-950 shadow-sm" : "text-white/60 hover:text-white/90 hover:bg-zinc-700/50"
            }`}
            title="Pen"
          >
            <PenTool className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-md transition-all ${
              tool === "eraser" ? "bg-zinc-200 text-zinc-950 shadow-sm" : "text-white/60 hover:text-white/90 hover:bg-zinc-700/50"
            }`}
            title="Eraser (Draws over with background color)"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-700/50 mx-1" />

        {/* Colors */}
        {tool === "pen" && (
          <div className="flex gap-1.5 items-center px-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                  color === c ? "border-white shadow-sm scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        <div className="w-px h-6 bg-zinc-700/50 mx-1" />

        {/* Sizes */}
        {tool === "pen" && (
          <div className="flex gap-1.5 items-center px-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
                  size === s ? "bg-zinc-700 text-zinc-50" : "text-white/50 hover:text-white/80"
                }`}
              >
                <div className="bg-current rounded-full" style={{ width: s, height: s }} />
              </button>
            ))}
          </div>
        )}

        <div className="w-px h-6 bg-zinc-700/50 mx-1" />

        {/* Actions */}
        <button
          onClick={clearBoard}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
          title="Clear Board"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
