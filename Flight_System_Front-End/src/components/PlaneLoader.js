import "../css/planeLoader.css";

const PlaneLoader = () => {
  return (
    <div className="plane-loader-wrapper">
      <div className="sky">
        <div className="cloud c1"></div>
        <div className="cloud c2"></div>
        <div className="cloud c3"></div>

        <div className="plane">
          <div className="body"></div>
          <div className="wing"></div>
          <div className="tail"></div>
        </div>

        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};

export default PlaneLoader;
