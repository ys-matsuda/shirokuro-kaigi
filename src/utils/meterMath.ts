export type MeterGeometry = {
  centerX: number;
  centerY: number;
  radius: number;
  startAngle: number;
  endAngle: number;
};

export type MeterPoint = {
  x: number;
  y: number;
};

export function clampValue(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function roundMeterValue(value: number) {
  return Math.round(clampValue(value));
}

export function valueToAngle(value: number, geometry: MeterGeometry) {
  const progress = clampValue(value) / 100;
  return geometry.startAngle + (geometry.endAngle - geometry.startAngle) * progress;
}

export function pointOnMeter(value: number, geometry: MeterGeometry): MeterPoint {
  const angle = (valueToAngle(value, geometry) * Math.PI) / 180;

  return {
    x: geometry.centerX + geometry.radius * Math.cos(angle),
    y: geometry.centerY + geometry.radius * Math.sin(angle),
  };
}

export function arcPolylinePoints(
  toValue: number,
  geometry: MeterGeometry,
  segments = 96,
) {
  const safeValue = clampValue(toValue);
  const steps = Math.max(1, Math.round((segments * safeValue) / 100));
  const points: string[] = [];

  for (let index = 0; index <= steps; index += 1) {
    const value = safeValue === 0 ? 0 : (safeValue * index) / steps;
    const point = pointOnMeter(value, geometry);
    points.push(`${point.x.toFixed(2)},${point.y.toFixed(2)}`);
  }

  return points.join(" ");
}

export function bucketValue(value: number, step = 10) {
  return clampValue(Math.round(value / step) * step);
}
