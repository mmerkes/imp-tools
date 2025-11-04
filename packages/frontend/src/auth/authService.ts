import { getApiEndpoint } from "../utils/endpoints";

export const login = async (email: string, password: string): Promise<boolean> => {
  const response = await fetch(`${getApiEndpoint()}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('jwt_token', data.token);
    return true;
  }
  return false;
};

export interface BasicUser {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    displayName?: string,
}

export const register = async (user: BasicUser): Promise<boolean> => {
  const response = await fetch(`${getApiEndpoint()}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('jwt_token', data.token);
    return true;
  }
  return false;
};

export const logout = () => localStorage.removeItem('jwt_token');

export const getToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};