import { apiRequest } from './client';

export function getOrganizations(token) {
  return apiRequest('/organizations', {}, { token });
}
