import { ReactElement, useCallback, useEffect, useState } from "react";
import { authService, dbService } from "../fbase";
import { updateProfile } from "firebase/auth";
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

const Profile: React.FC = (): ReactElement => {
  const userObj = useSelector((state: stateType) => state.loginProcess.userObj);
  const [displayName, setDisplayName] = useState<string>("");
  const [myReviews, setMyReviews] = useState<Array<any>>([]);
  const ondiplayNameChange = useCallback((e) => {
    setDisplayName(e.target.value);
  }, []);

  const onSubmitClick = useCallback(
    async (e) => {
      e.preventDefault();
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
      <form>
        <input
          placeholder={userObj.displayName}
          value={displayName}
          onChange={ondiplayNameChange}
        />
        <Button text="변경" onClick={onSubmitClick} />
      </form>
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
