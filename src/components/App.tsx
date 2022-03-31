import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stateType } from "../types";
import styles from "./App.module.scss";
import { authService } from "../fbase";
import { onAuthStateChanged } from "firebase/auth";
import { setLogin } from "../redux/modules/loginProcess";
import Router from "./Router";
import Login from "../pages/Login";

const App: React.FC = (): ReactElement => {
  const dispatch = useDispatch();
  const { isLogin } = useSelector((state: stateType) => state.loginProcess);
  const [init, setInit] = useState(false);

  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        dispatch(
          setLogin(true, {
            displayName: user.displayName ? user.displayName : "익명", // 신규 가입시 닉네임 --> "익명"
            uid: user.uid,
          })
        );
        setInit(true);
      } else {
        dispatch(setLogin(false, {}));
        setInit(true);
      }
    });
  }, [dispatch]);

  return (
    <div className={styles.container}>
      {isLogin ? <Router init={init} /> : <Login />}
    </div>
  );
};

export default App;
