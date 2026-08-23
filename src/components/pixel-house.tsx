type PixelHouseProps = {
  variant: "house" | "villa" | "cottage" | "farm" | "flat";
  booked?: boolean;
};

export function PixelHouse({ variant, booked }: PixelHouseProps) {
  const roof =
    variant === "villa" ? "#9a4a24" : variant === "cottage" ? "#5c3d2e" : variant === "farm" ? "#7a3f24" : "#c45c26";
  const wall = variant === "flat" ? "#f4ebe0" : "#efe0cc";

  return (
    <svg viewBox="0 0 16 16" className="pixel-sprite h-16 w-16 sm:h-20 sm:w-20" aria-hidden>
      <rect x="0" y="12" width="16" height="4" fill="#6f8a4e" />
      <rect x="2" y="7" width="12" height="7" fill={booked ? "#c8b8a4" : wall} />
      {variant === "villa" ? <rect x="1" y="6" width="14" height="2" fill={roof} /> : null}
      <polygon points="1,7 8,2 15,7" fill={booked ? "#8a7a6a" : roof} />
      <rect x="7" y="10" width="3" height="4" fill="#2f2416" />
      <rect x="4" y="9" width="2" height="2" fill={booked ? "#9aa8b0" : "#8fb8c9"} />
      {variant !== "cottage" ? <rect x="11" y="9" width="2" height="2" fill={booked ? "#9aa8b0" : "#8fb8c9"} /> : null}
      {variant === "farm" ? <rect x="12" y="11" width="3" height="3" fill="#c9a36a" /> : null}
      {variant === "villa" ? <rect x="3" y="13" width="3" height="1" fill="#6aa8c2" /> : null}
    </svg>
  );
}
