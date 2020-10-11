import { FunctionalComponent, h } from "preact";
import { useCallback } from "preact/hooks";
import { get, noop } from "lodash";
import "./switch.css";

interface SwitchProps {
  checked: boolean;
  label: string;
  onChange?: (arg1: boolean) => void;
  onOff?: () => void;
  onOn?: () => void;
  suffix: string;
}

const Switch: FunctionalComponent<SwitchProps> = ({
  checked,
  label,
  onChange = noop,
  onOff = noop,
  onOn = noop,
  suffix,
}) => {
  const checkboxId = `toggle_${suffix}`;
  const handleChange = useCallback(
    (event: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
      const checked = get(event.target, "checked") as boolean;
      onChange(checked);
      if (checked) {
        onOn();
      } else {
        onOff();
      }
    },
    [onChange, onOff, onOn],
  );
  return (
    <div className="inline-block">
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
        <input
          checked={checked}
          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
          id={checkboxId}
          onChange={handleChange}
          type="checkbox"
          name={checkboxId}
        />
        <label
          for={checkboxId}
          className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
        />
      </div>
      <label for={checkboxId} className="text-xs text-gray-700">
        {label}
      </label>
    </div>
  );
};

export default Switch;
