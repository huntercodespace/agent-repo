import type { ChangeEvent } from "react";
import { Icon } from "../Icon";

interface StageCheckboxProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  "aria-label": string;
}

export function StageCheckbox({ checked, disabled, onChange, "aria-label": ariaLabel }: StageCheckboxProps) {
  return (
    <label className="relative inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center has-[:disabled]:cursor-not-allowed">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={ariaLabel}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-[4px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[border-color,background-color,box-shadow] duration-100 ${
          checked
            ? "border-primary/90 bg-primary-container shadow-[0_0_0_1px_rgba(127,133,249,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]"
            : "border-white/28 bg-surface-container-high peer-hover:border-white/45"
        } peer-focus-visible:ring-2 peer-focus-visible:ring-primary/45 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-surface-container-lowest peer-disabled:border-white/20 peer-disabled:bg-surface-container`}
      />
      <Icon
        name="check"
        aria-hidden
        fill
        className={`pointer-events-none relative z-[1] text-[14px] leading-none text-on-primary-container ${checked ? "opacity-100" : "opacity-0"}`}
      />
    </label>
  );
}
