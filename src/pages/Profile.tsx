import { ReactElement, useCallback, useEffect, useState } from "react";
import { authService, dbService } from "../fbase";
import {
  deleteUser,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { useSelector } from "react-redux";
import { stateType } from "../types";
import Button from "../components/Button";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import Review from "../components/Review";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = (): ReactElement => {
  const { userObj } = useSelector((state: stateType) => state.loginProcess);
  const [displayName, setDisplayName] = useState<string>("");
  const [myReviews, setMyReviews] = useState<Array<any>>([]);
  const [emailCheck, setEmailCheck] = useState<string>("");
  const [alert, setAlert] = useState<any>("");
  const navigate = useNavigate();

  const ondiplayNameChange = useCallback((e) => {
    setDisplayName(e.target.value);
  }, []);

  const onEmailCheckChange = useCallback((e) => {
    setEmailCheck(e.target.value);
  }, []);

  const onSubmitClick = useCallback(
    async (e) => {
      if (authService.currentUser) {
        if (displayName !== "") {
          updateProfile(authService.currentUser, {
            displayName,
          });
          await myReviews.forEach((review) => {
            if (review.displayName !== displayName) {
              setDoc(doc(dbService, "reviews", review.id), {
                ...review,
                displayName,
              });
            }
          });
        }
      }
    },
    [displayName, myReviews]
  );

  const onResetPwClick = useCallback(
    async (e) => {
      if (authService.currentUser) {
        if (authService.currentUser.email !== emailCheck) {
          setAlert("메일이 일치하지 않습니다.");
          return;
        }
        try {
          sendPasswordResetEmail(authService, emailCheck).then(() => {
            setAlert("메일이 발송되었습니다.");
          });
        } catch (error) {
          setAlert(error);
        }
      }
    },
    [emailCheck]
  );

  const onDeleteClick = useCallback(async () => {
    const ok = window.confirm(
      "정말 탈퇴하시겠습니까?\n작성한 글은 삭제되지 않습니다."
    );

    if (ok && authService.currentUser) {
      deleteUser(authService.currentUser)
        .then(() => {
          navigate("/");
        })
        .catch((error) => {
          setAlert(error);
        });
    }
  }, [navigate]);

  const onLogOutClick = () => {
    authService.signOut();
    navigate("/");
  };

  useEffect(() => {
    if (userObj.uid === undefined) {
      return;
    }
    const q = query(
      collection(dbService, "reviews"),
      where("creatorId", "==", userObj.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviews: Array<any> = [];
      querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      setMyReviews(reviews);
    });

    return () => {
      unsubscribe();
    };
  }, [userObj.uid]);

  return (
    <div>
      {/* alert는 높이 고정 필요 (텍스트 없을 때도)*/}
      <div>{alert}</div>
      <form>
        <input
          placeholder={userObj.displayName}
          value={displayName}
          onChange={ondiplayNameChange}
        />
        <Button text="변경" onClick={onSubmitClick} />
      </form>
      <form>
        <input
          placeholder="email"
          value={emailCheck}
          onChange={onEmailCheckChange}
          type="email"
        />
        <Button text="비밀번호 재설정" onClick={onResetPwClick} />
      </form>
      <Button text="회원 탈퇴" onClick={onDeleteClick} />
      <Button text="로그아웃" onClick={onLogOutClick} />
      <ul>
        {myReviews.map((review) => {
          const location = new window.kakao.maps.LatLng(
            review.location.Ma,
            review.location.La
          );
          return <Review key={review.id} location={location} review={review} />;
        })}
      </ul>
    </div>
  );
};

export default Profile;
