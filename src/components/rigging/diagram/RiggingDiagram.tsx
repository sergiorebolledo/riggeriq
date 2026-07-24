"use client";

import { useEffect, useState } from "react";
import { Arrow, Circle, Layer, Line, Rect, Stage, Text } from "react-konva";
import type { SafetyStatus } from "@/lib/rigging-calculator";

const STATUS_COLORS: Record<SafetyStatus, string> = {
  safe: "#16a34a",
  warning: "#ca8a04",
  danger: "#dc2626",
};

const WIDTH = 320;
const HEIGHT = 260;

function scalePx(valueM: number, pxPerM: number, min: number, max: number): number {
  if (!Number.isFinite(valueM) || valueM <= 0) return min;
  return Math.min(Math.max(valueM * pxPerM, min), max);
}

function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return isDark;
}

interface RiggingDiagramProps {
  baseRadiusM: number;
  slingAngleDegrees: number;
  totalWeightKg: number;
  tensionPerLegKg: number;
  status: SafetyStatus;
}

/**
 * Vista lateral 2D del izaje: dos patas representativas del arreglo
 * simétrico (por simetría, todas las patas comparten el mismo ángulo y
 * tensión), con el vector de peso y los vectores de tensión.
 */
export function RiggingDiagram({
  baseRadiusM,
  slingAngleDegrees,
  totalWeightKg,
  tensionPerLegKg,
  status,
}: RiggingDiagramProps) {
  const isDark = useIsDarkMode();
  const color = STATUS_COLORS[status];
  const textColor = isDark ? "#e4e4e7" : "#3f3f46";
  const bgColor = isDark ? "#18181b" : "#fafafa";
  const loadFill = isDark ? "#1e3a8a" : "#93c5fd";
  const loadStroke = isDark ? "#93c5fd" : "#1e3a8a";
  const hookColor = isDark ? "#d4d4d8" : "#3f3f46";

  const rPx = scalePx(baseRadiusM, 35, 30, 110);
  const angleRad = (slingAngleDegrees * Math.PI) / 180;
  const hPx = Math.min(Math.max(rPx * Math.tan(angleRad), 50), 170);

  const centerX = WIDTH / 2;
  const hookY = 16;
  const loadY = hookY + hPx;
  const loadHeight = 22;

  const hook = { x: centerX, y: hookY };
  const leftAnchor = { x: centerX - rPx, y: loadY };
  const rightAnchor = { x: centerX + rPx, y: loadY };

  return (
    <Stage width={WIDTH} height={HEIGHT}>
      <Layer>
        <Rect x={0} y={0} width={WIDTH} height={HEIGHT} fill={bgColor} />

        {/* Patas de eslinga */}
        <Line points={[hook.x, hook.y, leftAnchor.x, leftAnchor.y]} stroke={color} strokeWidth={3} />
        <Line
          points={[hook.x, hook.y, rightAnchor.x, rightAnchor.y]}
          stroke={color}
          strokeWidth={3}
        />

        {/* Gancho */}
        <Circle x={hook.x} y={hook.y} radius={5} fill={hookColor} />

        {/* Carga */}
        <Rect
          x={centerX - rPx}
          y={loadY}
          width={rPx * 2}
          height={loadHeight}
          fill={loadFill}
          stroke={loadStroke}
          strokeWidth={1.5}
          cornerRadius={3}
        />

        {/* Vector de peso */}
        <Arrow
          points={[centerX, loadY + loadHeight, centerX, loadY + loadHeight + 36]}
          stroke={textColor}
          fill={textColor}
          strokeWidth={2}
          pointerLength={7}
          pointerWidth={7}
        />
        <Text
          x={centerX + 8}
          y={loadY + loadHeight + 14}
          text={`W = ${Math.round(totalWeightKg)} kg`}
          fontSize={11}
          fill={textColor}
        />

        {/* Vectores de tensión (desde el anclaje hacia el gancho) */}
        <Arrow
          points={[
            leftAnchor.x,
            leftAnchor.y,
            leftAnchor.x + (hook.x - leftAnchor.x) * 0.42,
            leftAnchor.y + (hook.y - leftAnchor.y) * 0.42,
          ]}
          stroke={color}
          fill={color}
          strokeWidth={2}
          pointerLength={6}
          pointerWidth={6}
        />
        <Arrow
          points={[
            rightAnchor.x,
            rightAnchor.y,
            rightAnchor.x + (hook.x - rightAnchor.x) * 0.42,
            rightAnchor.y + (hook.y - rightAnchor.y) * 0.42,
          ]}
          stroke={color}
          fill={color}
          strokeWidth={2}
          pointerLength={6}
          pointerWidth={6}
        />
        <Text
          x={Math.max(leftAnchor.x - 78, 4)}
          y={(leftAnchor.y + hook.y) / 2}
          text={`T = ${Math.round(tensionPerLegKg)} kg`}
          fontSize={10}
          fill={color}
        />

        {/* Ángulo */}
        <Text
          x={leftAnchor.x - 14}
          y={leftAnchor.y - 20}
          text={`θ = ${slingAngleDegrees.toFixed(1)}°`}
          fontSize={12}
          fontStyle="bold"
          fill={textColor}
        />
      </Layer>
    </Stage>
  );
}
