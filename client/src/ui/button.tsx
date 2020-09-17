import { FunctionalComponent, h, JSX } from "preact";
import cn from "classnames";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
interface ButtonProps extends JSX.HTMLAttributes {
  variant: "primary" | "secondary";
}

const Button: FunctionalComponent<ButtonProps> = ({ className, variant, ...props }) => {
  return (
    <button
      class={cn(
        {
          "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-6 rounded focus:outline-none focus:shadow-outline":
            variant === "primary",
        },
        className,
      )}
      {...props}
    />
  );
};

export default Button;
