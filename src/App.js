import { useState, useEffect, useMemo } from "react";
import "./App.css";
// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import instance from "api";
import routes from "routes";
import { Login } from "./components";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function App() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user);

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  useEffect(() => {
    if (isLoggedIn && user) {
      instance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${user.token}`;
    } else {
      delete instance.defaults.headers.common["Authorization"];
    }
  }, []);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        if (route.protected) {
          return (
            <Route
              exact
              path={route.route}
              element={isLoggedIn ? route.component : <Navigate to="/login" />}
              key={route.key}
            />
          );
        } else {
          return (
            <Route
              exact
              path={route.route}
              element={route.component}
              key={route.key}
            />
          );
        }
      }

      return null;
    });

  return (
    <div className="App">
      <ThemeProvider theme={darkTheme}>
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
          />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;
