import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../redux/modules/loginProcess";
import { authService } from "../fbase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithRedirect,
} from "firebase/auth";
import Button from "../components/Button";
import { GoogleAuthProvider } from "firebase/auth";
import styles from "./Login.module.scss";
import logo from "../images/logo.png";

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const [formAction, setFormAction] = useState<"login" | "signUp" | "findPw">(
    "login"
  );
  const [alert, setAlert] = useState<any>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordCheck, setPasswordCheck] = useState<string>("");

  const onSubmit = useCallback(
    async (e): Promise<void> => {
      e.preventDefault();

      if (formAction === "login") {
        await signInWithEmailAndPassword(authService, email, password)
          .then((userCredential) => {
            const user = userCredential.user;

            dispatch(
              setLogin(true, {
                displayName: user.displayName ? user.displayName : "익명",
                uid: user.uid,
              })
            );
          })
          .catch((error): void => {
            setAlert(error.message);
          });
      } else if (formAction === "signUp") {
        if (password === passwordCheck) {
          await createUserWithEmailAndPassword(authService, email, password)
            .then((userCredential) => {
              const user = userCredential.user;

              dispatch(
                setLogin(true, {
                  displayName: user.displayName ? user.displayName : "익명",
                  uid: user.uid,
                })
              );
            })
            .catch((error): void => {
              setAlert(error.message);
            });
        }
      } else if (formAction === "findPw") {
        try {
          sendPasswordResetEmail(authService, email).then((): void => {
            setAlert("메일이 발송되었습니다.");
          });
        } catch (error) {
          setAlert(error);
        }
      }
    },
    [email, password, dispatch, formAction, passwordCheck]
  );

  const onEmailChange = useCallback((e): void => {
    setEmail(e.target.value);
  }, []);

  const onPasswordChange = useCallback((e): void => {
    setPassword(e.target.value);
  }, []);

  const onPasswordCheckChange = useCallback((e): void => {
    setPasswordCheck(e.target.value);
  }, []);

  const onFormChangeClick = useCallback(
    (e): void => {
      e.preventDefault();
      if (formAction === "login") {
        setFormAction("signUp");
      } else {
        setFormAction("login");
      }
    },
    [formAction]
  );

  const onFindPwBtnClick = useCallback((e): void => {
    e.preventDefault();

    setFormAction("findPw");
  }, []);

  const onGoogleClick = useCallback((e): void => {
    e.preventDefault();

    const provider = new GoogleAuthProvider();

    signInWithRedirect(authService, provider);
  }, []);

  return (
    <div className={styles.container}>
      {/* <h1 className={styles.logo}>
        <span className={styles["logo__place"]}>Place</span>
        <span className={styles["logo__review"]}>Review</span>
      </h1> */}
      <div className={styles["logo-wrapper"]}>
        <img className={styles.logo} src={logo} alt="Place review" />
      </div>

      <form onSubmit={onSubmit} className={styles.form}>
        <input
          className={styles["input--email"]}
          type="text"
          onChange={onEmailChange}
          placeholder="이메일"
          autoComplete="email"
        />
        {formAction !== "findPw" && (
          <input
            className={styles["input--password"]}
            type="password"
            onChange={onPasswordChange}
            autoComplete="current-password"
            placeholder="비밀번호"
          />
        )}
        {formAction === "signUp" && (
          <input
            className={styles["input--password-check"]}
            type="password"
            value={passwordCheck}
            onChange={onPasswordCheckChange}
            autoComplete="current-password"
            placeholder="비밀번호 확인"
          />
        )}
        <div className={styles.alert}>{alert}</div>
        <Button
          className={["Login__submit"]}
          text={
            formAction === "login"
              ? "로그인"
              : formAction === "findPw"
              ? "재설정 메일 발송"
              : "회원가입"
          }
        />
      </form>
      <div className={styles["btn-wrapper"]}>
        <Button
          text={formAction === "login" ? "회원가입" : "돌아가기"}
          onClick={onFormChangeClick}
          className={["Login__form-change"]}
        />
        <Button
          onClick={onFindPwBtnClick}
          text="비밀번호 재설정"
          className={["Login__reset-pw"]}
        />
        <div className={styles["social"]}>
          <Button
            text="Continue with Google"
            onClick={onGoogleClick}
            className={["Login__google"]}
          />
        </div>
      </div>
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()}. RAREBEEF All Rights Reserved.
      </footer>
    </div>
  );
};

export default Login;
