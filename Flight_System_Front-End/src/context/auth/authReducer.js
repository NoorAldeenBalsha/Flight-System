export default (state, action) => {
  switch (action.type) {
    case "DISPLAY_VERIFIED":
      return { ...state, displayVerified: action.payload };
    case "REGISTER_SUCCESS":
      return { ...state, isAuthenticated: true };
    case "REGISTER_FAIL":
      return { ...state, errors: action.payload };
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true };
    case "LOGIN_FAIL":
      return { ...state, errors: action.payload };
      case "LOGOUT":
      return { ...state, token: null,isAccountVerified: false,user: null };
    default:
      return state;
  }
};