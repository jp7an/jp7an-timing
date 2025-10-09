'use client';

import { useEffect, useState } from 'react';
import { eventsApi } from '@/lib/api';
import { formatDate, getRaceModeName } from '@/lib/utils';
import Link from 'next/link';

interface Event {
  id: string;
  slug: string;
  name: string;
  description?: string;
  mode: string;
  date: string;
  location?: string;
  isActive: boolean;
  _count: {
    participants: number;
  };
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getAll();
      setEvents(response.data);
    } catch (err) {
      setError('Kunde inte ladda evenemang');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: '4rem 1rem' }}>
        <div className="text-center">
          <div className="loading"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '4rem 1rem' }}>
      <div className="text-center mb-4">
        <h1 style={{ marginBottom: '1rem' }}>Jp7an-timing</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-gray-dark)' }}>
          Professionellt tidtagningssystem för löpning
        </p>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="mt-4">
        <h2 className="mb-3">Kommande evenemang</h2>
        
        {events.length === 0 ? (
          <div className="card text-center">
            <p>Inga evenemang tillgängliga för tillfället.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {events.map((event) => (
              <div key={event.id} className="card">
                <h3 style={{ marginBottom: '0.5rem' }}>{event.name}</h3>
                {event.description && (
                  <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1rem' }}>
                    {event.description}
                  </p>
                )}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Datum:</strong> {formatDate(event.date)}
                  </div>
                  {event.location && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Plats:</strong> {event.location}
                    </div>
                  )}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Läge:</strong> {getRaceModeName(event.mode)}
                  </div>
                  <div>
                    <strong>Deltagare:</strong> {event._count.participants}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/live/${event.slug}`} className="btn btn-primary" style={{ flex: 1 }}>
                    Live-resultat
                  </Link>
                  <Link href={`/anmalan?event=${event.slug}`} className="btn btn-outline" style={{ flex: 1 }}>
                    Anmäl dig
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link href="/admin" className="btn btn-secondary">
          Administratörsinloggning
        </Link>
      </div>
    </main>
  );
}

