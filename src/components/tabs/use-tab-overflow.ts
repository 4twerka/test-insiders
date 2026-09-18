import { useLayoutEffect, useMemo, useRef, useState } from "react";

const TAB_GAP = 4;

type Options = {
  order: string[];
  pinned: Set<string>;
};

export function useTabOverflow({ order, pinned }: Options) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRefs = useRef(new Map<string, HTMLElement>());
  const [widths, setWidths] = useState<Map<string, number>>(new Map());
  const [containerWidth, setContainerWidth] = useState(0);

  const registerMeasureRef = (id: string) => (node: HTMLElement | null) => {
    if (node) measureRefs.current.set(id, node);
    else measureRefs.current.delete(id);
  };

  useLayoutEffect(() => {
    const nodeToId = new Map<Element, string>();
    for (const [id, node] of measureRefs.current) nodeToId.set(node, id);

    const observer = new ResizeObserver((entries) => {
      setWidths((prev) => {
        const next = new Map(prev);
        for (const entry of entries) {
          const id = nodeToId.get(entry.target);
          if (id) next.set(id, (entry.target as HTMLElement).offsetWidth);
        }
        return next;
      });
    });

    for (const node of nodeToId.keys()) observer.observe(node);
    return () => observer.disconnect();
  }, [order]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const { visibleIds, overflowIds } = useMemo(() => {
    if (widths.size < order.length || containerWidth === 0) {
      return { visibleIds: order, overflowIds: [] as string[] };
    }

    const totalWidth = order.reduce(
      (sum, id, index) => sum + (widths.get(id) ?? 0) + (index > 0 ? TAB_GAP : 0),
      0,
    );
    if (totalWidth <= containerWidth) {
      return { visibleIds: order, overflowIds: [] as string[] };
    }

    const available = containerWidth;
    const visible = new Set<string>();
    let running = 0;

    const fits = (id: string) => {
      const width = widths.get(id) ?? 0;
      return running + width + (visible.size > 0 ? TAB_GAP : 0) <= available;
    };
    const add = (id: string) => {
      running += (widths.get(id) ?? 0) + (visible.size > 0 ? TAB_GAP : 0);
      visible.add(id);
    };

    for (const id of order) if (pinned.has(id) && fits(id)) add(id);
    for (const id of order) {
      if (pinned.has(id)) continue;
      if (!fits(id)) break;
      add(id);
    }

    return {
      visibleIds: order.filter((id) => visible.has(id)),
      overflowIds: order.filter((id) => !visible.has(id)),
    };
  }, [order, pinned, widths, containerWidth]);

  return { containerRef, registerMeasureRef, visibleIds, overflowIds };
}
