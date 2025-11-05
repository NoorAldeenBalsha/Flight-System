import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import "../css/flightpage.css";
import Toast from "./toastAnimated";
import { useNavigate } from "react-router-dom";

const FlightsPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [user, setUser] = useState(null);
  const [flights, setFlights] = useState([]);
  const [editingFlight, setEditingFlight] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("accessToken");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [newFlight, setNewFlight] = useState({
    flightNumber: "",
    origin: { en: "" },
    destination: { en: "" },
    departureTime: "",
    arrivalTime: "",
    status: "scheduled",
    revenue: "",
    airlineCode: "",
    aircraftType: "",
    flightType: "international",
    gate: "",
    originLocation: { lat: "", lng: "" },
    destinationLocation: { lat: "", lng: "" },
  });
  //=======================================================================================================
  const handleBookClick = (flight) => {
    navigate("/seat-selection",{state:flight});
  };
  //=======================================================================================================
  // fetchFlights
  const fetchFlights = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/flights/list/getAllTrips", {
        headers: {
          lang: lang,
          Authorization: `Bearer ${token}`,
        },
      });
      setFlights(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching flights:", err);
      setToast({ show: true, message:t("erorr_get_flight") , type: "error" });
    }
  };
  //=======================================================================================================
  // get Location Value For Send
  const getLocationValueForSend = (locObj) => {
  if (!locObj) return { en: "" };
  if (typeof locObj === "string") {
    return lang === "ar" ? { ar: locObj } : { en: locObj };
  }
  const en = locObj.en && String(locObj.en).trim();
  const ar = locObj.ar && String(locObj.ar).trim();

  if (lang === "en") {
    return { en: en || (ar ? ar : "") };
  } else {
    return { ar: ar || (en ? en : "") };
  }
  };
  //=======================================================================================================
  // Fetch the current user data when the component mounts
  useEffect(() => {
      // fetch User
      const fetchUser = async () => {
          try {
            const res = await axios.get(
              "http://localhost:5000/api/user/current-user",
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(res.data);
          } catch (err) {
            console.error("Error fetching user:", err);
          }
      };fetchUser();}, []);
  //=======================================================================================================
  // Get flights
  useEffect(() => {fetchFlights();}, [lang]);
  //=======================================================================================================
  // for open Modal
  const handleEditFlight = (flight) => {
    setEditingFlight({ ...flight });
    setShowModal(true);
  };
  //=======================================================================================================
  // for close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingFlight(null);
  };
  //=======================================================================================================
  // Edit flights
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingFlight((prev) => ({ ...prev, [name]: value }));
  };
  //=======================================================================================================
  // save edit
  const handleSave = async () => {
  try {
    //For Toast Error
    const requiredFields = [
      { key: "flightNumber", label: t("flight_number") },
      { key: "origin", label: t("from") },
      { key: "destination", label: t("to") },
      { key: "departureTime", label: t("flights_departure") },
      { key: "arrivalTime", label:t("flights_arrival") },
      { key: "flightType", label: t("flights_flightType") },
      { key: "gate", label: t("flights_gate") },
      { key: "status", label: t("flights_status") },
    ];

    const emptyFields = requiredFields.filter((f) => {
      if (f.key === "origin") {
        return (
          !editingFlight.origin?.en?.trim() &&
          !editingFlight.origin?.ar?.trim()
        );
      }
      if (f.key === "destination") {
        return (
          !editingFlight.destination?.en?.trim() &&
          !editingFlight.destination?.ar?.trim()
        );
      }
      return !editingFlight[f.key] || String(editingFlight[f.key]).trim() === "";
    });

    if (emptyFields.length > 0) {
      setToast({ show: true, message:t("error_fields")+`\n${emptyFields
          .map((f) => `• ${f.label}`)
          .join("\n")}` , type: "error" });
      return; 
    }
    //======================
    const allowedFields = [
      "flightNumber",
      "origin",
      "destination",
      "departureTime",
      "arrivalTime",
      "status",
      "flightType",
      "gate",
    ];

    const filteredData = {};

    allowedFields.forEach((field) => {
      if (editingFlight[field] !== undefined && editingFlight[field] !== null) {
        filteredData[field] = editingFlight[field];
      }
    });
    // Fix origin and destination to be objects according to the language
    if (typeof editingFlight.origin === "string") {
      filteredData.origin = {
        [lang]: editingFlight.origin,
      };
    }

    if (typeof editingFlight.destination === "string") {
      filteredData.destination = {
        [lang]: editingFlight.destination,
      };
    }

    await axios.patch(
      `http://localhost:5000/api/flights/${editingFlight._id}`,
      filteredData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setFlights((prev) =>
      prev.map((f) => (f._id === editingFlight._id ? { ...f, ...filteredData } : f))
    );

    closeModal();
    setToast({ show: true, message:t("flights_update_success") , type: "success" });
  } catch (err) {
      console.log("Error update flight:", err)
    setToast({ show: true, message:t("flights_update_error") , type: "error" });
  }
  };
  //=======================================================================================================
  //Create Flight
  const handleCreateFlight = async () => {
  try {
    //For Toast Error
    const requiredFields = [
      { key: "flightNumber", label: t("flight_number") },
      { key: "origin", label: t("from") },
      { key: "destination", label: t("to") },
      { key: "departureTime", label: t("flights_departure") },
      { key: "arrivalTime", label:t("flights_arrival") },
      { key: "flightType", label: t("flights_flightType") },
      { key: "gate", label: t("flights_gate") },
      { key: "status", label: t("flights_status") },
      { key: "airlineCode", label:t("airlineCode") },
      { key: "revenue", label:t("revenue") },
      { key: "aircraftType", label: t("flights_aircraft") },
    ];

    const emptyFields = requiredFields.filter((f) => {
      if (f.key === "origin") {
        return (
          !newFlight.origin?.en?.trim() &&
          !newFlight.origin?.ar?.trim()
        );
      }
      if (f.key === "destination") {
        return (
          !newFlight.destination?.en?.trim() &&
          !newFlight.destination?.ar?.trim()
        );
      }
      return !newFlight[f.key] || String(newFlight[f.key]).trim() === "";
    });

    if (emptyFields.length > 0) {
      setToast({ show: true, message:t("error_fields")+`\n${emptyFields
          .map((f) => `• ${f.label}`)
          .join("\n")}` , type: "error" });
      return; 
    }
    //======================
    const departureISO = newFlight.departureTime
      ? new Date(newFlight.departureTime).toISOString()
      : undefined;
    const arrivalISO = newFlight.arrivalTime
      ? new Date(newFlight.arrivalTime).toISOString()
      : undefined;

    const originForSend = getLocationValueForSend(newFlight.origin);
    const destinationForSend = getLocationValueForSend(newFlight.destination);

    const payload = {
      flightNumber: newFlight.flightNumber,
      origin: originForSend,           
      destination: destinationForSend, 
      departureTime: departureISO,
      arrivalTime: arrivalISO,
      status: newFlight.status,
      revenue: newFlight.revenue ? Number(newFlight.revenue) : undefined,
      airlineCode: newFlight.airlineCode || undefined,
      aircraftType: newFlight.aircraftType || undefined,
      flightType: newFlight.flightType || undefined,
      gate: newFlight.gate || undefined,
      originLocation: {
        lat: newFlight.originLocation.lat ? Number(newFlight.originLocation.lat) : undefined,
        lng: newFlight.originLocation.lng ? Number(newFlight.originLocation.lng) : undefined,
      },
      destinationLocation: {
        lat: newFlight.destinationLocation.lat ? Number(newFlight.destinationLocation.lat) : undefined,
        lng: newFlight.destinationLocation.lng ? Number(newFlight.destinationLocation.lng) : undefined,
      },
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === "") delete payload[k];
    });
    if (payload.
  originLocation) {
      if (payload.originLocation.lat === undefined && payload.originLocation.lng === undefined) delete payload.originLocation;
    }
    if (payload.destinationLocation) {
      if (payload.destinationLocation.lat === undefined && payload.destinationLocation.lng === undefined) delete payload.destinationLocation;
    }

    console.log("Creating flight payload:", payload);

    await axios.post("http://localhost:5000/api/flights/create", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        lang: lang,
      },
    });

    setToast({ show: true, message:t("flights_create_success") , type: "success" });
    setShowCreateForm(false);
    setNewFlight({
      flightNumber: "",
      origin: { en: "", ar: "" },
      destination: { en: "", ar: "" },
      departureTime: "",
      arrivalTime: "",
      status: "",
      revenue: "",
      airlineCode: "",
      aircraftType: "",
      flightType: "",
      gate: "",
      originLocation: { lat: "", lng: "" },
      destinationLocation: { lat: "", lng: "" },
    });

    await fetchFlights();
  } catch (err) {
    console.error("Error create flight:", err);
    setToast({ show: true, message:t("flights_create_error") , type: "error" });
  }
  };
  //=======================================================================================================
  // Delete Flight
  const handleDelete = async (flightId) => {
    try {
      await axios.delete(`http://localhost:5000/api/flights/${flightId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFlights((prev) => prev.filter((f) => f._id !== flightId));
    setToast({ show: true, message:t("flights_delete_success") , type: "success" });
    } catch (err) {
      console.error("Error deleting flight:", err);
    setToast({ show: true, message:t("flights_delete_error") , type: "error" });
    }
  };
  //=======================================================================================================
  return (
    <>
    {toast.show && (
              <Toast 
              show={toast.show}message={toast.message}type={toast.type}onClose={() => setToast({ ...toast, show: false })}/>
    )}
    <div className={`flights-page ${lang === "ar" ? "rtl" : "ltr"}`}>
        <h1>{t("flights_title")}</h1>
        <p>{t("flights_subtitle")}</p>
    {/* ===== Flights List Section ===== */}
    {!showCreateForm && (
      <section className="flights-list">
        {flights.length > 0 ? (
          flights.map((flight) => (
            <div className="flight-card" key={flight._id}>
              <div className="flight-card-header">
                <div className="flight-number">
                  <h3>{flight.flightNumber}</h3>
                  <span className={`status ${flight.status}`}>
                    {t(`flights_${flight.status}`)}
                  </span>
                </div>
                <p className="airline">
                  {flight.airlineCode?.toUpperCase()} — {flight.aircraftType}
                </p>
              </div>

              <div className="flight-route">
                <div className="route">
                  <h4>{typeof flight.origin === "object" ? flight.origin[lang] : flight.origin}</h4>
                  <p>{t("from")}</p>
                </div>
                <div className="route-icon"></div>
                <div className="route">
                  <h4>{typeof flight.destination === "object" ? flight.destination[lang] : flight.destination}</h4>
                  <p>{t("to")}</p>
                </div>
              </div>

              <div className="flight-details">
                <div>
                  <strong>{t("flights_departure")}:</strong>{" "}
                  {new Date(flight.departureTime).toLocaleString(lang)}
                </div>
                <div>
                  <strong>{t("flights_arrival")}:</strong>{" "}
                  {new Date(flight.arrivalTime).toLocaleString(lang)}
                </div>
                <div>
                  <strong>{t("flights_gate")}:</strong> {flight.gate}
                </div>
                <div>
                  <strong>{t("revenue")}:</strong> ${flight.revenue}
                </div>
              </div>

              <div className="flight-actions">
                <button className="book-btn" onClick={() => handleBookClick(flight)}>
                  {t("book_now")}
                </button>

                {user?.role === "admin" && (
                  <>
                    <button className="edit-btn" onClick={() => handleEditFlight(flight._id)}>
                      {t("edit_flight")}
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(flight._id)}>
                      {t("delete_flight")}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-flights">{t("flights_no_available")}</p>
        )}

        {user?.role === "admin" && (
          <div className="add-flight">
            <button className="create-flight-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
              {t("flights_create_button")}
            </button>
          </div>
        )}
      </section>
    )}

      {/* Form Edit Flight */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2>{t("edit_flight_title")}</h2>
            {/* flight number */}
            <div className="modal-form">
              <label>{t("flight_number")}</label>
              <input
                type="text"
                name="flightNumber"
                value={editingFlight.flightNumber || ""}
                onChange={handleChange}
              />
              {/* origin */}
              <label>{t("from")}</label>
              <input
                type="text"
                name="origin"
                value={
                  typeof editingFlight.origin === "object"
                    ? editingFlight.origin[lang]
                    : editingFlight.origin
                }
                onChange={handleChange}
              />
              {/* destination */}
              <label>{t("to")}</label>
              <input
                type="text"
                name="destination"
                value={
                  typeof editingFlight.destination === "object"
                    ? editingFlight.destination[lang]
                    : editingFlight.destination
                }
                onChange={handleChange}
              />
              {/* departure time */}
              <label>{t("flights_departure")}</label>
              <input
                type="datetime-local"
                name="departureTime"
                value={editingFlight.departureTime?.slice(0, 16) || ""}
                onChange={handleChange}
              />
              {/* arrival time */}
              <label>{t("flights_arrival")}</label>
              <input
                type="datetime-local"
                name="arrivalTime"
                value={editingFlight.arrivalTime?.slice(0, 16) || ""}
                onChange={handleChange}
              />
              {/* status */}
              <label>{t("flights_status")}</label>
              <select name="status" value={editingFlight.status } onChange={handleChange}>
                  <option value="scheduled">{t("flights_scheduled") || "scheduled"}</option>
                  <option value="boarding">{t("flights_boarding") || "boarding"}</option>
                  <option value="delayed">{t("flights_delayed") || "delayed"}</option>
                  <option value="completed">{t("flights_completed") || "completed"}</option>
                  <option value="cancelled">{t("flights_cancelled") || "cancelled"}</option>
                </select>

              {/* flightType */}
              <label>{t("flights_flightType")}</label>
              <select name="flightType" value={editingFlight.flightType } onChange={handleChange}>
                  <option value="domestic">{t("flights_domestic") || "domestic"}</option>
                  <option value="international">{t("flights_international") || "international"}</option>
              </select>
              {/* gate */}
              <label>{t("flights_gate")}</label>
              <input
                type="text"
                name="gate"
                value={editingFlight.gate || ""}
                onChange={handleChange}
              />
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>
                {t("save")}
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Create Fligh t*/}
      {showCreateForm && (
        <div>
          <div className="create-flight-form">
          <h2>{t('create_new_flight')}</h2>
          {/* Flight Number */}
          <div className="form-group">
            <label> {t('flight_number')}</label>
            <input
              type="text"
              value={newFlight.flightNumber}
              onChange={(e) =>
                setNewFlight({ ...newFlight, flightNumber: e.target.value })
              }
            />
          </div>
          {/* Origin */}   
          <div className="form-group">
            <label>{t('from')}</label>
            <input
              type="text"
              value={newFlight.origin.en}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  origin: { en: e.target.value },
                })
              }
            />
          </div>
          {/* Destination */}
          <div className="form-group">
            <label>{t('to')}</label>
            <input
              type="text"
              value={newFlight.destination.en}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  destination: { en: e.target.value },
                })
              }
            />
          </div>
          {/* Departure Time */}
          <div className="form-group">
            <label>{t('flights_departure')}</label>
            <input
              type="datetime-local"
              value={newFlight.departureTime}
              onChange={(e) =>
                setNewFlight({ ...newFlight, departureTime: e.target.value })
              }
            />
          </div>
          {/* Arrival Time */}
          <div className="form-group">
            <label>{t('flights_arrival')}</label>
            <input
              type="datetime-local"
              value={newFlight.arrivalTime}
              onChange={(e) =>
                setNewFlight({ ...newFlight, arrivalTime: e.target.value })
              }
            />
          </div>
          {/* status */}
          <div className="form-group">
            <label>{t('flights_status')}</label>
            <select name="status" value={newFlight.status } onChange={(e) =>
                setNewFlight({ ...newFlight, status: e.target.value })}>
                  <option value="scheduled">{t("flights_scheduled") || "scheduled"}</option>
                  <option value="boarding">{t("flights_boarding") || "boarding"}</option>
                  <option value="delayed">{t("flights_delayed") || "delayed"}</option>
                  <option value="completed">{t("flights_completed") || "completed"}</option>
                  <option value="cancelled">{t("flights_cancelled") || "cancelled"}</option>
                </select>
          </div>
          {/* flightType */}
          <div className="form-group">
            <label>{t("flights_flightType")}</label>
              <select name="flightType" value={newFlight.flightType }onChange={(e) =>
                setNewFlight({ ...newFlight, flightType: e.target.value })}>
                  <option value="domestic">{t("flights_domestic") || "domestic"}</option>
                  <option value="international">{t("flights_international") || "international"}</option>
            </select>
          </div>
          {/*revenue*/}
          <div className="form-group">
            <label>{t('revenue')}</label>
            <input
              type="number"
              value={newFlight.revenue}
              onChange={(e) =>
                setNewFlight({ ...newFlight, revenue: e.target.value })
              }
            />
          </div>
          {/*Airline Code*/}
          <div className="form-group">
            <label> {t('airlineCode')}</label>
            <input
              type="text"
              value={newFlight.airlineCode}
              onChange={(e) =>
                setNewFlight({ ...newFlight, airlineCode: e.target.value })
              }
            />
          </div>
          {/*Aircraft Type*/}
          <div className="form-group">
            <label>{t('flights_aircraft')}</label>
              <select name="aircraftType" value={newFlight.aircraftType }onChange={(e) =>
                setNewFlight({ ...newFlight, aircraftType: e.target.value })}>
                  <option value="boeing 777">Boeing 777</option>
                  <option value="airbus a320">Airbus a320</option>
                  <option value="boeing 737">Boeing 737</option>
            </select>
          </div>
          {/*Gate*/}
          <div className="form-group">
            <label>{t('flights_gate')}</label>
            <input
              type="text"
              value={newFlight.gate}
              onChange={(e) =>
                setNewFlight({ ...newFlight, gate: e.target.value })
              }
            />
          </div>
          {/*origin Location*/}
          <div className="form-group">
            <label> {t('originLocation')}</label>
            <input
              type="text"placeholder="lat"
              value={newFlight.originLocation.lat}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  originLocation: {
                    ...newFlight.originLocation,
                    lat: e.target.value,
                  },
                })
              }
            />
            <input
              type="text"
              placeholder="lng"
              value={newFlight.originLocation.lng}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  originLocation: {
                    ...newFlight.originLocation,
                    lng: e.target.value,
                  },
                })
              }
            />
          </div>
          {/*destination Location*/}
          <div className="form-group">
            <label> {t('destinationLocation')}</label>
            <input
              type="text"
              placeholder="lat"
              value={newFlight.destinationLocation.lat}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  destinationLocation: {
                    ...newFlight.destinationLocation,
                    lat: e.target.value,
                  },
                })
              }
            />
            <input
              type="text"
              placeholder="lng"
              value={newFlight.destinationLocation.lng}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  destinationLocation: {
                    ...newFlight.destinationLocation,
                    lng: e.target.value,
                  },
                })
              }
            />
          </div>

          <button  className='create-flight-btn' onClick={handleCreateFlight}>{t('saveFlight')}</button>
        </div>
        <div className="flights-header">
          {user?.role === "admin" && (
            <button className="create-flight-btn" onClick={() => setShowCreateForm(!showCreateForm) } >
              {t("flights_go_back_button")}
            </button>
          )}
        </div>
        </div>
      )}

       
    </div>
    </>
  );
};

export default FlightsPage;