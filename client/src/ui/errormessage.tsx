import { FunctionalComponent, h, JSX } from "preact";
import cn from "classnames";

const ErrorMessage: FunctionalComponent<JSX.HTMLAttributes> = ({ children, className }) => {
  return <div class={cn("h-4 text-red-700", className)}>{children}</div>;
};

export default ErrorMessage;
