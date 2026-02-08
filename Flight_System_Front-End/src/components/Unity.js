import React from "react";

const Unity = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="/unity/index.html"
        title="Unity Game"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          frameborder: "0",
        }}
        allow="fullscreen"
      />
    </div>
  );
};

export default Unity;
