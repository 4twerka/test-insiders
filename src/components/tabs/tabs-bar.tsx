"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { TABS, TABS_BY_ID } from "./tabs-data";
import { getServerTabsSnapshot, getTabsSnapshot, setTabsState, subscribeTabsState } from "./storage";
import { useTabOverflow } from "./use-tab-overflow";
import { TabItem } from "./tab-item";
import { MoreMenu } from "./more-menu";

export function TabsBar() {
  const router = useRouter();
  const pathname = usePathname();

  const state = useSyncExternalStore(subscribeTabsState, getTabsSnapshot, getServerTabsSnapshot);
  const [moreOpen, setMoreOpen] = useState(false);
  const [closed, setClosed] = useState<string[]>([]);

  const pinnedSet = useMemo(() => new Set(state.pinned), [state.pinned]);
  const activeId = useMemo(
    () => TABS.find((tab) => tab.href === pathname)?.id ?? "",
    [pathname],
  );

  const [lastActiveId, setLastActiveId] = useState(activeId);
  if (activeId !== lastActiveId) {
    setLastActiveId(activeId);
    if (activeId && closed.includes(activeId)) {
      setClosed(closed.filter((id) => id !== activeId));
    }
  }

  const closedSet = useMemo(() => new Set(closed), [closed]);
  const openOrder = useMemo(
    () => state.order.filter((id) => !closedSet.has(id)),
    [state.order, closedSet],
  );

  const { containerRef, registerMeasureRef, visibleIds, overflowIds } = useTabOverflow({
    order: openOrder,
    pinned: pinnedSet,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = state.order.indexOf(String(active.id));
    const newIndex = state.order.indexOf(String(over.id));
    setTabsState({ ...state, order: arrayMove(state.order, oldIndex, newIndex) });
  }

  function handleTogglePin(id: string) {
    if (state.pinned.includes(id)) {
      setTabsState({ ...state, pinned: state.pinned.filter((pinnedId) => pinnedId !== id) });
      return;
    }

    const withoutId = state.order.filter((tabId) => tabId !== id);
    const lastPinnedIndex = withoutId.reduce(
      (lastIndex, tabId, index) => (state.pinned.includes(tabId) ? index : lastIndex),
      -1,
    );
    const order = [
      ...withoutId.slice(0, lastPinnedIndex + 1),
      id,
      ...withoutId.slice(lastPinnedIndex + 1),
    ];

    setTabsState({ ...state, order, pinned: [...state.pinned, id] });
  }

  function handleNavigate(href: string) {
    router.push(href);
  }

  function handleCloseTab(id: string) {
    if (pinnedSet.has(id) || closedSet.has(id)) return;

    if (id === activeId) {
      const closedIndex = state.order.indexOf(id);
      const isOpen = (tabId: string) => tabId !== id && !closedSet.has(tabId);
      let nextId: string | undefined;
      for (let i = closedIndex + 1; i < state.order.length; i++) {
        if (isOpen(state.order[i])) {
          nextId = state.order[i];
          break;
        }
      }
      if (!nextId) {
        for (let i = closedIndex - 1; i >= 0; i--) {
          if (isOpen(state.order[i])) {
            nextId = state.order[i];
            break;
          }
        }
      }
      router.push(nextId ? (TABS_BY_ID.get(nextId)?.href ?? "/") : "/");
    }

    setClosed((prev) => [...prev, id]);
  }

  return (
    <nav className="border-b border-gray-200 bg-white px-2">
      <div className="flex items-center gap-1 py-1">
        <DndContext
          id="tabs-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div ref={containerRef} className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
            <SortableContext items={visibleIds} strategy={horizontalListSortingStrategy}>
              {visibleIds.map((id) => {
                const tab = TABS_BY_ID.get(id);
                if (!tab) return null;
                return (
                  <TabItem
                    key={id}
                    tab={tab}
                    active={id === activeId}
                    pinned={pinnedSet.has(id)}
                    onNavigate={handleNavigate}
                    onTogglePin={handleTogglePin}
                    onCloseTab={handleCloseTab}
                  />
                );
              })}
            </SortableContext>
          </div>

          <MoreMenu
            open={moreOpen}
            onToggle={() => setMoreOpen((open) => !open)}
            onClose={() => setMoreOpen(false)}
            overflowIds={overflowIds}
            pinnedIds={state.pinned}
            activeId={activeId}
            onNavigate={handleNavigate}
            onTogglePin={handleTogglePin}
          />
        </DndContext>
      </div>

      <div className="invisible fixed left-[-9999px] top-[-9999px] flex gap-1" aria-hidden>
        {TABS.filter((tab) => !closedSet.has(tab.id)).map((tab) => {
          const Icon = tab.icon;
          const pinned = pinnedSet.has(tab.id);
          return (
            <div key={tab.id} ref={registerMeasureRef(tab.id)} className="flex shrink-0 items-stretch text-sm">
              <div
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md border-b-2 border-transparent py-2.5 pl-5 ${
                  pinned ? "pr-5" : "pr-1"
                }`}
              >
                {pinned && <span className="h-3 w-3" />}
                <Icon className="h-4 w-4" />
                {tab.label}
              </div>
              {!pinned && (
                <div className="flex items-center border-b-2 border-transparent pl-1 pr-4">
                  <span className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
