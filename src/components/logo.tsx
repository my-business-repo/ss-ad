import logo from "@/assets/s-admin-icon.png";
import Image from "next/image";

export function Logo() {
  return (
    <div className="relative h-16 w-16 mx-auto">
      <Image
        src={logo}
        fill
        className="object-contain"
        alt="S Admin logo"
        role="presentation"
        quality={100}
      />
    </div>
  );
}
