import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginProcessStateType, stateType } from "../types";
import styles from "./App.module.scss";
import { authService, dbService } from "../fbase";
import { onAuthStateChanged } from "firebase/auth";
import { setLogin } from "../redux/modules/loginProcess";
import Router from "./Router";
import Login from "../pages/Login";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { setFilter, setReviews } from "../redux/modules/getReviews";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Loading from "../pages/Loading";

const App: React.FC = (): ReactElement => {
  const dispatch = useDispatch();
  const { isLogin } = useSelector(
    (state: stateType): loginProcessStateType => state.loginProcess
  );
  const [init, setInit] = useState<boolean>(false);

  // 앱 실행 시
  // 로그인 여부 파악
  // 유저 & 리뷰 데이터 받아오기
  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        dispatch(
          setLogin(true, {
            displayName: user.displayName ? user.displayName : "익명",
            uid: user.uid,
          })
        );
      } else {
        dispatch(setLogin(false, {}));
      }
      setInit(true);
    });

    const q = query(
      collection(dbService, "reviews"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe: Function = onSnapshot(q, (querySnapshot) => {
      const reviews: Array<any> = [];

      querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      dispatch(setReviews(reviews));
    });

    dispatch(setFilter("HERE"));

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <div className={styles.container}>
      {init ? (
        <BrowserRouter>
          {isLogin ? (
            <Router />
          ) : (
            <Routes>
              <Route path="/*" element={<Login />} />
            </Routes>
          )}
        </BrowserRouter>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default App;
