'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { eventsApi, adminApi, setAuthToken, isTokenExpired } from '@/lib/api';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  mode: string;
  date: string;
  location: string | null;
  isActive: boolean;
  modeSettings: any;
}

export default function EditEvent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState<Event | null>(null);
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    mode: 'NORMAL',
    date: '',
    location: '',
    isActive: true,
    modeSettings: {} as any,
  });

  const loadEvent = async () => {
    try {
      setLoading(true);
      // Get event by ID - we need to get all events and find by ID
      // since the API only has getBySlug
      const response = await eventsApi.getAll();
      const foundEvent = response.data.find((e: Event) => e.id === eventId);
      
      if (!foundEvent) {
        setError('Evenemang hittades inte');
        return;
      }

      setEvent(foundEvent);
      
      // Format date for input (YYYY-MM-DD)
      const dateObj = new Date(foundEvent.date);
      const formattedDate = dateObj.toISOString().split('T')[0];

      setFormData({
        name: foundEvent.name,
        slug: foundEvent.slug,
        description: foundEvent.description || '',
        mode: foundEvent.mode,
        date: formattedDate,
        location: foundEvent.location || '',
        isActive: foundEvent.isActive,
        modeSettings: foundEvent.modeSettings || {},
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kunde inte ladda evenemang');
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

    // Check if token is expired
    if (isTokenExpired()) {
      setAuthToken(null);
      router.push('/admin');
      return;
    }

    try {
      await adminApi.verify(token);
      loadEvent();
    } catch (err) {
      setAuthToken(null);
      router.push('/admin');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, eventId]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await eventsApi.update(eventId, formData);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kunde inte uppdatera evenemang');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
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
        <h1>Redigera evenemang</h1>
        <Link href="/admin/dashboard" className="btn btn-outline">
          Tillbaka
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mb-3">{error}</div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Namn *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="slug">
              Slug (används i URL) *
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              className="form-input"
              value={formData.slug}
              onChange={handleChange}
              required
              pattern="[a-z0-9-]+"
              title="Endast små bokstäver, siffror och bindestreck"
            />
            <small style={{ color: 'var(--color-gray-dark)' }}>
              Exempel: test-race-2024
            </small>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Beskrivning
            </label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mode">
              Tävlingsläge *
            </label>
            <select
              id="mode"
              name="mode"
              className="form-input"
              value={formData.mode}
              onChange={handleChange}
              required
            >
              <option value="NORMAL">Normal (Start och mål)</option>
              <option value="BACKYARD">Backyard Ultra</option>
              <option value="VARVLOPP">Varvlopp (Fasta varv)</option>
              <option value="TIDSLOPP">Tidslopp (Fast tid)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="date">
              Datum *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="form-input"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">
              Plats
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="form-input"
              value={formData.location}
              onChange={handleChange}
              placeholder="Stockholm"
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <span>Evenemang aktivt</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Sparar...' : 'Spara ändringar'}
            </button>
            <Link href="/admin/dashboard" className="btn btn-outline">
              Avbryt
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
