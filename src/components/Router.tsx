import { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Loading from "../pages/Loading";
import Profile from "../pages/Profile";
import { RouterPropType } from "../types";
import Nav from "./Nav";

const Router: React.FC<RouterPropType> = ({ init }): ReactElement => {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/*" element={init ? <Home /> : <Loading />} />
      </Routes>
    </>
  );
};

export default Router;