type RangeMap = {
  value: string | number;
  min: number;
  max: number;
  inputMin?: number;
  inputMax?: number;
};

export default function calcRangeMap(
  params: RangeMap,
  numType: 'HEX' | 'DECIMAL' = 'DECIMAL'
) {
  const { value, max, min, inputMin = 0, inputMax = 100 } = params;

  const decimalValue =
    numType === 'HEX' ? parseInt(value.toString(), 16) : value;

  const result = +(
    min +
    ((+decimalValue - inputMin) / (inputMax - inputMin)) * (max - min)
  ).toFixed(4);
  return result;
}
