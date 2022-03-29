import { ReactElement, useCallback, useEffect, useState } from "react";
import styles from "./Nav.module.scss";
import { Link, NavLink } from "react-router-dom";
import { NavPropType } from "../types";
import classNames from "classnames";

const Nav: React.FC<NavPropType> = (): ReactElement => {
  const [page, setPage] = useState<any>("home");

  const checkUrl = useCallback(() => {
    if (window.location.href === "http://localhost:3000/") {
      setPage("home");
    } else if (window.location.href === "http://localhost:3000/new") {
      setPage("new");
    } else if (window.location.href === "http://localhost:3000/profile") {
      setPage("profile");
    }
  }, [window.location.href]);

  useEffect(() => {
    checkUrl();
  }, [checkUrl]);

  return (
    <ul className={styles.container}>
      <h1 className={classNames(styles.logo, styles.item)} onClick={checkUrl}>
        <NavLink to="/" onClick={checkUrl}>
          <span className={styles["logo__place"]}>Place</span>{" "}
          <span className={styles["logo__review"]}>Review</span>
        </NavLink>
      </h1>
      <NavLink
        to="/"
        onClick={checkUrl}
        className={({ isActive }) =>
          isActive ? styles.selected : styles.deselect
        }
      >
        <li>Search review</li>
      </NavLink>
      <NavLink
        to="/new"
        onClick={checkUrl}
        className={({ isActive }) =>
          isActive ? styles.selected : styles.deselect
        }
      >
        <li>New review</li>
      </NavLink>
      <NavLink
        to="/profile"
        onClick={checkUrl}
        className={({ isActive }) =>
          isActive ? styles.selected : styles.deselect
        }
      >
        <li>Profile</li>
      </NavLink>
    </ul>
  );
};

export default Nav;
