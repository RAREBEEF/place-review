import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stateType } from "../types";
import styles from "./App.module.scss";
import Login from "./Login";
import Map from "./Map";
import Search from "./Search";
import { authService } from "../fbase";
import { onAuthStateChanged } from "firebase/auth";
import { setLogin } from "../redux/modules/loginProcess";
import Loading from "./Loading";
import Home from "../routes/Home";
const App: React.FC = (): ReactElement => {
  const { isLogin } = useSelector((state: stateType) => state.loginProcess);
  const dispatch = useDispatch();

  const [init, setInit] = useState(false);

  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        dispatch(setLogin(true));
        setInit(true);
      } else {
        dispatch(setLogin(false));
        setInit(true);
      }
    });
  }, [dispatch]);

  return (
    <div className={styles.container}>
      {init ? !isLogin ? <Login /> : <Home /> : <Loading />}
      <footer>
        &copy; {new Date().getFullYear()}. RAREBEEF All Rights Reserved.
      </footer>
    </div>
  );
};

export default App;

//TODO:컴포넌트 트리 정리할 수 있으면 하기 + 페이지 구분해서 라우터 설정하기
// 지도 로딩 화면 예쁘게 출력할 방법 찾기
