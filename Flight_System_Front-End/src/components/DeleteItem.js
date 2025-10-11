import React from "react";
import axios from "axios";
import { Toast } from "react-bootstrap";
import "animate.css";

const DeleteItem = ({
  item,
  loading,
  setLoading,
  state,
  display,
  setDisplay,
  increaseCount
}) => {
  const handleClick = async (e) => {
    const formdata = {
      name: item.name
    };
    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    try {
      const res = await axios.post(
        "https://foodeazy.herokuapp.com/admin/items",
        formdata,
        config
      );
      setDisplay({
        val: 1,
        msg: "Successfully Deleted"
      });

      increaseCount();
      const id = setTimeout(() => {
        setDisplay({ val: 0, msg: "" });
        clearTimeout(id);
      }, 3000);
    } catch (e) {
      console.log(e.response);
    }
  };
  return (
    <>
      <div
        className="itemlist animate__animated animate__fadeIn"
        style={{
          height: "15vh",
          border: "1px solid grey",
          margin: "0 auto",
          borderRadius: "0"
        }}
      >
        <div className="img_show2">
          <img
            style={{ width: "100%", height: "90%", borderRadius: "25%" }}
            src={item.url}
            alt="food"
          />
        </div>
        <div className="details">
          <h2 style={{ fontFamily: "Mulish", fontWeight: "bold" }}>
            {item.name}
          </h2>
          <button className="btn1" onClick={handleClick}>
            <i
              class="fas fa-trash"
              style={{ color: "red", fontSize: "2rem" }}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default DeleteItem;
