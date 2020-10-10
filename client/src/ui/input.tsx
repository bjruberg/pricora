import { FunctionalComponent, h, JSX, Ref } from "preact";
import cn from "classnames";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export interface InputProps extends JSX.HTMLAttributes {
  error?: boolean;
  inputRef?: Ref<any>;
}

const Input: FunctionalComponent<InputProps> = ({ className, error, inputRef, ...props }) => {
  return (
    <input
      class={`shadow appearance-none border rounded w-full py-2 px-2 md:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${cn(
        { "border-red-500 bg-red-200": error },
        className,
      )}`}
      ref={inputRef}
      {...props}
    />
  );
};

export default Input;
