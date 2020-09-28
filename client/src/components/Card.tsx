import { FunctionalComponent, h, JSX } from "preact";

interface CardProps {
  header: JSX.Element;
}

export const Card: FunctionalComponent<CardProps> = ({ header }) => {
  return (
    <div class="border border-gray-400 rounded overflow-hidden shadow-lg">
      <div class="px-6 py-4">
        <span class="font-bold text-xl mb-2">{header}</span>
      </div>
    </div>
  );
};
