export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const sec = seconds % 60;
  const min = minutes % 60;

  if (hours > 0) {
    return `${hours}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('sv-SE');
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('sv-SE');
};

export const calculateAge = (birthDate: Date | string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const getRaceModeName = (mode: string): string => {
  const names: Record<string, string> = {
    NORMAL: 'Normal',
    BACKYARD: 'Backyard',
    VARVLOPP: 'Varvlopp',
    TIDSLOPP: 'Tidslopp',
  };
  return names[mode] || mode;
};

export const getGenderName = (gender: string): string => {
  const names: Record<string, string> = {
    MALE: 'Man',
    FEMALE: 'Kvinna',
    OTHER: 'Annat',
  };
  return names[gender] || gender;
};

export const getPaymentStatusName = (status: string): string => {
  const names: Record<string, string> = {
    PENDING: 'Väntande',
    PAID: 'Betald',
    CANCELLED: 'Avbruten',
  };
  return names[status] || status;
};
