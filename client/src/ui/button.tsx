import { FunctionalComponent, h, JSX } from "preact";
import cn from "classnames";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
interface ButtonProps extends JSX.HTMLAttributes {
  variant: "primary" | "secondary" | "inline";
}

export const createButtonClasses = ({ className, disabled, variant }: ButtonProps): string => {
  return cn(
    "text-white py-2 px-4 inline-block rounded focus:outline-none focus:shadow-outline",
    {
      "cursor-not-allowed": disabled,
      "font-bold": variant === "primary" || variant === "secondary",
      "bg-blue-500 hover:bg-blue-700": variant === "primary" && !disabled,
      "bg-green-500 hover:bg-green-700": variant === "secondary" && !disabled,
      "font-normal leading-none border border-white hover:border-transparent hover:text-black hover:bg-white":
        variant === "inline" && !disabled,
      "bg-gray-500 hover:bg-gray-700": disabled,
    },
    className,
  );
};

const Button: FunctionalComponent<ButtonProps> = (props) => {
  return <button {...props} class={createButtonClasses(props)} disabled={props.disabled} />;
};

export default Button;
