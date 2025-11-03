import { httpRequest } from './http';

export interface LoginPayload {
  phone: string;
  password?: string;
  code?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    phone: string;
    points: number;
    balance?: number;
  };
}

export interface BlindBoxSummary {
  id: number;
  name: string;
  cover_url: string;
  category: string;
  price: number;
  remaining_stock: number;
  total_stock?: number;
  description?: string;
}

export interface BlindBoxDetail extends BlindBoxSummary {
  gallery?: string[];
  rarityRates?: Record<string, number>;
  prizes: Array<{
    id: number;
    name: string;
    image_url: string;
    level: 'UR' | 'SR' | 'R';
    probability: number;
    remaining_count: number;
  }>;
}

export interface DrawResponse {
  record: {
    id: number;
    blind_box_id: number;
    prize_id: number;
    draw_time: string;
    status: string;
  };
  prize: {
    id: number;
    name: string;
    image_url: string;
    level: 'UR' | 'SR' | 'R';
  };
}

export interface ProfileResponse {
  user: {
    id: number;
    phone: string;
    points: number;
    balance?: number;
  };
  records: Array<{
    id: number;
    blind_box_id: number;
    prize_id: number;
    draw_time: string;
    status: string;
    prize?: {
      id: number;
      name: string;
      image_url: string;
      level: 'UR' | 'SR' | 'R';
    };
  }>;
}

export async function register(payload: { phone: string; password: string }) {
  return httpRequest<void, typeof payload>('POST', '/auth/register', {
    auth: false,
    body: payload
  });
}

export async function login(payload: LoginPayload) {
  return httpRequest<AuthResponse, LoginPayload>('POST', '/auth/login', {
    auth: false,
    body: payload
  });
}

export async function sendVerificationCode(payload: { phone: string }) {
  return httpRequest<{ code: string }, typeof payload>('POST', '/auth/send-code', {
    auth: false,
    body: payload
  });
}

export async function fetchBlindBoxes(params: { category?: string; page?: number; size?: number } = {}) {
  return httpRequest<{ list: BlindBoxSummary[]; total: number }>('GET', '/blind-boxes', {
    query: params
  });
}

export async function fetchBlindBoxDetail(id: string | number) {
  return httpRequest<BlindBoxDetail>('GET', `/blind-boxes/${id}`);
}

export async function performDraw(payload: { blind_box_id: number }) {
  return httpRequest<DrawResponse, typeof payload>('POST', '/draw', {
    body: payload
  });
}

export async function redeemPrize(payload: { record_id: number; address: string }) {
  return httpRequest<{ status: string }, typeof payload>('POST', '/redeem', {
    body: payload
  });
}

export async function fetchProfile() {
  return httpRequest<ProfileResponse>('GET', '/profile');
}
