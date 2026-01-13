import { Item, VideoItem } from '../../types/items.type';
import { checkIsVideo } from '../elements-types/checking';

function groupByStartingItem(startingItem: VideoItem, items: any[]) {
  const groupIndexes = [];

  let { transitionId: nextId } = startingItem;
  while (nextId && nextId !== 'none') {
    let nextItemIndex = items.findIndex((item) => {
      const itemId = 'id' in item ? item.id : null;
      return itemId === nextId;
    });

    // Break if item not found
    if (nextItemIndex === -1) {
      break;
    }

    const nextItem = items[nextItemIndex];
    if (!nextItem || !nextItem) {
      break;
    }

    nextId = 'transitionId' in nextItem ? nextItem.transitionId : null;
    groupIndexes.push({ id: nextId, index: nextItemIndex });
  }

  const group = [startingItem];
  groupIndexes.forEach(({ id, index }) => {
    if (index !== -1 && items[index]) {
      group.push(items[index]);
    }
  });

  return group;
}

export default function getItemsGroups(items: Item[]) {
  const groups: Item[][] = [];
  const visited = new Set<string>(); // ➊ IDs we have already grouped

  items.forEach((raw) => {
    const item = JSON.parse(JSON.stringify(raw));
    const id = 'id' in item ? (item.id as string) : undefined;

    /* 1️⃣  Skip items that are already inside a previously‑built group */
    if (id && visited.has(id)) return;

    /* 2️⃣  Non‑video items form a 1‑element group */
    if (!checkIsVideo(item)) {
      groups.push([item]);
      if (id) visited.add(id);
      return;
    }

    /* 3️⃣  Video: decide whether it starts a transition chain            */
    const { transitionId, transition } = item as VideoItem;

    const startsChain = transitionId && transitionId !== 'none' && transition;

    if (startsChain) {
      const group = groupByStartingItem(item as VideoItem, items);

      /* 4️⃣  Mark every element of the group as visited */
      group.forEach((g: any) => {
        const gId = 'id' in g ? (g.id as string) : undefined;
        if (gId) visited.add(gId);
      });

      groups.push(group);
    } else {
      groups.push([item]);
      if (id) visited.add(id);
    }
  });

  return groups; // only maximal groups remain
}
