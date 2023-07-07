import { Form, Input, Button, Checkbox } from "antd";
import { loginUser, loginUserWithGoogle } from "api";
import { setUser as setUserAction } from "reducers/authSlice";
import { useDispatch } from "react-redux";
import "./login.styled.scss";

export const Login = () => {
  const dispatch = useDispatch();
  const onFinish = (values) => {
    console.log("Success:", values);
    console.log("Success:", values);
    handleSignIn(values.username, values.password);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleSignIn = async (email = "", password = "") => {
    try {
      const response = await loginUser(email, password);
      console.log("Success:", response);
      // update store with user and token
      dispatch(setUserAction({ user: response.user, token: response.token }));
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="illustration-wrapper">
          <img
            // src="https://mixkit.imgix.net/art/preview/mixkit-left-handed-man-sitting-at-a-table-writing-in-a-notebook-27-original-large.png?q=80&auto=format%2Ccompress&h=700"
            src={require("assets/images/login_illustration.png")}
            alt="Login"
          />
        </div>
        <Form
          name="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <p className="form-title">
            Welcome to{" "}
            <img
              src={require("assets/images/sleek_logo.png")}
              style={{ display: "inline-block", height: "44px" }}
              alt="sleek_logo"
            />{" "}
            Wizard 🪄
            {/* <p className="form-title">Welcome to Sl<span style={{color:"#1677ff"}}>e</span><span style={{color:"#1677ff"}}>e</span>k 🪄 Wizard */}
          </p>
          <p>Login to the Dashboard with your Sleek Id</p>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter your Sleek email id" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              style={{ background: "#1677ff" }}
            >
              LOGIN
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
