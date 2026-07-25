"use client";

import { useRef, useState } from "react";

export default function SwipeToDelete({
  onDelete,
  children,
}: {
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  function handlePointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDragX(Math.min(0, Math.max(e.clientX - startX.current, -96)));
  }

  function handlePointerUp() {
    setDragging(false);
    if (dragX < -64) onDelete();
    setDragX(0);
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-red-500 text-sm font-medium text-white">
        Delete
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 150ms ease",
        }}
        className="relative touch-pan-y bg-[var(--background)]"
      >
        {children}
      </div>
    </div>
  );
}
