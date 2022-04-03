import { ReactElement } from "react";
import styles from "./Nav.module.scss";
import { NavLink } from "react-router-dom";
import { NavPropType } from "../types";
import classNames from "classnames";
const Nav: React.FC<NavPropType> = (): ReactElement => {
  return (
    <ul className={styles.container}>
      <h1 className={classNames(styles.logo, styles.item)}>
        <NavLink to="/">
          <span className={styles["logo__place"]}>Place</span>{" "}
          <span className={styles["logo__review"]}>Review</span>
        </NavLink>
      </h1>
      <NavLink
        to="/"
        className={({ isActive }): string =>
          isActive ? styles.selected : styles.deselect
        }
      >
        <li>Search review</li>
      </NavLink>
      <NavLink
        to="/new"
        className={({ isActive }): string =>
          isActive ? styles.selected : styles.deselect
        }
      >
        <li>New review</li>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }): string =>
          isActive ? styles.selected : styles.deselect
        }
      >
        <li>Profile</li>
      </NavLink>
    </ul>
  );
};

export default Nav;
