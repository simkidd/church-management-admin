import React from "react";
import Image from "next/image";

const Logo = ({ ...props }: React.ComponentProps<"div">) => {
  return (
    <div className="h-10" {...props}>
      <Image
        src={"/logos/pngegg.png"}
        alt="logo"
        width={300}
        height={150}
        className="object-contain w-full h-full"
      />
    </div>
  );
};

export default Logo;
