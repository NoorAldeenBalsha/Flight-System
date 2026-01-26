import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import "../css/flightpage.css";
import Toast from "./toastAnimated";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { apiFetch } from "../services/apiFetch.js";

const FlightsPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [user, setUser] = useState(null);
  const [flights, setFlights] = useState([]);
  const [editingFlight, setEditingFlight] = useState();
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
  });
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    status: "",
  });
  const airports = [
  { en: "Aleppo International Airport", ar: "مطار حلب الدولي" },
  { en: "Damascus International Airport", ar: "مطار دمشق الدولي" },
  { en: "Latakia International Airport", ar: "مطار اللاذقية الدولي" },
  { en: "Deir ez-Zor International Airport", ar: "مطار دير الزور الدولي" },
  { en: "Qamishli International Airport", ar: "مطار القامشلي الدولي" }
];
  //=======================================================================================================
  const handleBookClick = (flight) => {
    navigate("/seat-selection",{state:flight});
  };
  //=======================================================================================================
  // Fetch the current user data when the component mounts
  useEffect(() => {
      // fetch User
      const fetchUser = async () => {
          try {
            const res = await API.get(
              "/user/current-user",
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
  // for open Modal and send _id 
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
      { key: "departureTime", label: t.flights_departure },
      { key: "arrivalTime", label:t.flights_arrival },
      { key: "gate", label: t.flights_gate },
      { key: "status", label: t.flights_status },
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
      setToast({ show: true, message:t.error_fields+`\n${emptyFields
          .map((f) => `• ${f.label}`)
          .join("\n")}` , type: "error" });
      return; 
    }
        //======================
    const departureISO = editingFlight.departureTime
      ? new Date(editingFlight.departureTime).toISOString()
      : undefined;
    const arrivalISO = editingFlight.arrivalTime
      ? new Date(editingFlight.arrivalTime).toISOString()
      : undefined;

    const filteredData = {
      flightNumber: editingFlight.flightNumber,
      origin: {en:editingFlight.origin},           
      destination: {en:editingFlight.destination}, 
      departureTime: departureISO,
      arrivalTime: arrivalISO,
      status: editingFlight.status,
      gate: editingFlight.gate || undefined,
    };

    console.log("Editing flight payload:", filteredData);
    

    await axios.patch(
      `http://localhost:5000/api/flights/${editingFlight._id}`,
      filteredData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` ,
          lang: lang,
        },
      }
    );

    setFlights((prev) =>
      prev.map((f) => (f._id === editingFlight._id ? { ...f, ...filteredData } : f))
    );

    closeModal();
    setToast({ show: true, message:t.flights_update_success , type: "success" });
  } catch (err) {
      console.log("Error update flight:", err)
    setToast({ show: true, message:t.flights_update_error , type: "error" });
  }
  };
  //=======================================================================================================
  //Create Flight
  const handleCreateFlight = async () => {
  try {
    //For Toast Error
    const requiredFields = [
      { key: "flightNumber", label: t.flight_number },
      { key: "origin", label: t.from},
      { key: "destination", label: t.to },
      { key: "departureTime", label: t.flights_departure },
      { key: "arrivalTime", label:t.flights_arrival },
      { key: "status", label: t.flights_status },
      { key: "airlineCode", label:t.airlineCode },
      { key: "aircraftType", label: t.flights_aircraft },
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
      setToast({ show: true, message:t.error_fields+`\n${emptyFields
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

    const payload = {
      flightNumber: newFlight.flightNumber,
      origin: newFlight.origin,           
      destination: newFlight.destination, 
      departureTime: departureISO,
      arrivalTime: arrivalISO,
      status: newFlight.status,
      revenue: newFlight.revenue ? Number(newFlight.revenue) : undefined,
      airlineCode: newFlight.airlineCode || undefined,
      aircraftType: newFlight.aircraftType || undefined,
      flightType: "domestic" || undefined,
      gate: newFlight.gate || undefined,
    };

    console.log("Creating flight payload:", payload);

    await API.post("/flights/create", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        lang: lang,
      },
    });

    setToast({ show: true, message:t.flights_create_success , type: "success" });
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
    setToast({ show: true, message:t.flights_create_error , type: "error" });
  }
  };
  //=======================================================================================================
  // Delete Flight
  const handleDelete = async (flightId) => {
    try {
      await API.delete(`/flights/${flightId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFlights((prev) => prev.filter((f) => f._id !== flightId));
    setToast({ show: true, message:t.flights_delete_success , type: "success" });
    } catch (err) {
      console.error("Error deleting flight:", err);
    setToast({ show: true, message:t.flights_delete_error , type: "error" });
    }
  };
  //=======================================================================================================
  // fetchFlights
  const fetchFlights = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.origin) params.append("origin", filters.origin);
      if (filters.destination) params.append("destination", filters.destination);
      if (filters.status) params.append("status", filters.status);
      if (filters.fromDate) params.append("fromDate", filters.fromDate);
      if (filters.toDate) params.append("toDate", filters.toDate);

        const flightFetch =await apiFetch(`/flights/list/getAllTrips?${params.toString()}`,{
        headers: {
            Authorization: `Bearer ${token}`,
            lang: lang,
          },});
          const flight =await flightFetch.json()
          console.log(flight)

      setFlights(flight.data);
    } catch (err) {
      console.error("Fetch flights error:", err);
    }
  };
  //=======================================================================================================
  const handleApplyFilter = () => {
    fetchFlights();
    setShowFilter(false);
  };
  return (
    <>
    {toast.show && (
              <Toast 
              show={toast.show}message={toast.message}type={toast.type}onClose={() => setToast({ ...toast, show: false })}/>
    )}
    <div className={`flights-page ${lang === "ar" ? "rtl" : "ltr"}`}>
        <h1>{t.flights_title}</h1>
        <p>{t.flights_subtitle}</p>
    {/* ===== Filter Header ===== */}
    <div className="flights-filter-header">
      <button
        className="filter-toggle-btn"
        onClick={() => setShowFilter(!showFilter)}
      >
        {t.filter} ⌄
      </button>
    </div>

    {/* ===== Filter Panel ===== */}
    {showFilter && (
      <div className="filter-panel">
        <select
          value={filters.origin}
          onChange={(e) =>
            setFilters({ ...filters, origin: e.target.value })
          }
        >
          <option value="">{t.from}</option>

          {airports.map((airport) => (
            <option key={airport.en} value={airport.en}>
              {airport[lang]}
            </option>
          ))}
        </select>

        <select
          value={filters.destination}
          onChange={(e) =>
            setFilters({ ...filters, destination: e.target.value })
          }
        >
          <option value="">{t.to}</option>

          {airports.map((airport) => (
            <option key={airport.en} value={airport.en}>
              {airport[lang]}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="">{t.flights_status}</option>
          <option value="scheduled">{t.flights_scheduled}</option>
          <option value="boarding">{t.flights_boarding}</option>
          <option value="delayed">{t.flights_delayed}</option>
          <option value="completed">{t.flights_completed}</option>
          <option value="cancelled">{t.flights_cancelled}</option>
        </select>

        <div className="filter-actions">
          <button className="apply-btn" onClick={handleApplyFilter}>
            {t.apply}
          </button>

          <button
            className="reset-btn"
            onClick={() => {
              setFilters({
                origin: "",
                destination: "",
                status: "",
              });
              fetchFlights();
            }}
          >
            {t.reset}
          </button>
        </div>
      </div>
    )}
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
                    {t[`flights_${flight.status}`]}
                  </span>
                </div>
                <p className="airline">
                  {flight.airlineCode?.toUpperCase()} — {flight.aircraftType}
                </p>
              </div>

              <div className="flight-route">
                <div className="route">
                  <h4>{typeof flight.origin === "object" ? flight.origin[lang] : flight.origin}</h4>
                  <p>{t.from}</p>
                </div>
                <div className="route-icon"></div>
                <div className="route">
                  <h4>{typeof flight.destination === "object" ? flight.destination[lang] : flight.destination}</h4>
                  <p>{t.to}</p>
                </div>
              </div>

              <div className="flight-details">
                <div>
                  <strong>{t.flights_departure}:</strong>{" "}
                  <h7>{new Date(flight.departureTime).toLocaleString(lang)}</h7>
                </div>
                <div>
                  <strong>{t.flights_arrival}:</strong>{" "}
                  <h7>{new Date(flight.arrivalTime).toLocaleString(lang)}</h7>
                </div>
                <div>
                  <strong>{t.flights_gate}:</strong> <h7>{flight.gate}</h7>
                </div>
              </div>

              <div className="flight-actions">
                <button className="book-btn" onClick={() => handleBookClick(flight)}>
                  {t.book_now}
                </button>

                {user?.role === "admin" && (
                  <>
                    <button className="edit-btn" onClick={() => handleEditFlight(flight)}>
                      {t.edit_flight}
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(flight._id)}>
                      {t.delete_flight}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-flights">{t.flights_no_available}</p>
        )}

        {user?.role === "admin" && (
          <div className="add-flight">
            <button className="create-flight-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
              {t.flights_create_button}
            </button>
          </div>
        )}
      </section>
    )}

      {/* Form Edit Flight */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2>{t.edit_flight_title}</h2>
            {/* flight number */}
            <div className="modal-form">
              <label>{t.flight_number}</label>
              <input
                type="text"
                name="flightNumber"
                value={editingFlight.flightNumber || ""}
                onChange={handleChange}
              />
              {/* origin */}
              <label>{t.from}</label>
              <select name="origin" 
              value={ editingFlight.origin } 
                onChange={handleChange}>
                  <option value="Aleppo International Airport">{t.flights_Aleppo}</option>
                  <option value="Latakia International Airport">{t.flights_Latakia}</option>
                  <option value="Damascus International Airport">{t.flights_Damascus}</option>
                  <option value="Deir ez-Zor International Airport">{t.flights_Deir_ez_Zor}</option>
                  <option value="Qamishli International Airport">{t.flights_Qamishli}</option>
                </select>
              {/* destination */}
              <label>{t.to}</label>
              <select name="destination" 
              value={  editingFlight.destination} 
                onChange={handleChange}>
                  <option value="Aleppo International Airport">{t.flights_Aleppo}</option>
                  <option value="Latakia International Airport">{t.flights_Latakia}</option>
                  <option value="Damascus International Airport">{t.flights_Damascus}</option>
                  <option value="Deir ez-Zor International Airport">{t.flights_Deir_ez_Zor}</option>
                  <option value="Qamishli International Airport">{t.flights_Qamishli}</option>
                </select>
              {/* departure time */}
              <label>{t.flights_departure}</label>
              <input
                type="datetime-local"
                name="departureTime"
                value={editingFlight.departureTime?.slice(0, 16) || ""}
                onChange={handleChange}
              />
              {/* arrival time */}
              <label>{t.flights_arrival}</label>
              <input
                type="datetime-local"
                name="arrivalTime"
                value={editingFlight.arrivalTime?.slice(0, 16) || ""}
                onChange={handleChange}
              />
              {/* status */}
              <label>{t.flights_status}</label>
              <select name="status" value={editingFlight.status } onChange={handleChange}>
                  <option value="scheduled">{t.flights_scheduled}</option>
                  <option value="boarding">{t.flights_boarding}</option>
                  <option value="delayed">{t.flights_delayed}</option>
                  <option value="completed">{t.flights_completed}</option>
                  <option value="cancelled">{t.flights_cancelled}</option>
                </select>

              {/* gate */}
              <label>{t.flights_gate}</label>
              <input
                type="text"
                name="gate"
                value={editingFlight.gate || ""}
                onChange={handleChange}
              />
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>
                {t.save}
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Create Fligh t*/}
      {showCreateForm && (
        <div>
          <div className="create-flight-form">
          <h2>{t.create_new_flight}</h2>
          {/* Flight Number */}
          <div className="form-group">
            <label> {t.flight_number}</label>
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
            <label>{t.from}</label>
            <select  value={ typeof newFlight.origin === "object" ? newFlight.origin[lang] : newFlight.origin} 
            onChange={(e) =>setNewFlight({  ...newFlight,  origin: { en: e.target.value },  })}>
                  <option value="Damascus International Airport">{t.flights_Damascus}</option>
                  <option value="Aleppo International Airport">{t.flights_Aleppo}</option>
                  <option value="Latakia International Airport">{t.flights_Latakia}</option>
                  <option value="Deir ez-Zor International Airport">{t.flights_Deir_ez_Zor}</option>
                  <option value="Qamishli International Airport">{t.flights_Qamishli}</option>
                </select>
          </div>
          {/* Destination */}
          <div className="form-group">
            <label>{t.to}</label>
            <select value={newFlight.destination.en}  onChange={(e) =>setNewFlight({  ...newFlight,  destination: { en: e.target.value },  })}>
                  <option value="Aleppo International Airport">{t.flights_Aleppo}</option>
                  <option value="Latakia International Airport">{t.flights_Latakia}</option>
                  <option value="Damascus International Airport">{t.flights_Damascus}</option>
                  <option value="Deir ez-Zor International Airport">{t.flights_Deir_ez_Zor}</option>
                  <option value="Qamishli International Airport">{t.flights_Qamishli}</option>
              </select>
          </div>
          {/* Departure Time */}
          <div className="form-group">
            <label>{t.flights_departure}</label>
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
            <label>{t.flights_arrival}</label>
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
            <label>{t.flights_status}</label>
            <select name="status" value={newFlight.status } onChange={(e) =>
                setNewFlight({ ...newFlight, status: e.target.value })}>
                  <option value="scheduled">{t.flights_scheduled}</option>
                  <option value="boarding">{t.flights_boarding}</option>
                  <option value="delayed">{t.flights_delayed}</option>
                  <option value="completed">{t.flights_completed}</option>
                  <option value="cancelled">{t.flights_cancelled}</option>
                </select>
          </div>
          {/*Airline Code*/}
          <div className="form-group">
            <label> {t.airlineCode}</label>
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
            <label>{t.flights_aircraft}</label>
              <select name="aircraftType" value={newFlight.aircraftType }onChange={(e) =>
                setNewFlight({ ...newFlight, aircraftType: e.target.value })}>
                  <option value="boeing 777">Boeing 777</option>
                  <option value="airbus a320">Airbus a320</option>
                  <option value="boeing 737">Boeing 737</option>
            </select>
          </div>
          {/*Gate*/}
          <div className="form-group">
            <label>{t.flights_gate}</label>
            <input
              type="text"
              value={newFlight.gate}
              onChange={(e) =>
                setNewFlight({ ...newFlight, gate: e.target.value })
              }
            />
          </div>
          <button  className='create-flight-btn' onClick={handleCreateFlight}>{t.saveFlight}</button>
        </div>
          {user?.role === "admin" && (
            <button className="create-flight-btn" onClick={() => setShowCreateForm(!showCreateForm) } >
              {t.flights_go_back_button}
            </button>
          )}

        </div>
      )}

    </div>
    </>
  );
};

export default FlightsPage;