// Code 128 bar/space widths, indexed by symbol value (0-106).
const PATTERNS =
  "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112".split(
    " "
  );

function encode(value: string) {
  const codes: number[] = [];
  if (/^\d+$/.test(value) && value.length % 2 === 0) {
    codes.push(105); // Start C: two digits per symbol
    for (let i = 0; i < value.length; i += 2) codes.push(Number(value.slice(i, i + 2)));
  } else {
    codes.push(104); // Start B: one character per symbol
    for (const char of value) codes.push(char.charCodeAt(0) - 32);
  }
  const checksum = codes.reduce((sum, code, i) => sum + code * Math.max(i, 1), 0) % 103;
  return [...codes, checksum, 106].map((code) => PATTERNS[code]).join("");
}

export function Barcode({ value, className }: { value: string; className?: string }) {
  const bars: { x: number; width: number }[] = [];
  let x = 0;
  for (const [i, digit] of [...encode(value)].entries()) {
    const width = Number(digit);
    if (i % 2 === 0) bars.push({ x, width });
    x += width;
  }

  return (
    <svg
      viewBox={`0 0 ${x} 1`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y={0} width={bar.width} height={1} />
      ))}
    </svg>
  );
}
