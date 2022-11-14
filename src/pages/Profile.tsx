import { ReactElement, useCallback, useEffect, useState } from "react";
import { authService, dbService } from "../fbase";
import {
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { reviewObjType, stateType } from "../types";
import Button from "../components/Button";
import { doc, setDoc } from "firebase/firestore";
import Review from "../components/Review";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.scss";
import classNames from "classnames";
import { setLogin } from "../redux/modules/loginProcess";

const Profile: React.FC = (): ReactElement => {
  const testerId = "zlD5h6Lw4obUlrBM4EthJbw9OXh2";
  const {
    loginProcess: { userObj },
    getReviews: { reviews: allReviews },
  } = useSelector((state: stateType): stateType => state);
  const dispatch = useDispatch();
  const [myReviews, setMyReviews] = useState<Array<any>>([]);
  const [displayName, setDisplayName] = useState<string>("");
  const [emailCheck, setEmailCheck] = useState<string>("");
  const [alert, setAlert] = useState<any>("");
  const navigate = useNavigate();

  // 닉네임 입력
  const ondisplayNameChange = useCallback((e): void => {
    setDisplayName(e.target.value);
  }, []);

  // 이메일 입력
  const onEmailCheckChange = useCallback((e): void => {
    setEmailCheck(e.target.value);
  }, []);

  // 닉네임 변경 클릭
  const onDisplayNameChangeClick = useCallback(
    (e) => {
      e.preventDefault();
      // 오류 출력 or 변경 실행
      if (authService.currentUser) {
        if (authService.currentUser.uid === testerId) {
          window.alert("테스트 계정의 정보는 변경하실 수 없습니다.");
          return;
        } else if (displayName === "") {
          setAlert("닉네임을 입력해주세요.");
        } else if (displayName === userObj.displayName) {
          setAlert("닉네임에 변경 사항이 없습니다.");
        } else if (displayName.length < 2 || displayName.length > 12) {
          setAlert("닉네임은 2자 이상 12자 이하만 가능합니다.");
        } else if (displayName !== "") {
          try {
            updateProfile(authService.currentUser, {
              displayName,
            });
            myReviews.forEach((review): void => {
              if (review.displayName !== displayName) {
                setDoc(doc(dbService, "reviews", review.id), {
                  ...review,
                  displayName,
                });
              }
            });
            setAlert("닉네임이 변경되었습니다.");
            onAuthStateChanged(authService, (user) => {
              if (user) {
                dispatch(
                  setLogin(true, {
                    displayName,
                    uid: user.uid,
                  })
                );
              } else {
                dispatch(setLogin(false, {}));
              }
            });
          } catch (error) {
            setAlert(error);
          }
        }
      }
    },
    [dispatch, displayName, myReviews, userObj.displayName]
  );

  // 비밀번호 재설정 메일 발송
  const onResetPwClick = useCallback(
    async (e): Promise<void> => {
      e.preventDefault();

      if (authService.currentUser) {
        if (authService.currentUser.uid === testerId) {
          window.alert("테스트 계정의 정보는 변경하실 수 없습니다.");
          return;
        } else if (emailCheck.length === 0) {
          setAlert("이메일을 입력해주세요.");
        } else if (authService.currentUser.email !== emailCheck) {
          setAlert("이메일이 일치하지 않습니다.");
        } else {
          try {
            sendPasswordResetEmail(authService, emailCheck).then(() => {
              setAlert("메일이 발송되었습니다.");
            });
          } catch (error) {
            setAlert(error);
          }
        }
      }
    },
    [emailCheck]
  );

  // 회원 탈퇴
  const onDeleteClick = useCallback(async (): Promise<void> => {
    if (!authService.currentUser) return;

    if (authService.currentUser.uid === testerId) {
      window.alert("테스트 계정의 정보는 변경하실 수 없습니다.");
      return;
    }

    const ok = window.confirm(
      "정말 탈퇴하시겠습니까?\n작성한 글은 삭제되지 않습니다."
    );

    if (ok && authService.currentUser) {
      await deleteUser(authService.currentUser)
        .then(() => {
          navigate("/");
        })
        .catch((error): void => {
          setAlert(error);
        });
    }
  }, [navigate]);

  // 로그아웃
  const onLogOutClick = (): void => {
    authService.signOut();
    navigate("/");
  };

  // 내가 작성한 리뷰만 추려서 저장
  useEffect((): void => {
    if (userObj.uid === undefined || allReviews.length === 0) {
      return;
    }

    setMyReviews(
      allReviews.filter(
        (review: reviewObjType): boolean => review.creatorId === userObj.uid
      )
    );
  }, [allReviews, navigate, userObj.uid]);

  return (
    <div className={styles.container}>
      <div className={styles["edit-profile-wrapper"]}>
        <h2 className={styles["edit-profile-header"]}>프로필 수정</h2>
        <div className={styles.alert}>{alert}</div>
        <form className={styles["display-name-wrapper"]}>
          <h3 className={styles["form-header"]}>닉네임 변경</h3>
          <input
            placeholder={userObj.displayName}
            value={displayName}
            onChange={ondisplayNameChange}
            maxLength={12}
            minLength={2}
            className={classNames(styles["input--display-name"], styles.input)}
          />
          <Button
            text="변경"
            onClick={onDisplayNameChangeClick}
            className={["Profile__display-name"]}
          />
        </form>
        <form className={styles["password-wrapper"]}>
          <h3 className={styles["form-header"]}>비밀번호 재설정</h3>
          <input
            className={classNames(styles["input--email"], styles.input)}
            placeholder="email"
            value={emailCheck}
            onChange={onEmailCheckChange}
            type="email"
          />
          <Button
            text="재설정 메일 발송"
            onClick={onResetPwClick}
            className={["Profile__password"]}
          />
        </form>
        <div className={styles["btn-wrapper"]}>
          <Button
            text="회원 탈퇴"
            onClick={onDeleteClick}
            className={["Profile__delete-account"]}
          />
          <Button
            text="로그아웃"
            onClick={onLogOutClick}
            className={["Profile__log-out"]}
          />
        </div>
      </div>
      <hr className={styles.line} />
      <div className={styles["my-review-wrapper"]}>
        <h2 className={styles["my-review-header"]}>내가 쓴 리뷰</h2>
        {myReviews.length === 0 && (
          <div className={styles["zero"]}>작성한 리뷰가 없습니다.</div>
        )}
        <ul className={styles["my-review-list"]}>
          {myReviews.map((review: reviewObjType): ReactElement => {
            const location = new window.kakao.maps.LatLng(
              review.location.Ma,
              review.location.La
            );
            return (
              <Review
                key={review.id}
                location={location}
                review={review}
                isProfile={true}
              />
            );
          })}
        </ul>
      </div>
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()}. RAREBEEF All Rights Reserved.
      </footer>
    </div>
  );
};

export default Profile;
