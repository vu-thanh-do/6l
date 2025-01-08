import React from "react";
import { Route, Redirect } from "react-router-dom";

const PublicRoute = ({ children, ...rest }) => {
  // Kiểm tra trạng thái đăng nhập
  const checkAuth = () => {
    return localStorage.getItem("client") === null; // Trả về `true` nếu chưa đăng nhập
  };

  return (
    <Route
      {...rest}
      render={({ location }) =>
        checkAuth() ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/home",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default PublicRoute;
