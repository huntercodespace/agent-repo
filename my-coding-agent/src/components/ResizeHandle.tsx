import { useRef, type PointerEvent } from "react";

interface ResizeHandleProps {
  label: string;
  onDelta: (deltaX: number) => void;
  onReset?: () => void;
}

export function ResizeHandle({ label, onDelta, onReset }: ResizeHandleProps) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  function endDrag(target: HTMLElement, pointerId: number) {
    dragging.current = false;
    target.releasePointerCapture(pointerId);
    document.body.classList.remove("resize-dragging");
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    dragging.current = true;
    lastX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.classList.add("resize-dragging");
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const dx = event.clientX - lastX.current;
    lastX.current = event.clientX;
    if (dx !== 0) onDelta(dx);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    endDrag(event.currentTarget, event.pointerId);
  }

  function onPointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    endDrag(event.currentTarget, event.pointerId);
  }

  function onDoubleClick() {
    onReset?.();
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      title={`${label}（双击恢复默认宽度）`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onDoubleClick={onDoubleClick}
      className="group relative z-10 flex w-[7px] shrink-0 cursor-col-resize items-stretch justify-center touch-none"
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/45 shadow-[0_0_8px_rgba(255,255,255,0.12)] transition-colors duration-150 group-hover:bg-white/65 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] group-active:bg-white/90" />
      <div className="my-auto flex h-10 w-[3px] flex-col items-center justify-center gap-[3px] rounded-full bg-white/5 opacity-80 transition-all duration-150 group-hover:opacity-100 group-hover:bg-white/10 group-active:bg-white/15">
        <span className="h-[3px] w-[3px] rounded-full bg-white/55 group-hover:bg-white/75 group-active:bg-white" />
        <span className="h-[3px] w-[3px] rounded-full bg-white/55 group-hover:bg-white/75 group-active:bg-white" />
        <span className="h-[3px] w-[3px] rounded-full bg-white/55 group-hover:bg-white/75 group-active:bg-white" />
      </div>
    </div>
  );
}
