import Papa from 'papaparse';
import iconv from 'iconv-lite';

export interface CSVParticipant {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string;
  club?: string;
  nationality?: string;
  className?: string;
}

export const parseCSV = (
  buffer: Buffer,
  encoding: 'utf-8' | 'cp1252' = 'utf-8'
): CSVParticipant[] => {
  try {
    // Decode based on encoding
    let content: string;
    if (encoding === 'cp1252') {
      content = iconv.decode(buffer, 'cp1252');
    } else {
      content = buffer.toString('utf-8');
    }

    // Parse CSV with Papa Parse
    const result = Papa.parse(content, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (result.errors.length > 0) {
      throw new Error(`CSV-parsningsfel: ${result.errors[0].message}`);
    }

    // Map to our interface
    return (result.data as Array<Record<string, string>>).map((row) => ({
      firstName: row['Förnamn'] || row['FirstName'] || '',
      lastName: row['Efternamn'] || row['LastName'] || '',
      email: row['E-post'] || row['Email'] || '',
      gender: mapGender(row['Kön'] || row['Gender'] || ''),
      birthDate: row['Födelsedatum'] || row['BirthDate'] || '',
      club: row['Klubb'] || row['Club'] || undefined,
      nationality: row['Nationalitet'] || row['Nationality'] || 'SE',
      className: row['Klass'] || row['Class'] || undefined,
    }));
  } catch (error) {
    console.error('Fel vid CSV-parsning:', error);
    throw new Error('Kunde inte tolka CSV-fil');
  }
};

const mapGender = (gender: string): 'MALE' | 'FEMALE' | 'OTHER' => {
  const normalized = gender.toLowerCase().trim();
  if (normalized === 'm' || normalized === 'man' || normalized === 'male') {
    return 'MALE';
  }
  if (normalized === 'f' || normalized === 'kvinna' || normalized === 'female') {
    return 'FEMALE';
  }
  return 'OTHER';
};

export const generateCSV = (participants: Array<{
  firstName: unknown;
  lastName: unknown;
  email: unknown;
  gender: unknown;
  birthDate: unknown;
  club?: unknown;
  nationality?: unknown;
  registrationNumber: unknown;
  epc?: unknown;
  bib?: unknown;
}>): string => {
  const headers = [
    'Förnamn',
    'Efternamn',
    'E-post',
    'Kön',
    'Födelsedatum',
    'Klubb',
    'Nationalitet',
    'Anmälningsnummer',
    'EPC',
    'Nummerlapp',
  ];

  const rows = participants.map((p) => [
    p.firstName,
    p.lastName,
    p.email,
    p.gender === 'MALE' ? 'M' : p.gender === 'FEMALE' ? 'F' : 'O',
    new Date(p.birthDate as string | number | Date).toISOString().split('T')[0],
    p.club || '',
    p.nationality || 'SE',
    p.registrationNumber,
    p.epc || '',
    p.bib || '',
  ]);

  const csv = Papa.unparse({
    fields: headers,
    data: rows,
  }, {
    delimiter: ';',
    newline: '\r\n',
  });

  return csv;
};
