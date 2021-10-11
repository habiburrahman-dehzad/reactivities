import { observer } from "mobx-react-lite";
import React from "react";
import { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import { RootStoreContext } from "../stores/rootStore";

const PrivateRoute = ({ Component, ...rest }) => {
  const rootStore = useContext(RootStoreContext);
  const { isLoggedIn } = rootStore.userStore;

  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? <Component {...props} /> : <Redirect to={"/"} />
      }
    />
  );
};

export default observer(PrivateRoute);
