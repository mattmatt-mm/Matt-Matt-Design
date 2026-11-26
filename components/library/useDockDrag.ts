"use client";

import { type MouseEvent, type PointerEvent, useCallback, useEffect, useRef } from "react";

const DRAG_THRESHOLD = 5;
const EDGE_RESISTANCE = 48;

type DockDrag = {
  pointerId: number;
  startX: number;
  startOffset: number;
  maxOffset: number;
  inset: number;
  pill: HTMLDivElement;
  moved: boolean;
};

/** Pointer handling shared by the portfolio dock and its interactive preview. */
export function useDockDrag(
  tabCount: number,
  activeIndex: number,
  tabsHidden: boolean,
  routeKey: string | number,
  onDrop: (index: number) => void,
) {
  const pillRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DockDrag | null>(null);
  const suppressClick = useRef(false);

  const endDrag = useCallback(() => {
    const gesture = drag.current;
    if (!gesture) return;

    drag.current = null;
    delete gesture.pill.dataset.dragging;
    gesture.pill.style.removeProperty("--dock-drag-x");
    gesture.pill.style.removeProperty("--dock-drag-pull");
    return gesture;
  }, []);

  useEffect(() => () => {
    if (endDrag()) suppressClick.current = true;
  }, [endDrag, routeKey, tabsHidden]);

  function startDrag(event: PointerEvent<HTMLElement>) {
    if (!event.isPrimary || drag.current) return;
    suppressClick.current = false;

    const pill = pillRef.current;
    const link = (event.target as Element).closest("[data-dock-tab][data-active='true']");
    if (
      tabsHidden || !pill || !link || event.button !== 0 ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
    ) return;

    const dockRect = event.currentTarget.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    const pillStyle = getComputedStyle(pill);
    const tabWidth = Number.parseFloat(pillStyle.width);
    const inset = Number.parseFloat(pillStyle.left);
    const pillCenter = pillRect.left + pillRect.width / 2;

    // Capture on the link so a stationary press still produces a native click.
    link.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: pillCenter - tabWidth / 2 - dockRect.left - inset,
      maxOffset: tabWidth * (tabCount - 1),
      inset,
      pill,
      moved: false,
    };
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const gesture = drag.current;
    if (gesture?.pointerId !== event.pointerId) return;

    const delta = event.clientX - gesture.startX;
    if (!gesture.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      gesture.moved = true;
      gesture.pill.dataset.dragging = "true";
      suppressClick.current = true;
    }

    const position = gesture.startOffset + delta;
    const offset = Math.min(Math.max(position, 0), gesture.maxOffset);
    const overrun = position - offset;
    const pull = overrun / (Math.abs(overrun) + EDGE_RESISTANCE);
    gesture.pill.style.setProperty("--dock-drag-x", `${offset}px`);
    gesture.pill.style.setProperty("--dock-drag-pull", String(pull));
  }

  function dropDrag(event: PointerEvent<HTMLElement>) {
    const gesture = drag.current;
    if (gesture?.pointerId !== event.pointerId) return;

    // A quick release can arrive at the destination before a move event does.
    const releaseDistance = Math.abs(event.clientX - gesture.startX);
    if (tabsHidden || (!gesture.moved && releaseDistance < DRAG_THRESHOLD)) {
      endDrag();
      return;
    }
    suppressClick.current = true;

    // The pointer stays captured by its starting link, so use the release
    // position along the live grid to resolve the destination.
    const dockRect = event.currentTarget.getBoundingClientRect();
    const tabWidth = (dockRect.width - 2 * gesture.inset) / tabCount;
    const column = Math.floor((event.clientX - dockRect.left - gesture.inset) / tabWidth);
    const index = Math.min(Math.max(column, 0), tabCount - 1);
    endDrag();
    if (index === activeIndex) return;

    onDrop(index);
  }

  function cancelDrag(event: PointerEvent<HTMLElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    endDrag();
    suppressClick.current = true;
  }

  return {
    pillRef,
    dragHandlers: {
      onPointerDown: startDrag,
      onPointerMove: moveDrag,
      onPointerUp: dropDrag,
      onPointerCancel: cancelDrag,
      onLostPointerCapture: cancelDrag,
      onClickCapture: (event: MouseEvent<HTMLElement>) => {
        if (suppressClick.current && event.detail > 0) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
    },
  };
}
