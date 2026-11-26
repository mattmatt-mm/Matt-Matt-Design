"use client";

import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { SiteSquircle } from "./SiteSquircle";
import styles from "./SelectMenu.module.css";

const MENU_RADIUS = 8;
const MENU_INSET = 4;

export function SelectMenu<Value extends string>({ label, options, value, onChange }: {
  label: string;
  options: readonly { value: Value; label: string; className?: string }[];
  value: Value;
  onChange: (value: Value) => void;
}) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const open = activeIndex !== null;
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    function dismissOnOutsidePress(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setActiveIndex(null);
      }
    }
    document.addEventListener("pointerdown", dismissOnOutsidePress);
    return () => document.removeEventListener("pointerdown", dismissOnOutsidePress);
  }, [open]);

  if (!selected) return null;

  function select(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setActiveIndex(null);
    trigger.current?.focus({ preventScroll: true });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        setActiveIndex(activeIndex === null ? selectedIndex : Math.min(activeIndex + 1, options.length - 1));
        break;
      case "ArrowUp":
        setActiveIndex(activeIndex === null ? selectedIndex : Math.max(activeIndex - 1, 0));
        break;
      case "Home":
        setActiveIndex(0);
        break;
      case "End":
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        if (activeIndex === null) return;
        select(activeIndex);
        break;
      case "Escape":
        if (!open) return;
        event.stopPropagation();
        setActiveIndex(null);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  return (
    <div ref={root} className={styles.root}>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={activeIndex === null ? undefined : `${listId}-${activeIndex}`}
        className={styles.trigger}
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          setActiveIndex(open ? null : selectedIndex);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setActiveIndex(null)}
      >
        <SiteSquircle asChild cornerRadius={MENU_RADIUS}>
          <span className={styles.triggerSurface}>
            <span className={`${styles.selectedValue} ${selected.className ?? ""}`}>{selected.label}</span>
            <CaretDown size={16} aria-hidden />
          </span>
        </SiteSquircle>
      </button>
      {open && (
        <div className={styles.popup}>
          <SiteSquircle
            id={listId}
            role="listbox"
            aria-label={label}
            className={styles.list}
            cornerRadius={MENU_RADIUS}
            style={{ padding: MENU_INSET }}
          >
            {options.map((option, index) => (
              <SiteSquircle
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                data-active={index === activeIndex}
                className={styles.option}
                cornerRadius={MENU_RADIUS - MENU_INSET}
                onMouseDown={(event) => event.preventDefault()}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => select(index)}
              >
                <span className={option.className}>{option.label}</span>
                {index === selectedIndex && <Check size={16} aria-hidden />}
              </SiteSquircle>
            ))}
          </SiteSquircle>
        </div>
      )}
    </div>
  );
}
