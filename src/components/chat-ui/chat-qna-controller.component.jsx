import React from "react";
import VideoChatView from "./ui/d-id-video-stream-chat.component";
import { Form, Input, Button, Checkbox } from "antd";
import { setUser as setUserAction } from "reducers/authSlice";
import { useDispatch } from "react-redux";
import "./chat-qna-controller.styled.scss";
// import logout icon from mui
import LogoutIcon from "@mui/icons-material/Logout";

export const ChatQnAController = () => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(setUserAction(null));
  };
  return (
    <div className="container">
      <div className="left">
        <div className="flex justify-center items-center h-screen">
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            style={{ background: "#1677ff" }}
            onClick={handleLogout}
          >
            <LogoutIcon />
            Exit
          </Button>
        </div>
      </div>
      <div className="right">
        <VideoChatView />
      </div>
    </div>
  );
};
