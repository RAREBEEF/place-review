import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../redux/modules/loginProcess";
import { authService } from "../fbase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
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

  // 이메일 입력
  const onEmailChange = useCallback((e): void => {
    setEmail(e.target.value);
  }, []);

  // 비밀번호 입력
  const onPasswordChange = useCallback((e): void => {
    setPassword(e.target.value);
  }, []);

  // 비밀번호 확인 입력
  const onPasswordCheckChange = useCallback((e): void => {
    setPasswordCheck(e.target.value);
  }, []);

  // 모드 변경(로그인 / 회원가입)
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

  // 비밀번호 재설정 버튼 클릭
  const onFindPwBtnClick = useCallback((e): void => {
    e.preventDefault();

    setFormAction("findPw");
  }, []);

  // 소셜 로그인 클릭(리다이렉트)
  const onGoogleClick = useCallback((e): void => {
    e.preventDefault();

    const provider = new GoogleAuthProvider();

    signInWithPopup(authService, provider);
  }, []);

  // 전송
  const onSubmit = useCallback(
    async (e): Promise<void> => {
      e.preventDefault();

      // 로그인
      if (formAction === "login") {
        let isTest = false;

        if (email.length === 0) {
          setAlert("이메일을 입력해주세요.");
          return;
        } else if (password.length === 0) {
          setAlert("비밀번호를 입력해주세요.");
          return;
        }

        if (email === "test" && password === "test") {
          isTest = true;
        }

        await signInWithEmailAndPassword(
          authService,
          isTest ? "test@test.com" : email,
          isTest ? "test@test.com" : password
        )
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
            if (error.code === "auth/invalid-email") {
              setAlert("유효하지 않은 이메일입니다.");
            } else if (error.code === "auth/wrong-password") {
              setAlert("비밀번호를 잘못 입력하셨습니다.");
            } else {
              setAlert(error.message);
            }
          });

        // 회원가입
      } else if (formAction === "signUp") {
        if (email.length === 0) {
          setAlert("이메일을 입력해주세요.");
          return;
        } else if (password.length === 0) {
          setAlert("비밀번호를 입력해주세요.");
          return;
        } else if (passwordCheck.length === 0) {
          setAlert("비밀번호 확인을 입력해주세요.");
          return;
        } else if (passwordCheck !== password) {
          setAlert("비밀번호 확인이 일치하지 않습니다.");
          return;
        }

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
            if (error.code === "auth/invalid-email") {
              setAlert("유효하지 않은 이메일입니다.");
            } else if (error.code === "auth/weak-password") {
              setAlert("비밀번호는 최소 6자 이상이어야 합니다.");
            } else if (error.code === "auth/email-already-in-use") {
              setAlert("이미 사용 중인 이메일입니다.");
            } else {
              setAlert(error.message);
            }
          });

        // 비밀번호 재설정
      } else if (formAction === "findPw") {
        await sendPasswordResetEmail(authService, email)
          .then((): void => {
            setAlert("메일이 발송되었습니다.");
          })
          .catch((error): void => {
            if (error.code === "auth/missing-email") {
              setAlert("이메일을 입력해주세요.");
            } else if (error.code === "auth/invalid-email") {
              setAlert("유효하지 않은 이메일입니다.");
            }
          });
      }
    },
    [email, password, dispatch, formAction, passwordCheck]
  );

  return (
    <div className={styles.container}>
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
