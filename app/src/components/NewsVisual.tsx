import { News01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type NewsVisualItem = {
  title: string;
  image?: string;
};

// Shared card image/placeholder treatment for news cards (home + /tin-tuc listing)
export const NewsVisual = ({
  item,
  index,
  featured = false,
}: {
  item: NewsVisualItem;
  index: number;
  featured?: boolean;
}) => (
  <div
    className={`relative isolate overflow-hidden bg-[#eee9e4] ${
      featured
        ? "min-h-[17rem] sm:min-h-[22rem] lg:min-h-[24rem] lg:[clip-path:polygon(0_0,100%_0,100%_86%,92%_100%,0_100%)]"
        : "aspect-[16/9]"
    }`}
  >
    {item.image ? (
      <img
        src={item.image}
        alt=""
        loading={featured ? "eager" : "lazy"}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
      />
    ) : (
      <div className="relative flex h-full items-center justify-center overflow-hidden bg-[#191d26] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:44px_44px]"
        />
        <span className="absolute -bottom-5 right-4 font-mono text-[8rem] font-bold leading-none text-white/5 sm:text-[10rem]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <HugeiconsIcon
          icon={News01Icon}
          size={featured ? 58 : 42}
          strokeWidth={1.1}
          className="relative text-white/55"
        />
      </div>
    )}
    {item.image && (
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(15,18,24,.35)_100%)]" />
    )}
  </div>
);
