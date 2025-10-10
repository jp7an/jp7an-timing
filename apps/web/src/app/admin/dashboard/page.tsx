'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { eventsApi, adminApi, setAuthToken } from '@/lib/api';
import { formatDate, getRaceModeName } from '@/lib/utils';
import Link from 'next/link';

interface Event {
  id: string;
  slug: string;
  name: string;
  mode: string;
  date: string;
  isActive: boolean;
  _count: {
    participants: number;
  };
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getAll(true); // Include all events for admin dashboard
      setEvents(response.data);
    } catch (err) {
      setError('Kunde inte ladda evenemang');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    try {
      await adminApi.verify(token);
      loadEvents();
    } catch (err) {
      setAuthToken(null);
      router.push('/admin');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    setAuthToken(null);
    router.push('/admin');
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (!confirm(`Är du säker på att du vill radera "${name}"?`)) {
      return;
    }

    try {
      await eventsApi.delete(id);
      loadEvents();
    } catch (err) {
      alert('Kunde inte radera evenemang');
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: '2rem 1rem' }}>
        <div className="text-center">
          <div className="loading"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div className="flex items-center justify-between mb-4">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-outline">
          Logga ut
        </button>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Quick Actions Card */}
      <div className="card mb-3" style={{ backgroundColor: 'var(--color-gray-light)' }}>
        <h2 className="mb-2">📋 Snabbåtgärder</h2>
        <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1rem' }}>
          Vanliga åtgärder för att hantera evenemang och deltagare
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link href="/admin/events/new" className="btn btn-primary" style={{ textAlign: 'center' }}>
            ➕ Nytt evenemang
          </Link>
          <Link href="/chiputlamning" className="btn btn-secondary" style={{ textAlign: 'center' }}>
            🏷️ Chiputlämning
          </Link>
          <Link href="/anmalan" className="btn btn-secondary" style={{ textAlign: 'center' }}>
            📝 Anmälningssida
          </Link>
          <Link href="/" className="btn btn-secondary" style={{ textAlign: 'center' }}>
            🏠 Startsida
          </Link>
        </div>
      </div>

      {/* Events Management */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2>🏁 Evenemang</h2>
          <span style={{ color: 'var(--color-gray-dark)' }}>
            Totalt: <strong>{events.length}</strong> evenemang
          </span>
        </div>
        
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--color-gray-dark)' }}>
              Inga evenemang skapade ännu.
            </p>
            <Link href="/admin/events/new" className="btn btn-primary">
              Skapa ditt första evenemang
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Namn</th>
                  <th>Datum</th>
                  <th>Läge</th>
                  <th>Deltagare</th>
                  <th>Status</th>
                  <th style={{ minWidth: '250px' }}>Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td><strong>{event.name}</strong></td>
                    <td>{formatDate(event.date)}</td>
                    <td>{getRaceModeName(event.mode)}</td>
                    <td>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem',
                        backgroundColor: event._count.participants > 0 ? 'var(--color-success)' : 'var(--color-gray-medium)',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {event._count.participants}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem',
                        backgroundColor: event.isActive ? 'var(--color-success)' : 'var(--color-gray-medium)',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}>
                        {event.isActive ? '✓ Aktiv' : '✗ Inaktiv'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                        <Link 
                          href={`/admin/events/${event.id}`}
                          className="btn btn-outline"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          ✏️ Redigera
                        </Link>
                        <Link 
                          href={`/live/${event.slug}`}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          target="_blank"
                        >
                          📊 Live
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(event.id, event.name)}
                          className="btn btn-outline"
                          style={{ 
                            padding: '0.5rem 1rem', 
                            fontSize: '0.875rem',
                            color: 'var(--color-error)', 
                            borderColor: 'var(--color-error)' 
                          }}
                        >
                          🗑️ Radera
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="card mt-3" style={{ backgroundColor: 'var(--color-gray-light)' }}>
        <h3 className="mb-2">💡 Hjälp & Information</h3>
        <ul style={{ marginLeft: '1.5rem', color: 'var(--color-gray-dark)' }}>
          <li><strong>Nytt evenemang:</strong> Skapa ett nytt tävlingsevenemang med datum, läge och inställningar</li>
          <li><strong>Redigera:</strong> Ändra detaljer för befintliga evenemang (namn, datum, status)</li>
          <li><strong>Live:</strong> Visa live-resultat för ett evenemang i realtid</li>
          <li><strong>Chiputlämning:</strong> Scanna och tilldela EPC-chips till deltagare</li>
          <li><strong>Inloggning:</strong> Du förblir permanent inloggad på denna enhet</li>
        </ul>
      </div>
    </main>
  );
}
