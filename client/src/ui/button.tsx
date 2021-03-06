import { FunctionalComponent, h, JSX } from "preact";
import cn from "classnames";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
interface ButtonProps extends JSX.HTMLAttributes {
  active?: boolean;
  slim?: boolean;
  variant: "primary" | "secondary" | "inline" | "dangerous";
}

export const createButtonClasses = ({
  active,
  className,
  disabled,
  slim = false,
  variant,
}: ButtonProps): string => {
  return cn(
    " inline-block rounded focus:outline-none focus:shadow-outline",
    {
      "py-2 px-4": !slim,
      "py-1 px-2 text-sm": slim,
    },
    {
      "cursor-not-allowed": disabled,
      "font-bold": variant === "primary" || variant === "secondary",
      "bg-blue-500 hover:bg-blue-700": variant === "primary" && !disabled,
      "bg-green-500 hover:bg-green-700": variant === "secondary" && !disabled,
      "bg-red-500 hover:bg-red-700": variant === "dangerous" && !disabled,
      "font-normal leading-none border border-white hover:border-transparent hover:text-black hover:bg-white":
        variant === "inline" && !disabled,
      "bg-white text-black": variant === "inline" && active,
      "text-white": !active,
      "bg-gray-500 hover:bg-gray-700": disabled,
    },
    className,
  );
};

const Button: FunctionalComponent<ButtonProps> = (props) => {
  return <button {...props} class={createButtonClasses(props)} disabled={props.disabled} />;
};

export default Button;
