import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stateType } from "../types";
import styles from "./App.module.scss";
import Login from "./Login";
import Map from "./Map";
import Search from "./NewReview";
import { authService } from "../fbase";
import { onAuthStateChanged } from "firebase/auth";
import { setLogin } from "../redux/modules/loginProcess";
import Loading from "./Loading";
import Home from "../pages/Home";
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
// 리뷰 등록은 대충 감이 잡히는데 리뷰 검색창은 어떤 레이아웃과 기능을 구현할지 아직 감이 안잡힘.
// 지도와 검색창은 리뷰 등록과 동일하게, 대신 검색 결과창 자리에 리뷰 리스트들을 출력
// 리뷰를 선택하면 그 리뷰의 매장이 지도에 마커와 함께 출력
// 마커 위치도 현재위치 밑으로 까ㅏㄹ끔하게?
// 브라우저 width 줄면 검색 결과들 x축 스크롤
// 검색 결과 목록 높이 맞추느라 고생하긴 했는데 어차피 글 작성하는 칸 만들려면 높이 줄여야됨
// NewReview 컴포넌트 검색 결과 창 다듬기