import { useRef } from "react";
import { ChevronDown, Pin, PinOff } from "lucide-react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TABS_BY_ID } from "./tabs-data";
import type { TabDefinition } from "./types";
import { useClickOutside } from "./use-click-outside";

type Props = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  overflowIds: string[];
  pinnedIds: string[];
  activeId: string;
  onNavigate: (href: string) => void;
  onTogglePin: (id: string) => void;
};

export function MoreMenu({
  open,
  onToggle,
  onClose,
  overflowIds,
  pinnedIds,
  activeId,
  onNavigate,
  onTogglePin,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useClickOutside([wrapperRef], onClose);

  const itemIds = [...overflowIds, ...pinnedIds.filter((id) => !overflowIds.includes(id))];
  const pinnedSet = new Set(pinnedIds);

  if (itemIds.length === 0) return null;

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="More tabs"
        title="More tabs"
        onClick={onToggle}
        className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
          open
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-100"
        }`}
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {itemIds.map((id) => {
              const tab = TABS_BY_ID.get(id);
              if (!tab) return null;

              return (
                <MoreMenuItem
                  key={id}
                  id={id}
                  tab={tab}
                  active={id === activeId}
                  pinned={pinnedSet.has(id)}
                  onNavigate={() => {
                    onNavigate(tab.href);
                    onClose();
                  }}
                  onTogglePin={() => onTogglePin(id)}
                />
              );
            })}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

type ItemProps = {
  id: string;
  tab: TabDefinition;
  active: boolean;
  pinned: boolean;
  onNavigate: () => void;
  onTogglePin: () => void;
};

function MoreMenuItem({ id, tab, active, pinned, onNavigate, onTogglePin }: ItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const Icon = tab.icon;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center justify-between gap-2 px-2 py-1.5 text-sm hover:bg-gray-50 ${
        active ? "text-blue-600" : "text-gray-700"
      } ${isDragging ? "z-10 opacity-70" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{tab.label}</span>
      </button>

      <button
        type="button"
        aria-label={pinned ? `Unpin ${tab.label}` : `Pin ${tab.label}`}
        onClick={onTogglePin}
        className={`shrink-0 rounded p-0.5 hover:bg-gray-200 ${
          pinned ? "text-blue-500 hover:text-blue-600" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
