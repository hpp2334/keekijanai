const MILL_ONE_MINUTE = 60 * 1000;
const MILL_ONE_HOUR = 60 * MILL_ONE_MINUTE;
const MILL_ONE_DAY = 24 * MILL_ONE_HOUR;
const MILL_ONE_WEEK = 7 * MILL_ONE_DAY;
const MILL_ONE_MONTH = 30 * MILL_ONE_DAY;
const MILL_ONE_YEAR = 365 * MILL_ONE_DAY;

/**
 * format
 **/

export function format(time: Date | number, format: string) {
  const ins = new Date(time);

  return format
    .replace(/yyyy/g, ins.getFullYear().toString())
    .replace(/MM/g, (ins.getMonth() + 1).toString().padStart(2, "0"))
    .replace(/dd/g, ins.getDate().toString().padStart(2, "0"))
    .replace(/HH/g, ins.getHours().toString().padStart(2, "0"))
    .replace(/mm/g, ins.getMinutes().toString().padStart(2, "0"))
    .replace(/ss/g, ins.getSeconds().toString().padStart(2, "0"));
}

/**
 * formatDistance
 **/

type DistanceStrategy = {
  condition: (ms: number) => boolean;
} & (
  | {
      text: string;
    }
  | {
      unitValue: (ms: number) => number;
      unitText: string;
      plural: string;
    }
);

const DistanceStrategies: Array<DistanceStrategy> = [
  {
    condition: (ms) => ms < MILL_ONE_MINUTE,
    text: "Just Now",
  },
  {
    condition: (ms) => ms < MILL_ONE_HOUR,
    unitValue: (ms) => Math.ceil(ms / MILL_ONE_MINUTE),
    unitText: "minute",
    plural: "s",
  },
  {
    condition: (ms) => ms < MILL_ONE_DAY,
    unitValue: (ms) => Math.ceil(ms / MILL_ONE_HOUR),
    unitText: "hour",
    plural: "s",
  },
  {
    condition: (ms) => ms < MILL_ONE_WEEK,
    unitValue: (ms) => Math.ceil(ms / MILL_ONE_DAY),
    unitText: "day",
    plural: "s",
  },
  {
    condition: (ms) => ms < MILL_ONE_MONTH,
    unitValue: (ms) => Math.ceil(ms / MILL_ONE_WEEK),
    unitText: "week",
    plural: "s",
  },
  {
    condition: (ms) => ms < MILL_ONE_YEAR,
    unitValue: (ms) => Math.ceil(ms / MILL_ONE_MONTH),
    unitText: "month",
    plural: "s",
  },
  {
    condition: (ms) => ms >= MILL_ONE_YEAR,
    unitValue: (ms) => Math.ceil(ms / MILL_ONE_YEAR),
    unitText: "year",
    plural: "s",
  },
];

export function formatDistance(base: Date | number, target: Date | number): string {
  const distance = new Date(target).getTime() - new Date(base).getTime();
  const absDistance = Math.abs(distance);

  for (const strategy of DistanceStrategies) {
    if (strategy.condition(absDistance)) {
      if ("text" in strategy) {
        return strategy.text;
      } else {
        const value = strategy.unitValue(absDistance);
        const unitText = strategy.unitText;
        const unitTextSuffix = value <= 1 ? "" : strategy.plural;
        const directionText = distance > 0 ? "ago" : "latter";
        const text = `${value} ${unitText}${unitTextSuffix} ${directionText}`;
        return text;
      }
    }
  }
  throw new Error(`formatDistance fail. Cannot find any strategy match case {base: ${base}, target:${target}}`);
}
