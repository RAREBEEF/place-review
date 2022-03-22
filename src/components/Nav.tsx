import { ReactElement, useCallback } from "react";
import styles from "./Nav.module.scss";
import { Link } from "react-router-dom";
import { NavPropType } from "../types";

const Nav: React.FC<NavPropType> = ({
  isFindTab,
  setIsFindTab,
}): ReactElement => {
  const onItemClick = useCallback(() => {
    setIsFindTab((prev: boolean) => !prev);
  }, [setIsFindTab]);

  return (
    <ul className={styles.container}>
      <Link onClick={onItemClick} to={isFindTab === false ? "/new" : "/"}>
        <li className={styles.item}>
          {isFindTab ? "Search Review" : "New Review"}
        </li>
      </Link>
      <li className={styles.item}>Profile</li>
    </ul>
  );
};

export default Nav;
