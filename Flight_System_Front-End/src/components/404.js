import React from "react";
const NotFound = () => {
  return (
    <div>
      <img
        style={{
          display: "block",
          width: "75%",
          height: "95vh",
          margin: "auto"
        }}
        src={require("../images/404.jpg")}
        alt="404"
      />
    </div>
  );
};
export default NotFound;
