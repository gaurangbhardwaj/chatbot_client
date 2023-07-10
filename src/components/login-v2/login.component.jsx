import * as React from "react";
import { useEffect, useState } from "react";
// Redux API
import { useDispatch } from "react-redux";
import { setUser as setUserAction } from "reducers/authSlice";
// Material UI
import { createTheme, ThemeProvider } from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
// libs
import { useRive, useStateMachineInput } from "rive-react";
// APIs
import { loginUser } from "api";
// Styles
import "./login.style.scss";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const STATE_MACHINE_NAME = "State Machine 1";

export const Login = () => {
  const dispatch = useDispatch();

  // Rive setup
  const { rive, RiveComponent } = useRive({
    src: "520-990-teddy-login-screen.riv",
    autoplay: true,
    stateMachines: STATE_MACHINE_NAME,
  });
  const stateSuccess = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    "success"
  );
  const stateFail = useStateMachineInput(rive, STATE_MACHINE_NAME, "fail");
  const stateHandUp = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    "hands_up"
  );

  const stateCheck = useStateMachineInput(rive, STATE_MACHINE_NAME, "Check");
  const stateLook = useStateMachineInput(rive, STATE_MACHINE_NAME, "Look");

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSignIn = async (email = "", password = "") => {
    try {
      const response = await loginUser(email, password);
      stateSuccess.fire();
      setTimeout(
        () =>
          dispatch(
            setUserAction({ user: response.user, token: response.token })
          ),
        1000
      );
    } catch (error) {
      stateFail.fire();
      setLoginError(
        error?.response?.data?.message ||
          "Unable to login, please retry after sometime"
      );
    } finally {
      setIsLogging(false);
    }
  };

  const setLook = () => {
    if (!stateLook || !stateCheck || !setHangUp) {
      return;
    }
    setHangUp(false);
    setCheck(true);
    let nbChars = 0;
    if (user) {
      nbChars = parseFloat(user.split("").length);
    }
    let ratio = nbChars / parseFloat(41);
    let lookToSet = ratio * 100 - 25;
    stateLook.value = Math.round(lookToSet);
  };

  useEffect(() => {
    setLook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    setLoginError("");
  }, [user, password]);

  const setHangUp = (hangUp) => {
    stateHandUp && (stateHandUp.value = hangUp);
  };

  const setCheck = (check) => {
    if (stateCheck) {
      stateCheck.value = check;
    }
  };

  const setToDefaultLook = () => {
    setHangUp(false);
    setCheck(false);
    let nbChars = 0;
    let ratio = nbChars / parseFloat(41);
    let lookToSet = ratio * 100 - 25;
    stateLook.value = Math.round(lookToSet);
  };

  if (rive) {
    // console.log(rive.contents);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setToDefaultLook();
    setIsLogging(true);
    setTimeout(() => handleSignIn(user, password), 1000);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container component="main" maxWidth="xs" className="login-container">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            height: "85vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="login-container__rive-container">
            <RiveComponent
              style={{ width: "300px", height: "300px", borderRadius: "50%" }}
              src="520-990-teddy-login-screen.riv"
            />
          </div>
          <Typography className="pt-4" component="h1" variant="h5">
            Welcome to{" "}
            Sleek{" "}
            {/* <img
              src={require("assets/images/sleek_logo.png")}
              style={{ display: "inline-block", height: "44px" }}
              alt="sleek_logo"
            />{" "} */}
            Wizard 🪄
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              onChange={(event) => setUser(event.target.value)}
              onBlur={setToDefaultLook}
              value={user}
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />

            <TextField
              onChange={(event) => setPassword(event.target.value)}
              onFocus={() => setHangUp(true)}
              onBlur={setToDefaultLook}
              //onE
              value={password}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />

            <LoadingButton
              onBlur={setToDefaultLook}
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!user || !password}
              loading={isLogging}
            >
              Sign In
            </LoadingButton>

            {loginError && <Alert severity="error">{loginError}</Alert>}
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
};
