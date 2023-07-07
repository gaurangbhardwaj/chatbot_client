import React from "react";
import VideoChatView from "./ui/d-id-video-stream-chat.component";
import { Form, Input, Button, Checkbox } from "antd";
import { setUser as setUserAction } from "reducers/authSlice";
import { useDispatch } from "react-redux";
import { Profile } from "components";
import "./chat-qna-controller.styled.scss";

export const ChatQnAController = () => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(setUserAction(null));
  };
  return (
    <div className="container">
      <div className="left">
        <div className="flex-col justify-center h-screen">
          <div className="nav-button">
            <Profile />
          </div>
          <div className="nav-button">
            <svg
              style={{ display: "inline", marginRight: "15px" }}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.6644 5.47949L18.6367 9.01041C20.2053 10.4047 20.9896 11.1019 20.9896 12.0001C20.9896 12.8982 20.2053 13.5954 18.6367 14.9897L14.6644 18.5206C13.9484 19.1571 13.5903 19.4753 13.2952 19.3427C13 19.2102 13 18.7312 13 17.7732V15.4286C9.4 15.4286 5.5 17.1429 4 20.0001C4 10.8572 9.33333 8.57148 13 8.57148V6.2269C13 5.2689 13 4.78991 13.2952 4.65735C13.5903 4.5248 13.9484 4.84303 14.6644 5.47949Z"
                stroke="#3C3C3C"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Share Wizard 
          </div>
          <div
            type="primary"
            htmlType="submit"
            className="nav-button"
            onClick={handleLogout}
          >
            <svg
              style={{ display: "inline", marginRight: "15px" }}
              width="20"
              height="19"
              viewBox="0 0 20 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.75 9.5C13.75 9.34375 13.6719 9.1875 13.5547 9.07031L7.92969 3.44531C7.69531 3.21094 7.26562 3.21094 7.03125 3.44531C6.79688 3.67969 6.79688 4.10938 7.03125 4.34375L11.6016 8.875H0.625C0.273438 8.875 0 9.1875 0 9.5C0 9.85156 0.273438 10.125 0.625 10.125H11.6016L7.03125 14.6953C6.79688 14.9297 6.79688 15.3594 7.03125 15.5938C7.26562 15.8281 7.69531 15.8281 7.92969 15.5938L13.5547 9.96875C13.6719 9.85156 13.75 9.69531 13.75 9.5ZM16.875 0.75H13.125C12.7734 0.75 12.5 1.0625 12.5 1.375C12.5 1.72656 12.7734 2 13.125 2H16.875C17.8906 2 18.75 2.85938 18.75 3.875V15.125C18.75 16.1797 17.8906 17 16.875 17H13.125C12.7734 17 12.5 17.3125 12.5 17.625C12.5 17.9766 12.7734 18.25 13.125 18.25H16.875C18.5938 18.25 20 16.8828 20 15.125V3.875C20 2.15625 18.5938 0.75 16.875 0.75Z"
                fill="#3C3C3C"
              />
            </svg>
            Exit / Logout
          </div>
        </div>
      </div>
      <div className="right">
        <VideoChatView />
      </div>
    </div>
  );
};
