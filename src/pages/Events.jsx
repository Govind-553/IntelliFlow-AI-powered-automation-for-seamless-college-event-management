import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Clock, Users, Edit, Trash, PlusCircle, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import './Events.css';
import MarketingAutomation from '../components/MarketingAutomation';
import SpeakerRecommendations from '../components/SpeakerRecommendations';
import BudgetOptimizer from '../components/BudgetOptimizer';
import CreateEventForm from '../components/CreateEventForm';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [authOverlay, setAuthOverlay] = useState({ show: false, mode: '', event: null });
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    attendees: '',
    status: '',
    image: '',
    duration: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const validateAuth = () => {
    return authData.email === 'admin@example.com' && authData.password === 'admin@123';
  };

  const confirmCreate = () => {
    if (validateAuth()) {
      setShowForm(true);
      setAuthOverlay({ show: false, mode: '', event: null });
    } else {
      alert('Authentication failed. Please check your email and password.');
    }
  };

  const confirmEdit = () => {
    if (validateAuth()) {
      setSelectedEvent(authOverlay.event);
      setFormData(authOverlay.event);
      setAuthOverlay({ show: false, mode: '', event: null });
    } else {
      alert('Authentication failed. Please check your email and password.');
    }
  };

 const confirmDelete = () => {
  if (validateAuth()) {
    handleDelete(authOverlay.event._id);
    setAuthOverlay({ show: false, mode: '', event: null });
  } else {
    alert('Authentication failed. Please check your email and password.');
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`http://localhost:5000/events/${id}`);
      setEvents(events.filter(event => event._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (event) => {
    setAuthOverlay({ show: true, mode: 'edit', event });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/events/${selectedEvent._id}`, formData);
      setEvents(events.map(event => (event._id === response.data._id ? response.data : event)));
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h1 className="events-title">Events</h1>
        <button onClick={() => setAuthOverlay({ show: true, mode: 'create', event: null })} className="create-event-button">
          <PlusCircle size={18} /> Create Event
        </button>
      </div>

      {showForm && <CreateEventForm onClose={() => setShowForm(false)} refreshEvents={fetchEvents} />}

      {selectedEvent && (
        <div className="edit-event-form">
          <h2>Edit Event</h2>
          <form onSubmit={handleUpdate}>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />
            <input type="number" name="attendees" value={formData.attendees} onChange={handleChange} required />
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="Planning">Planning</option>
              <option value="Marketing">Marketing</option>
            </select>
            <input type="text" name="image" value={formData.image} onChange={handleChange} required />
            <input type="number" name="duration" value={formData.duration} onChange={handleChange} required />
            <button type="submit"><RefreshCw size={18} /> Update Event</button>
            <button type="button" onClick={() => setSelectedEvent(null)}>
              <XCircle size={18} /> Cancel
            </button>
          </form>
        </div>
      )}

      <div className="events-list">
        {events.map((event, index) => (
          <div key={index} className="event-card">
            <div className="event-card-content">
              <div className="event-image-container">
                <img className="event-image" src={event.image} alt={event.title} />
              </div>
              <div className="event-details">
                <div className="event-header">
                  <h2 className="event-title">{event.title}</h2>
                  <span className="event-status">{event.status}</span>
                </div>
                <div className="event-meta">
                  <div className="event-meta-item">
                    <Calendar className="event-icon" />
                    <span>{event.date}</span>
                  </div>
                  <div className="event-meta-item">
                    <MapPin className="event-icon" />
                    <span>{event.location}</span>
                  </div>
                  <div className="event-meta-item">
                    <Users className="event-icon" />
                    <span>{event.attendees} Attendees</span>
                  </div>
                  <div className="event-meta-item">
                    <Clock className="event-icon" />
                    <span>{event.duration} hours</span>
                  </div>
                </div>
                <div className="event-actions">
                  <button className="edit-event-button" onClick={() => handleEdit(event)}>
                    <Edit size={18} /> Edit Event
                  </button>
                  <button
                    className="delete-event-button"
                     onClick={() => setAuthOverlay({ show: true, mode: 'delete', event })}
                        >
                      <Trash size={18} /> Delete Event
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {authOverlay.show && (
        <div className="auth-overlay">
          <div className="auth-modal">
            <h2>{authOverlay.mode === 'create' ? 'Create Event' : 'Admin Authentication'}</h2>
            <input type="email" placeholder="Email" value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} required />
            <button onClick={authOverlay.mode === 'create' ? confirmCreate : authOverlay.mode === 'edit' ? confirmEdit : confirmDelete}> <CheckCircle size={18} />Confirm</button>
            <button onClick={() => setAuthOverlay({ show: false, mode: '', event: null })}> <XCircle size={18} />Cancel</button>
          </div>
        </div>
      )}
      <MarketingAutomation />
      <SpeakerRecommendations />
      <BudgetOptimizer />
    </div>
  );
};

export default Events;
