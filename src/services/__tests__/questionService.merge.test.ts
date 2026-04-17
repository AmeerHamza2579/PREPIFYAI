import { mergeRetrievalSources, type RetrievalSourceItem } from '../questionService';

describe('mergeRetrievalSources', () => {
  it('dedupes identical chunk preview keys across lists', () => {
    const a: RetrievalSourceItem[] = [{ chunk_index: 1, preview: 'shared snippet', topic: 'A' }];
    const b: RetrievalSourceItem[] = [{ chunk_index: 1, preview: 'shared snippet', topic: 'B' }];
    const c: RetrievalSourceItem[] = [{ chunk_index: 2, preview: 'other', topic: 'C' }];
    const out = mergeRetrievalSources(a, b, c);
    expect(out).toHaveLength(2);
    expect(out.map((x) => x.chunk_index).sort()).toEqual([1, 2]);
  });
});
