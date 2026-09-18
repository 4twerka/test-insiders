import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pin, X } from "lucide-react";
import type { TabDefinition } from "./types";
import { TabContextMenu } from "./tab-context-menu";

type Props = {
  tab: TabDefinition;
  active: boolean;
  pinned: boolean;
  onNavigate: (href: string) => void;
  onTogglePin: (id: string) => void;
  onCloseTab: (id: string) => void;
};

export function TabItem({ tab, active, pinned, onNavigate, onTogglePin, onCloseTab }: Props) {
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; left: number } | null>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
  });

  const Icon = tab.icon;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative flex grow shrink-0 rounded-b-md border-t-2 transition-colors ${
        active ? "border-blue-600" : "border-transparent hover:bg-gray-100"
      } ${pinned ? "bg-blue-50" : ""} ${isDragging ? "z-10 opacity-70" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={() => onNavigate(tab.href)}
        onContextMenu={(event) => {
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          setMenuAnchor({ top: rect.bottom, left: rect.left + rect.width / 2 });
        }}
        className={`flex min-w-0 flex-1 items-center gap-1.5 whitespace-nowrap py-2.5 pl-5 text-sm ${
          pinned ? "pr-5" : "pr-1"
        } ${active ? "font-medium text-blue-600" : "text-gray-600"}`}
      >
        {pinned && <Pin className="h-3 w-3 shrink-0 text-blue-500" fill="currentColor" />}
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{tab.label}</span>
      </button>

      {!pinned && (
        <button
          type="button"
          aria-label={`Close ${tab.label}`}
          onClick={(event) => {
            event.stopPropagation();
            onCloseTab(tab.id);
          }}
          className="flex shrink-0 items-center pl-1 pr-4 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
            <X className="h-3 w-3" />
          </span>
        </button>
      )}

      {menuAnchor && (
        <TabContextMenu
          pinned={pinned}
          anchor={menuAnchor}
          onTogglePin={() => onTogglePin(tab.id)}
          onClose={() => setMenuAnchor(null)}
        />
      )}
    </div>
  );
}
