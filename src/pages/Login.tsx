import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../redux/modules/loginProcess";
import { authService } from "../fbase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Button from "../components/Button";

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
    async (e) => {
      e.preventDefault();
      if (formAction === "login") {
        await signInWithEmailAndPassword(authService, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
            dispatch(
              setLogin(true, {
                displayName: user.displayName ? user.displayName : "익명",
                uid: user.uid,
              })
            );
          })
          .catch((error) => {
            setAlert(error.message);
          });
      } else if (formAction === "signUp") {
        if (password === passwordCheck) {
          await createUserWithEmailAndPassword(authService, email, password)
            .then((userCredential) => {
              const user = userCredential.user;
              console.log(user);
              dispatch(
                setLogin(true, {
                  displayName: user.displayName ? user.displayName : "익명",
                  uid: user.uid,
                })
              );
            })
            .catch((error) => {
              setAlert(error.message);
            });
        }
      } else if (formAction === "findPw") {
        console.log("findPw");
        try {
          sendPasswordResetEmail(authService, email).then(() => {
            setAlert("메일이 발송되었습니다.");
          });
        } catch (error) {
          setAlert(error);
        }
      }
    },
    [email, password, dispatch, formAction, passwordCheck]
  );

  const onEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  const onPasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const onPasswordCheckChange = useCallback((e) => {
    setPasswordCheck(e.target.value);
  }, []);

  const onFormChangeClick = useCallback(
    (e) => {
      e.preventDefault();
      if (formAction === "login") {
        setFormAction("signUp");
      } else {
        setFormAction("login");
      }
    },
    [formAction]
  );

  const onFindPwBtnClick = useCallback((e) => {
    e.preventDefault();
    setFormAction("findPw");
  }, []);

  return (
    <div>
      <h1>Login</h1>
      <div>{alert}</div>
      <form onSubmit={onSubmit}>
        <input type="text" onChange={onEmailChange} autoComplete="username" />
        {formAction !== "findPw" && (
          <input
            type="password"
            onChange={onPasswordChange}
            autoComplete="current-password"
          />
        )}
        {formAction === "signUp" && (
          <input
            type="password"
            value={passwordCheck}
            onChange={onPasswordCheckChange}
            autoComplete="current-password"
          />
        )}
        <Button
          text={
            formAction === "login"
              ? "로그인"
              : formAction === "findPw"
              ? "재설정 메일 발송"
              : "회원가입"
          }
        />
        <div>
          <Button
            text={formAction === "login" ? "회원가입" : "돌아가기"}
            onClick={onFormChangeClick}
          />
          <Button onClick={onFindPwBtnClick} text="비밀번호 재설정" />
        </div>
      </form>
    </div>
  );
};

export default Login;
