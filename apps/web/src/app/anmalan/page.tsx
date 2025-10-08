'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { eventsApi, participantsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Event {
  id: string;
  slug: string;
  name: string;
  description?: string;
  date: string;
}

function RegistrationForm() {
  const searchParams = useSearchParams();
  const eventSlug = searchParams?.get('event');

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [swishQR, setSwishQR] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'MALE',
    birthDate: '',
    club: '',
    nationality: 'SE',
    gdprConsent: false,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (eventSlug && events.length > 0) {
      const event = events.find(e => e.slug === eventSlug);
      if (event) {
        setSelectedEvent(event);
      }
    }
  }, [eventSlug, events]);

  const loadEvents = async () => {
    try {
      const response = await eventsApi.getAll();
      setEvents(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      setError('Välj ett evenemang');
      return;
    }

    if (!formData.gdprConsent) {
      setError('Du måste acceptera GDPR-policy');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await participantsApi.register({
        eventId: selectedEvent.id,
        ...formData,
      });

      setRegistrationNumber(response.data.registrationNumber);
      setSwishQR(response.data.swishQR || '');
      setSuccess(true);
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        gender: 'MALE',
        birthDate: '',
        club: '',
        nationality: 'SE',
        gdprConsent: false,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Anmälan misslyckades');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (success) {
    return (
      <div className="card">
        <div className="text-center">
          <h1 className="mb-3" style={{ color: 'var(--color-success)' }}>✓ Anmälan lyckades!</h1>
          
          <div className="alert alert-success">
            <p><strong>Ditt anmälningsnummer:</strong></p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>
              {registrationNumber}
            </p>
            <p>En bekräftelse har skickats till din e-post.</p>
          </div>

          {swishQR && (
            <div className="mt-3">
              <h3 className="mb-2">Betala med Swish</h3>
              <img src={swishQR} alt="Swish QR" style={{ maxWidth: '300px', margin: '0 auto' }} />
            </div>
          )}

          <button 
            onClick={() => {
              setSuccess(false);
              setRegistrationNumber('');
              setSwishQR('');
            }}
            className="btn btn-primary mt-3"
          >
            Anmäl fler deltagare
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="text-center mb-3">Anmälan</h1>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="event">
            Välj evenemang *
          </label>
          <select
            id="event"
            className="form-select"
            value={selectedEvent?.id || ''}
            onChange={(e) => {
              const event = events.find(ev => ev.id === e.target.value);
              setSelectedEvent(event || null);
            }}
            required
          >
            <option value="">-- Välj evenemang --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} - {formatDate(event.date)}
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="firstName">
                  Förnamn *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lastName">
                  Efternamn *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                E-post *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="gender">
                  Kön *
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="MALE">Man</option>
                  <option value="FEMALE">Kvinna</option>
                  <option value="OTHER">Annat</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="birthDate">
                  Födelsedatum *
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  className="form-input"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="club">
                  Klubb
                </label>
                <input
                  id="club"
                  name="club"
                  type="text"
                  className="form-input"
                  value={formData.club}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="nationality">
                  Nationalitet
                </label>
                <input
                  id="nationality"
                  name="nationality"
                  type="text"
                  className="form-input"
                  value={formData.nationality}
                  onChange={handleChange}
                  maxLength={2}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="gdprConsent"
                  className="form-checkbox"
                  checked={formData.gdprConsent}
                  onChange={handleChange}
                  required
                />
                <span>
                  Jag accepterar att mina personuppgifter behandlas enligt GDPR. 
                  Uppgifterna används endast för denna tävling och delas inte med tredje part. *
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Anmäler...' : 'Slutför anmälan'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <Suspense fallback={<div className="text-center"><div className="loading"></div></div>}>
        <RegistrationForm />
      </Suspense>
    </main>
  );
}
