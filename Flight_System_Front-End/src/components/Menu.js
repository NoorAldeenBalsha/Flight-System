import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import MenuList from "./MenuList";
import SortIcon from "@material-ui/icons/Sort";
import ProductContext from "../context/products/productsContext";
import LoadingContext from "../context/loading/loadingContext";
import SortByAlphaIcon from "@material-ui/icons/SortByAlpha";
import "../styles.css";
import "../mobile.css";
import "animate.css";
import {Toast,FormControl,InputGroup,Container,Row,DropdownButton,Dropdown,Item,Button} from "react-bootstrap";
import CartContext from "../context/cart/cartContext";
import AuthContext from "../context/auth/authContext";
import API from "../api/axios";

const Menu = (props) => {
  const { Loader, loading, setLoading } = useContext(LoadingContext);

  // const [loading, setLoading] = useState(1);
  console.log("Access Token:", localStorage.getItem("accessToken"));
  console.log("Refresh Token:", localStorage.getItem("refreshToken"));
  const {items,search,clearFilter,filtered, sortByName,sortByPrice,loadItems,loading1} = useContext(ProductContext);
  const [filter, setFilter] = useState([]);
  const [text1, setText] = useState("");
  const { total_q, loading2 } = useContext(CartContext);
  const { isAuthenticated, current, displayVerified } = useContext(AuthContext);
  const handleChange = (e) => {
    setText(e.target.value);
    if (e.target.value !== "") {
      search(e.target.value);
      setText(e.target.value);
      setFilter(filtered);
    } else {
      clearFilter();
      setText("");
      setFilter(items);
    }
  };

  const EmailToast = () => {
    return (
      <Toast
        className="animate__animated animate__fadeInRight"
        autohide
        style={{ position: "fixed", right: "0", zIndex: "9899899" }}
      >
        <Toast.Header
          style={{
            background: "red",
            color: "white",
            fontWeight: "bold"
          }}
        >
          <strong className="mr-auto">Not Verified</strong>
          {/* <small>2 seconds ago</small> */}
        </Toast.Header>
        <Toast.Body>Your Email Is Not Verified</Toast.Body>
      </Toast>
    );
  };

useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await API.get("/user/profile", {
          headers: { Authorization: `Bearer ${accessToken} `},
        });
        console.log(accessToken);
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleClick = (e) => {
    setText("");
  };
  const crossIcon = () => {
    if (text1) {
      return (
        <InputGroup.Append>
          <InputGroup.Text>
            <i class="fa fa-times" aria-hidden="true" onClick={handleClick} />
          </InputGroup.Text>
        </InputGroup.Append>
      );
    } else {
      return;
    }
  };
  return (
    <>
      {current === 1 ? (
        // <LoginToast className="animate_animated animate_fadeInRight" />
        <Toast
          className="animate__animated animate__fadeInRight"
          autohide
          style={{ position: "fixed", right: "0", zIndex: "9899899" }}
        >
          <Toast.Header
            style={{
              background: "darkGreen",
              color: "white",
              fontWeight: "bold"
            }}
          >
            <strong className="mr-auto">Success</strong>
            {/* <small>2 seconds ago</small> */}
          </Toast.Header>
          <Toast.Body>You Are Successfully Logged In</Toast.Body>
        </Toast>
      ) : (
        ""
      )}
      {displayVerified === true ? <EmailToast /> : ""}
      <div
        className="mobileNav"
        style={{ position: "sticky", top: "55px", zIndex: "100" }}
      >
        <InputGroup
          style={{ margin: "auto", position: "sticky", top: "70px" }}
          className="mb-3 text1"
        >
          <InputGroup.Prepend>
            <InputGroup.Text>
              <i className="fas fa-search" />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            placeholder="Search Food Items"
            aria-label="Username"
            aria-describedby="basic-addon1"
            value={text1}
            className="searchbar"
            onChange={handleChange}
          />

          {crossIcon()}
        </InputGroup>
      </div>
      {loading1 || loading2 ? (
        <Loader />
      ) : (
        <>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-basic"
                style={{ fontFamily: "Mulish" }}
              >
                Sort <SortIcon />
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ fontFamily: "Mulish" }}>
                <Dropdown.Item
                  onSelect={sortByName}
                  style={{ fontFamily: "Mulish" }}
                >
                  By Name <SortByAlphaIcon />
                </Dropdown.Item>
                <Dropdown.Item
                  onSelect={sortByPrice}
                  style={{ fontFamily: "Mulish" }}
                >
                  By Price
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <Container>
            <Row>
              {filter.length === 0 ? (
                <img
                  style={{
                    width: "50vw",
                    display: "block",
                    margin: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    verticalAlign: "middle",
                    maxHeight: "100%"
                  }}
                  className="noItem"
                  src={require("../images/noItem.png")}
                  alt="noItem"
                />
              ) : (
                filter.map((item) => (
                  <MenuList
                    name={item.name}
                    price={item.price}
                    q={item.q}
                    url={item.url}
                    type={item.type}
                  />
                ))
              )}
            </Row>
          </Container>
          <div
            id="ex2"
            style={{
              position: "fixed",
              right: "0",
              bottom: "0",
              zIndex: "100"
            }}
          >
            <span
              className="fa-stack fa-5x has-badge fa-sm"
              data-count={total_q}
            >
              <Link to="/cart" className="cart-icon">
                <img
                  src="https://image.flaticon.com/icons/svg/630/630746.svg"
                  alt="cart"
                  style={{ height: "14vh" }}
                />
              </Link>
            </span>
          </div>
        </>
      )}
    </>
  );
};
export default Menu;
