'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { eventsApi, adminApi, setAuthToken } from '@/lib/api';
import Link from 'next/link';

export default function NewEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    mode: 'NORMAL',
    date: '',
    location: '',
    modeSettings: {} as any,
  });

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    try {
      await adminApi.verify(token);
    } catch (err) {
      setAuthToken(null);
      router.push('/admin');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare mode settings based on mode
      let modeSettings = {};
      if (formData.mode === 'BACKYARD') {
        modeSettings = {
          yardDistance: 6706, // Default value
          yardTimeLimit: 3600000, // 1 hour in ms
        };
      } else if (formData.mode === 'VARVLOPP') {
        modeSettings = {
          totalLaps: 10, // Default value
        };
      } else if (formData.mode === 'TIDSLOPP') {
        modeSettings = {
          timeLimit: 3600000, // 1 hour in ms
          lapDistance: 400, // Default 400m
        };
      }

      await eventsApi.create({
        ...formData,
        modeSettings,
      });

      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Error creating event:', err);
      const errorMsg = err.response?.data?.error || 'Kunde inte skapa evenemang';
      const errorDetails = err.response?.data?.details;
      setError(errorDetails ? `${errorMsg}: ${errorDetails}` : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({
      ...prev,
      name,
      slug,
    }));
  };

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div className="flex items-center justify-between mb-4">
        <h1>Nytt evenemang</h1>
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
              onChange={handleNameChange}
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

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Skapar...' : 'Skapa evenemang'}
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
