import { FunctionalComponent, h, JSX } from "preact";
import cn from "classnames";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
interface ButtonProps extends JSX.HTMLAttributes {
  variant: "primary" | "secondary";
}

const Button: FunctionalComponent<ButtonProps> = ({ className, disabled, variant, ...props }) => {
  return (
    <button
      {...props}
      className={cn(
        "text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
        {
          "cursor-not-allowed": disabled,
          "bg-blue-500 hover:bg-blue-700": variant === "primary" && !disabled,
          "bg-green-500 hover:bg-green-700": variant === "secondary" && !disabled,
          "bg-gray-500 hover:bg-gray-700": disabled,
        },
        className,
      )}
      disabled={disabled}
    />
  );
};

export default Button;
