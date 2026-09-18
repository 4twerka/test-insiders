import { useRef } from "react";
import { createPortal } from "react-dom";
import { Pin, PinOff } from "lucide-react";
import { useClickOutside } from "./use-click-outside";

type Props = {
  pinned: boolean;
  anchor: { top: number; left: number };
  onTogglePin: () => void;
  onClose: () => void;
};

export function TabContextMenu({ pinned, anchor, onTogglePin, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  useClickOutside([menuRef], onClose);

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{ position: "fixed", top: anchor.top + 6, left: anchor.left }}
      className="z-50 -translate-x-1/2"
    >
      <div className="mx-auto h-2 w-2 rotate-45 border-l border-t border-gray-200 bg-white" />
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onTogglePin();
          onClose();
        }}
        className="-mt-1 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-lg hover:bg-gray-50"
      >
        {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        {pinned ? "Unpin tab" : "Pin tab"}
      </button>
    </div>,
    document.body,
  );
}
