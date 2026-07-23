import type { ShapeType } from "@/lib/weight-estimator";

const VIEW_W = 260;
const VIEW_H = 200;

/** Escala una dimensión real (m) a píxeles, con piso y techo para que el diagrama nunca se vea vacío o desbordado. */
function scalePx(valueM: number, pxPerM = 32, min = 22, max = 150): number {
  if (!Number.isFinite(valueM) || valueM <= 0) return min;
  return Math.min(Math.max(valueM * pxPerM, min), max);
}

const labelStyle = "fill-zinc-600 dark:fill-zinc-400 text-[10px]";
const dimLineStyle = "stroke-zinc-400 dark:stroke-zinc-600";

interface DimLineHProps {
  x1: number;
  x2: number;
  y: number;
  label: string;
}

function DimLineH({ x1, x2, y, label }: DimLineHProps) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} className={dimLineStyle} strokeWidth={1} />
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} className={dimLineStyle} strokeWidth={1} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} className={dimLineStyle} strokeWidth={1} />
      <text x={(x1 + x2) / 2} y={y + 14} textAnchor="middle" className={labelStyle}>
        {label}
      </text>
    </g>
  );
}

interface DimLineVProps {
  y1: number;
  y2: number;
  x: number;
  label: string;
}

function DimLineV({ y1, y2, x, label }: DimLineVProps) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} className={dimLineStyle} strokeWidth={1} />
      <line x1={x - 4} y1={y1} x2={x + 4} y2={y1} className={dimLineStyle} strokeWidth={1} />
      <line x1={x - 4} y1={y2} x2={x + 4} y2={y2} className={dimLineStyle} strokeWidth={1} />
      <text
        x={x - 8}
        y={(y1 + y2) / 2}
        textAnchor="middle"
        className={labelStyle}
        transform={`rotate(-90 ${x - 8} ${(y1 + y2) / 2})`}
      >
        {label}
      </text>
    </g>
  );
}

function IsometricBox({
  widthM,
  depthM,
  heightM,
  hollowWallM,
  filled = true,
}: {
  widthM: number;
  depthM: number;
  heightM: number;
  hollowWallM?: number;
  filled?: boolean;
}) {
  const fw = scalePx(widthM);
  const fh = scalePx(heightM);
  const depthPx = scalePx(depthM, 20, 16, 70);
  const dx = depthPx * 0.87;
  const dy = -depthPx * 0.5;

  const px = 55;
  const py = VIEW_H - 45 - fh;

  const flTop = { x: px, y: py };
  const frTop = { x: px + fw, y: py };
  const frBottom = { x: px + fw, y: py + fh };
  const flBottom = { x: px, y: py + fh };
  const blTop = { x: flTop.x + dx, y: flTop.y + dy };
  const brTop = { x: frTop.x + dx, y: frTop.y + dy };
  const brBottom = { x: frBottom.x + dx, y: frBottom.y + dy };

  const topFace = `${flTop.x},${flTop.y} ${frTop.x},${frTop.y} ${brTop.x},${brTop.y} ${blTop.x},${blTop.y}`;
  const rightFace = `${frTop.x},${frTop.y} ${frBottom.x},${frBottom.y} ${brBottom.x},${brBottom.y} ${brTop.x},${brTop.y}`;
  const frontFace = `${flTop.x},${flTop.y} ${frTop.x},${frTop.y} ${frBottom.x},${frBottom.y} ${flBottom.x},${flBottom.y}`;

  const wallRatio =
    hollowWallM && hollowWallM > 0 ? Math.min(hollowWallM / Math.min(widthM, heightM), 0.4) : 0;

  return (
    <g>
      <polygon points={topFace} className="fill-blue-200 dark:fill-blue-900/50" />
      <polygon points={rightFace} className="fill-blue-300 dark:fill-blue-800/50" />
      <polygon
        points={frontFace}
        className={filled ? "fill-blue-100 dark:fill-blue-950/50" : "fill-none"}
        stroke="currentColor"
        strokeWidth={1.5}
        style={{ color: "currentColor" }}
      />
      <polygon
        points={topFace}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-zinc-500 dark:text-zinc-400"
      />
      <polygon
        points={rightFace}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-zinc-500 dark:text-zinc-400"
      />
      <polygon
        points={frontFace}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-zinc-700 dark:text-zinc-300"
      />
      {wallRatio > 0 && (
        <rect
          x={flTop.x + fw * wallRatio}
          y={flTop.y + fh * wallRatio}
          width={fw * (1 - 2 * wallRatio)}
          height={fh * (1 - 2 * wallRatio)}
          fill="none"
          strokeDasharray="3 2"
          className="stroke-zinc-500 dark:stroke-zinc-500"
          strokeWidth={1}
        />
      )}

      <DimLineH x1={flBottom.x} x2={frBottom.x} y={VIEW_H - 20} label="Largo" />
      <DimLineV y1={flTop.y} y2={flBottom.y} x={px - 18} label="Alto" />
      <text
        x={(brTop.x + frTop.x) / 2 + 6}
        y={(brTop.y + frTop.y) / 2 - 4}
        className={labelStyle}
      >
        Ancho
      </text>
    </g>
  );
}

function CylinderDiagram({
  diameterM,
  lengthM,
  wallThicknessM,
}: {
  diameterM: number;
  lengthM: number;
  wallThicknessM?: number;
}) {
  const rx = 14;
  const bodyH = scalePx(diameterM, 26, 30, 110);
  const bodyW = scalePx(lengthM, 26, 50, 170);
  const ry = bodyH / 2;

  const px = (VIEW_W - bodyW) / 2 - rx / 2;
  const py = VIEW_H / 2 - ry - 10;
  const cxLeft = px + rx;
  const cxRight = px + rx + bodyW;
  const cy = py + ry;

  const isHollow = wallThicknessM && wallThicknessM > 0;
  const innerRy = isHollow ? Math.max(ry - (wallThicknessM! / diameterM) * bodyH, 4) : 0;
  const innerRx = isHollow ? rx * (innerRy / ry) : 0;

  return (
    <g>
      <rect
        x={cxLeft}
        y={py}
        width={cxRight - cxLeft}
        height={bodyH}
        className="fill-blue-100 stroke-zinc-700 dark:fill-blue-950/50 dark:stroke-zinc-300"
        strokeWidth={1.5}
      />
      <ellipse
        cx={cxLeft}
        cy={cy}
        rx={rx}
        ry={ry}
        className="fill-blue-200 stroke-zinc-700 dark:fill-blue-900/50 dark:stroke-zinc-300"
        strokeWidth={1.5}
      />
      <ellipse
        cx={cxRight}
        cy={cy}
        rx={rx}
        ry={ry}
        className="fill-blue-100 stroke-zinc-700 dark:fill-blue-950/50 dark:stroke-zinc-300"
        strokeWidth={1.5}
      />
      {isHollow && (
        <ellipse
          cx={cxRight}
          cy={cy}
          rx={innerRx}
          ry={innerRy}
          fill="none"
          strokeDasharray="3 2"
          className="stroke-zinc-500"
          strokeWidth={1}
        />
      )}

      <DimLineH x1={cxLeft} x2={cxRight} y={py + bodyH + 22} label="Largo" />
      <DimLineV y1={cy - ry} y2={cy + ry} x={cxLeft - rx - 12} label="Diámetro" />
    </g>
  );
}

function IBeamDiagram({
  widthM,
  heightM,
  wallThicknessM,
}: {
  widthM: number;
  heightM: number;
  wallThicknessM: number;
}) {
  const w = scalePx(widthM, 40, 60, 140);
  const h = scalePx(heightM, 40, 70, 150);
  const flangeT = Math.max((wallThicknessM / heightM) * h, 6);
  const webT = Math.max((wallThicknessM / widthM) * w, 6);

  const px = (VIEW_W - w) / 2;
  const py = (VIEW_H - h) / 2 - 5;

  const path = `
    M ${px},${py}
    H ${px + w}
    V ${py + flangeT}
    H ${px + w / 2 + webT / 2}
    V ${py + h - flangeT}
    H ${px + w}
    V ${py + h}
    H ${px}
    V ${py + h - flangeT}
    H ${px + w / 2 - webT / 2}
    V ${py + flangeT}
    H ${px}
    Z
  `;

  return (
    <g>
      <path
        d={path}
        className="fill-blue-100 stroke-zinc-700 dark:fill-blue-950/50 dark:stroke-zinc-300"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <DimLineH x1={px} x2={px + w} y={py + h + 26} label="Ancho" />
      <DimLineV y1={py} y2={py + h} x={px - 18} label="Alto" />
      <text x={px + w / 2 + webT / 2 + 6} y={py + h / 2} className={labelStyle}>
        Grosor
      </text>
      <text x={VIEW_W / 2} y={VIEW_H - 8} textAnchor="middle" className={labelStyle}>
        (vista de sección — el largo se extiende hacia adentro/afuera de la página)
      </text>
    </g>
  );
}

interface GeometryDiagramProps {
  shape: ShapeType;
  dimensions: Record<string, number>;
}

export function GeometryDiagram({ shape, dimensions }: GeometryDiagramProps) {
  const get = (key: string, fallback = 1) =>
    Number.isFinite(dimensions[key]) && dimensions[key] > 0 ? dimensions[key] : fallback;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full max-w-xs text-zinc-700 dark:text-zinc-300"
    >
      {shape === "cylinder" && (
        <CylinderDiagram
          diameterM={get("diameterM")}
          lengthM={get("lengthM")}
          wallThicknessM={dimensions.wallThicknessM}
        />
      )}
      {shape === "plate" && (
        <IsometricBox widthM={get("lengthM")} depthM={get("widthM")} heightM={get("thicknessM", 0.2)} />
      )}
      {shape === "ibeam" && (
        <IBeamDiagram
          widthM={get("widthM")}
          heightM={get("heightM")}
          wallThicknessM={get("wallThicknessM", 0.05)}
        />
      )}
      {shape === "container" && (
        <IsometricBox
          widthM={get("lengthM")}
          depthM={get("widthM")}
          heightM={get("heightM")}
          hollowWallM={dimensions.wallThicknessM}
        />
      )}
      {shape === "block" && (
        <IsometricBox widthM={get("lengthM")} depthM={get("widthM")} heightM={get("heightM")} />
      )}
    </svg>
  );
}
