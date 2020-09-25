import { FunctionalComponent, h, JSX } from "preact";
import cn from "classnames";

interface MessageProps extends JSX.HTMLAttributes {
  inline?: boolean;
  textSize?: "sm" | "md";
}

const Message: FunctionalComponent<MessageProps> = ({ children, className, inline, textSize }) => {
  const Comp = inline ? "span" : "div";
  return (
    <Comp
      class={cn(
        "h-4 text-red-700",
        { "text-md": textSize === "md", "text-sm": textSize == "sm" },
        className,
      )}
    >
      {children}
    </Comp>
  );
};

export const ErrorMessage: FunctionalComponent<MessageProps> = ({ className, ...props }) => {
  return <Message class={cn("h-4 text-red-700", className)} {...props} />;
};

export const SuccessMessage: FunctionalComponent<MessageProps> = ({ className, ...props }) => {
  return <Message class={cn("h-4 text-red-700", className)} {...props} />;
};
