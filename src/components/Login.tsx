import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../redux/modules/loginProcess";
import { authService } from "../fbase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const Login: React.FC = () => {
  const dispatch = useDispatch();

  const [formAction, setFormAction] = useState<"login" | "signUp">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordCheck, setPasswordCheck] = useState<string>("");

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (formAction === "login") {
        signInWithEmailAndPassword(authService, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
            dispatch(setLogin(true));
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
          });
      } else if (formAction === "signUp") {
        if (password === passwordCheck) {
          createUserWithEmailAndPassword(authService, email, password)
            .then((userCredential) => {
              const user = userCredential.user;
              console.log(user);
              dispatch(setLogin(true));
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorCode, errorMessage);
            });
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

  const onFormActionClick = useCallback(() => {
    if (formAction === "signUp") {
      setFormAction("login");
    } else if (formAction === "login") {
      setFormAction("signUp");
    }
  }, [formAction]);

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input type="text" onChange={onEmailChange} autoComplete="username" />
        <input
          type="password"
          onChange={onPasswordChange}
          autoComplete="current-password"
        />
        {formAction === "signUp" && (
          <input
            type="password"
            value={passwordCheck}
            onChange={onPasswordCheckChange}
            autoComplete="current-password"
          />
        )}
        <input type="submit" value="Login" />
        <button onClick={onFormActionClick}>
          {formAction === "login" ? "회원가입" : "로그인"}
        </button>
      </form>
    </div>
  );
};

export default Login;
