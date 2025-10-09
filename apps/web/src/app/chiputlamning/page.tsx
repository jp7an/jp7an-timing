'use client';

import { useState } from 'react';
import { participantsApi } from '@/lib/api';

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  email: string;
  bib?: string;
  epc?: string;
  event: {
    name: string;
  };
}

export default function ChipDistributionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [epc, setEpc] = useState('');
  const [bib, setBib] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError('');
      const response = await participantsApi.search(searchQuery);
      setParticipants(response.data);
      
      if (response.data.length === 0) {
        setError('Inga deltagare hittades');
      }
    } catch (err) {
      setError('Sökning misslyckades');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setEpc(participant.epc || '');
    setBib(participant.bib || '');
    setSuccess('');
    setError('');
  };

  const handleAssign = async () => {
    if (!selectedParticipant) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Assign EPC if provided
      if (epc && epc !== selectedParticipant.epc) {
        try {
          await participantsApi.assignEPC(selectedParticipant.id, epc);
        } catch (err: any) {
          if (err.response?.data?.existingParticipant) {
            const existing = err.response.data.existingParticipant;
            setError(`EPC används redan av ${existing.firstName} ${existing.lastName}`);
            return;
          }
          throw err;
        }
      }

      // Update bib if changed
      if (bib !== selectedParticipant.bib) {
        await participantsApi.update(selectedParticipant.id, { bib });
      }

      setSuccess('EPC och nummerlapp tilldelades!');
      
      // Clear selection after a delay
      setTimeout(() => {
        setSelectedParticipant(null);
        setEpc('');
        setBib('');
        setSearchQuery('');
        setParticipants([]);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('Tilldelning misslyckades');
    } finally {
      setLoading(false);
    }
  };

  const handleEPCChange = (value: string) => {
    setEpc(value);
    setError('');
  };

  return (
    <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <div className="card">
        <h1 className="mb-3">Chiputlämning</h1>
        <p style={{ color: 'var(--color-gray-dark)', marginBottom: '2rem' }}>
          Sök efter deltagare och tilldela EPC-chip och nummerlapp.
        </p>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="search">
            Sök deltagare (anmälningsnummer, namn, e-post)
          </label>
          <div className="flex gap-2">
            <input
              id="search"
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ange sökterm..."
              autoFocus
            />
            <button 
              onClick={handleSearch}
              className="btn btn-primary"
              disabled={loading}
            >
              Sök
            </button>
          </div>
        </div>

        {participants.length > 0 && !selectedParticipant && (
          <div className="mt-3">
            <h3 className="mb-2">Sökresultat</h3>
            <table className="table table-clickable">
              <thead>
                <tr>
                  <th>Namn</th>
                  <th>Anmälningsnr</th>
                  <th>E-post</th>
                  <th>Evenemang</th>
                  <th>EPC</th>
                  <th>Nummerlapp</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} onClick={() => handleSelectParticipant(p)}>
                    <td><strong>{p.firstName} {p.lastName}</strong></td>
                    <td>{p.registrationNumber}</td>
                    <td>{p.email}</td>
                    <td>{p.event.name}</td>
                    <td>{p.epc || '-'}</td>
                    <td>{p.bib || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedParticipant && (
          <div className="mt-3">
            <div className="card" style={{ backgroundColor: 'var(--color-gray-light)' }}>
              <h3 className="mb-2">Vald deltagare</h3>
              <p><strong>Namn:</strong> {selectedParticipant.firstName} {selectedParticipant.lastName}</p>
              <p><strong>Anmälningsnummer:</strong> {selectedParticipant.registrationNumber}</p>
              <p><strong>Evenemang:</strong> {selectedParticipant.event.name}</p>
            </div>

            <div className="mt-3">
              <div className="form-group">
                <label className="form-label" htmlFor="epc">
                  EPC-nummer
                </label>
                <input
                  id="epc"
                  type="text"
                  className="form-input"
                  value={epc}
                  onChange={(e) => handleEPCChange(e.target.value)}
                  placeholder="Scanna eller ange EPC..."
                  autoFocus
                />
                <small style={{ color: 'var(--color-gray-dark)', display: 'block', marginTop: '0.25rem' }}>
                  Anslut USB-läsare och scanna chip, eller ange manuellt
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bib">
                  Nummerlapp
                </label>
                <input
                  id="bib"
                  type="text"
                  className="form-input"
                  value={bib}
                  onChange={(e) => setBib(e.target.value)}
                  placeholder="Ange nummerlapp..."
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleAssign}
                  className="btn btn-primary"
                  disabled={loading || !epc}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Tilldelar...' : 'Tilldela'}
                </button>
                <button 
                  onClick={() => {
                    setSelectedParticipant(null);
                    setEpc('');
                    setBib('');
                    setError('');
                  }}
                  className="btn btn-outline"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
