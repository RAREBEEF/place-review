import { ReactElement } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Error from "../pages/Error";
import Home from "../pages/Home";
import Loading from "../pages/Loading";
import Profile from "../pages/Profile";
import { RouterPropType } from "../types";
import Nav from "./Nav";

const Router: React.FC<RouterPropType> = ({ init }): ReactElement => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Nav />
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/*" element={init ? <Home /> : <Loading />} />
        <Route element={<Error />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
