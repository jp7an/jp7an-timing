'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { resultsApi, eventsApi } from '@/lib/api';
import { getSocket, joinEvent, leaveEvent } from '@/lib/socket';
import { formatTime, formatDate } from '@/lib/utils';

interface ParticipantResult {
  participantId: string;
  participant: {
    firstName: string;
    lastName: string;
    bib?: string;
    club?: string;
  };
  position?: number;
  time?: number;
  laps?: number;
  distance?: number;
  status: string;
  lastPassage?: string;
}

interface ResultsData {
  event: {
    name: string;
    mode: string;
    date: string;
    modeSettings?: any;
  };
  results: ParticipantResult[];
  totalParticipants: number;
  totalPassages: number;
}

export default function LivePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('position');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (slug) {
      loadResults();
      
      // Connect to WebSocket
      const socket = getSocket();
      joinEvent(slug);

      socket.on('passage-update', () => {
        loadResults();
      });

      socket.on('result-update', () => {
        loadResults();
      });

      return () => {
        leaveEvent(slug);
        socket.off('passage-update');
        socket.off('result-update');
      };
    }
  }, [slug]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await resultsApi.getByEvent(slug);
      setData(response.data);
    } catch (err) {
      setError('Kunde inte ladda resultat');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedResults = () => {
    if (!data) return [];
    
    const sorted = [...data.results];
    sorted.sort((a, b) => {
      let aVal: any = a[sortField as keyof ParticipantResult];
      let bVal: any = b[sortField as keyof ParticipantResult];

      if (sortField === 'name') {
        aVal = `${a.participant.lastName} ${a.participant.firstName}`;
        bVal = `${b.participant.lastName} ${b.participant.firstName}`;
      }

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  };

  if (loading && !data) {
    return (
      <main className="container-wide" style={{ padding: '2rem 1rem' }}>
        <div className="text-center">
          <div className="loading"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container-wide" style={{ padding: '2rem 1rem' }}>
        <div className="alert alert-error">{error}</div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="container-wide" style={{ padding: '2rem 1rem' }}>
      <div className="card mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{data.event.name}</h1>
            <p style={{ color: 'var(--color-gray-dark)' }}>
              {formatDate(data.event.date)} | {data.totalParticipants} deltagare | {data.totalPassages} passeringar
            </p>
          </div>
          <div className="text-right">
            <div style={{ 
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success)',
              marginRight: '0.5rem',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ fontWeight: 'bold' }}>LIVE</span>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table table-clickable">
          <thead>
            <tr>
              <th onClick={() => handleSort('position')} style={{ cursor: 'pointer' }}>
                Plac {sortField === 'position' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Namn {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Nummerlapp</th>
              <th>Klubb</th>
              {data.event.mode === 'NORMAL' && (
                <th onClick={() => handleSort('time')} style={{ cursor: 'pointer' }}>
                  Tid {sortField === 'time' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              )}
              {(data.event.mode === 'VARVLOPP' || data.event.mode === 'BACKYARD') && (
                <th onClick={() => handleSort('laps')} style={{ cursor: 'pointer' }}>
                  Varv {sortField === 'laps' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              )}
              {(data.event.mode === 'TIDSLOPP' || data.event.mode === 'BACKYARD') && (
                <th onClick={() => handleSort('distance')} style={{ cursor: 'pointer' }}>
                  Distans (m) {sortField === 'distance' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              )}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {getSortedResults().map((result) => (
              <tr 
                key={result.participantId}
                onClick={() => setSelectedParticipant(result.participantId)}
                style={{ cursor: 'pointer' }}
              >
                <td><strong>{result.position || '-'}</strong></td>
                <td>
                  {result.participant.lastName}, {result.participant.firstName}
                </td>
                <td>{result.participant.bib || '-'}</td>
                <td>{result.participant.club || '-'}</td>
                {data.event.mode === 'NORMAL' && (
                  <td>{result.time ? formatTime(result.time) : '-'}</td>
                )}
                {(data.event.mode === 'VARVLOPP' || data.event.mode === 'BACKYARD') && (
                  <td>{result.laps || 0}</td>
                )}
                {(data.event.mode === 'TIDSLOPP' || data.event.mode === 'BACKYARD') && (
                  <td>{result.distance || 0}</td>
                )}
                <td>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    backgroundColor: result.status === 'FINISHED' ? 'var(--color-success)' : 
                                   result.status === 'RUNNING' ? 'var(--color-orange)' : 
                                   'var(--color-gray-medium)',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}>
                    {result.status === 'FINISHED' ? 'Mål' :
                     result.status === 'RUNNING' ? 'Pågår' :
                     result.status === 'DNF' ? 'DNF' :
                     result.status === 'DNS' ? 'DNS' : result.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {getSortedResults().length === 0 && (
          <p className="text-center" style={{ padding: '2rem' }}>
            Inga resultat ännu.
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </main>
  );
}
