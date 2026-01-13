import { Item } from '../../types/items.type';

export default function roundItemsValues(item: any) {
  const shouldRoundFields = [
    'videoBegin',
    'videoEnd',
    'enterBegin',
    'enterEnd',
    'exitBegin',
    'exitEnd',
    'x',
    'y',
  ] as const;

  item.width = Math.ceil(item.width);
  item.height = Math.ceil(item.height);
  shouldRoundFields.forEach((field) => {
    if (item[field]) item[field] = Number((item[field] as number).toFixed(2));
  });
}
