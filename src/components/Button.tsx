import { ReactElement } from "react";
import { ButtonPropType } from "../types";

const Button: React.FC<ButtonPropType> = ({
  text,
  onClick,
}): ReactElement<HTMLButtonElement> => {
  return <button onClick={onClick}>{text}</button>;
};

export default Button;
