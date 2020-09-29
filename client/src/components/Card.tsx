import { ComponentChild, FunctionalComponent, h } from "preact";

interface CardProps {
  header: ComponentChild;
}

export const Card: FunctionalComponent<CardProps> = ({ children, header }) => {
  return (
    <div class="border border-gray-400 rounded overflow-hidden shadow-lg">
      <div class="px-4 pt-3">
        <span class="font-bold text-xl mb-2">{header}</span>
      </div>
      <div class="px-4 py-3">{children}</div>
    </div>
  );
};
