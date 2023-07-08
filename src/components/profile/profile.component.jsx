import React from "react";
import { useSelector } from "react-redux";

export const Profile = () => {
  const user = useSelector((state) => state.auth.user.user);
  return (
<div style={{ display: "flex", alignItems: "center", marginBottom:"35px" }}>
      <svg
        style={{ display: "inline", marginRight: "15px" }}
        width="57"
        height="57"
        viewBox="0 0 57 57"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="28.5"
          cy="20.25"
          r="8.25"
          stroke="#2C2C2C"
          stroke-width="1.5"
        />
        <circle
          cx="28.5"
          cy="28.5"
          r="27.5"
          stroke="#2C2C2C"
          stroke-width="1.5"
        />
        <path
          d="M44.9151 50.5C44.4775 42.5484 42.0429 36.75 28.4999 36.75C14.9568 36.75 12.5222 42.5484 12.0846 50.5"
          stroke="#2C2C2C"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: "17px",
            fontWeight: "bold",
          }}
        >
  Welcome back, {`${user.name}`}
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: "normal",
          }}
        >
          <span>{`${user.email} - `}</span>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 500,
            }}
          >{`${user.role}`}</span>
          
        </span>
      </div>
    </div>
  );
};
