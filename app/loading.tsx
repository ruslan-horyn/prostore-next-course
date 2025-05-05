import loader from "@/assets/loader.gif";
import Image from "next/image";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Image src={loader} width={150} height={150} alt="Loading..." />
    </div>
  );
};

export default Loading;
