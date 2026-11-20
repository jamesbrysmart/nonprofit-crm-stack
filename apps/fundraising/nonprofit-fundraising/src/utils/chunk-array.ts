export const chunkArray = <TItem,>(items: TItem[], size: number): TItem[][] => {
  if (size <= 0) {
    throw new Error('Chunk size must be greater than zero');
  }

  const chunks: TItem[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};
