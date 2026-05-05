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

export function arcPathBetweenValues(
  fromValue: number,
  toValue: number,
  geometry: MeterGeometry,
) {
  const startValue = clampValue(fromValue);
  const endValue = clampValue(toValue);
  const startPoint = pointOnMeter(startValue, geometry);
  const endPoint = pointOnMeter(endValue, geometry);
  const angleDelta = Math.abs(valueToAngle(endValue, geometry) - valueToAngle(startValue, geometry));
  const largeArcFlag = angleDelta > 180 ? 1 : 0;

  return [
    `M ${startPoint.x.toFixed(2)} ${startPoint.y.toFixed(2)}`,
    `A ${geometry.radius} ${geometry.radius} 0 ${largeArcFlag} 1 ${endPoint.x.toFixed(2)} ${endPoint.y.toFixed(2)}`,
  ].join(" ");
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
