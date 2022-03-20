import { ReactElement, useCallback, useState } from "react";
import styles from "./Nav.module.scss";
import { Link } from "react-router-dom";

const Nav: React.FC = (): ReactElement => {
  const [isFindTab, setIsFindTab] = useState(
    Boolean(window.location.href.indexOf("new"))
  );

  const onItemClick = useCallback(() => {
    setIsFindTab((prev) => !prev);
  }, []);

  return (
    <ul className={styles.container}>
      <Link onClick={onItemClick} to={isFindTab === false ? "/new" : "/"}>
        <li className={styles.item}>
          {isFindTab === false ? "New Review" : "Search Review"}
        </li>
      </Link>
      {/* <Link to="/"> */}
      <li className={styles.item}>Profile</li>
      {/* </Link> */}
    </ul>
  );
};

export default Nav;
