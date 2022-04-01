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

const App: React.FC = (): ReactElement => {
  const dispatch = useDispatch();
  const { isLogin } = useSelector(
    (state: stateType): loginProcessStateType => state.loginProcess
  );
  const [init, setInit] = useState<boolean>(false);

  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        dispatch(
          setLogin(true, {
            displayName: user.displayName ? user.displayName : "익명",
            uid: user.uid,
          })
        );
        setInit(true);
      } else {
        dispatch(setLogin(false, {}));
        setInit(true);
      }
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
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        {isLogin ? (
          <Router init={init} />
        ) : (
          <Routes>
            <Route path="/*" element={<Login />} />
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
};

export default App;
