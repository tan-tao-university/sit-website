// Vertical section label pinned to the left edge, like the reference design
const SectionTab = ({
  label,
  variant = "brand",
}: {
  label: string;
  variant?: "brand" | "light";
}) => (
  <div className="absolute left-0 top-8 z-10 hidden xl:block">
    <span
      className={`inline-block px-2 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] [writing-mode:vertical-rl] ${
        variant === "light"
          ? "bg-white text-[#BA4811]"
          : "bg-[#BA4811] text-white"
      }`}
    >
      {label}
    </span>
  </div>
);

export default SectionTab;
