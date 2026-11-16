import type { Dish } from "@/lib/menu";

export default function DishImage({
  dish,
  className,
}: {
  dish: Dish;
  className: string;
}) {
  if (dish.image) {
    return (
      <img
        src={dish.image}
        alt=""
        loading="lazy"
        className={`w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-brand-brown text-6xl ${className}`}
    >
      {dish.emoji}
    </div>
  );
}