import { FunctionalComponent, h, JSX } from "preact";
import cn from "classnames";

export const Label: FunctionalComponent<JSX.HTMLAttributes> = ({ className, ...props }) => {
  return (
    <label {...props} className={cn("block text-gray-700 text-sm font-bold mb-2", className)} />
  );
};
