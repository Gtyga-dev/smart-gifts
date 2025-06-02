import React from "react";
import { Loader } from "lucide-react";

type SpinnerProps = {
  size?: number;
  color?: string;
};

const Spinner: React.FC<SpinnerProps> = ({ size = 40, color = "white" }) => {
  return (
    <div className="animate-spin">
      <Loader size={size} color={color} />
    </div>
  );
};

export default Spinner;
