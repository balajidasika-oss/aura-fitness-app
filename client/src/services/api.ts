import { IClientUser, IDailyLog, IUser } from '../types';

const API_BASE = '/api';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user: IUser;
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed. Please check your credentials.');
  return data;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  role: 'coach' | 'client';
  fitnessGoal?: string;
  phone?: string;
  coachCode?: string;
  avatarUrl?: string;
  avatarFile?: File | Blob | null;
}): Promise<AuthResponse> {
  let res: Response;

  if (payload.avatarFile) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    formData.append('password', payload.password);
    formData.append('role', payload.role);
    if (payload.fitnessGoal) formData.append('fitnessGoal', payload.fitnessGoal);
    if (payload.phone) formData.append('phone', payload.phone);
    if (payload.coachCode) formData.append('coachCode', payload.coachCode);
    if (payload.avatarUrl) formData.append('avatarUrl', payload.avatarUrl);
    formData.append('avatarPhoto', payload.avatarFile);

    res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: formData,
    });
  } else {
    res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed. Please try again.');
  return data;
}

export async function fetchCoaches(): Promise<IUser[]> {
  const res = await fetch(`${API_BASE}/auth/coaches`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function joinCoach(clientId: string, coachCode: string): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/join-coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, coachCode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to join coach.');
  return data;
}

export async function fetchClients(coachId?: string): Promise<IClientUser[]> {
  const query = coachId ? `?coachId=${encodeURIComponent(coachId)}` : '';
  const res = await fetch(`${API_BASE}/clients${query}`);
  if (!res.ok) throw new Error('Failed to fetch client roster');
  const data = await res.json();
  return data.data || [];
}

export async function fetchClientDetail(clientId: string): Promise<IClientUser & { logs: IDailyLog[]; coach?: IUser }> {
  const res = await fetch(`${API_BASE}/clients/${clientId}`);
  if (!res.ok) throw new Error('Failed to fetch athlete details');
  const data = await res.json();
  return data.data;
}

export async function fetchTodayLog(clientId: string, dateStr?: string): Promise<IDailyLog | null> {
  const query = new URLSearchParams({ clientId });
  if (dateStr) query.append('date', dateStr);

  const res = await fetch(`${API_BASE}/logs/today?${query.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.data || null;
}

export async function fetchLogHistory(clientId: string): Promise<IDailyLog[]> {
  const res = await fetch(`${API_BASE}/logs/history/${clientId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function submitDailyLog(formData: FormData): Promise<IDailyLog> {
  const res = await fetch(`${API_BASE}/logs`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to submit log');
  }
  const data = await res.json();
  return data.data;
}

export async function sendCoachCheer(logId: string, reactionEmoji: string, message?: string): Promise<IDailyLog> {
  const res = await fetch(`${API_BASE}/logs/${logId}/cheer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reactionEmoji, message }),
  });
  if (!res.ok) throw new Error('Failed to send coach feedback');
  const data = await res.json();
  return data.data;
}
