import classNames from "classnames";
import { ReactElement } from "react";
import { ButtonPropType } from "../types";
import styles from "./Button.module.scss";

const Button: React.FC<ButtonPropType> = ({
  text,
  onClick,
  className,
}): ReactElement<HTMLButtonElement> => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        styles.btn,
        className?.map((item: string): string => styles[item])
      )}
    >
      {text}
    </button>
  );
};

export default Button;
