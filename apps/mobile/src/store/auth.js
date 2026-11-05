import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS: 'llah_access_token',
  REFRESH: 'llah_refresh_token',
  ORG_ID: 'llah_org_id',
  ORG_NAME: 'llah_org_name',
};

export async function getTokens() {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(KEYS.ACCESS),
    SecureStore.getItemAsync(KEYS.REFRESH),
  ]);
  return { access, refresh };
}

export async function setTokens(access, refresh) {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.ACCESS, access),
    SecureStore.setItemAsync(KEYS.REFRESH, refresh),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.ACCESS),
    SecureStore.deleteItemAsync(KEYS.REFRESH),
    SecureStore.deleteItemAsync(KEYS.ORG_ID),
    SecureStore.deleteItemAsync(KEYS.ORG_NAME),
  ]);
}

export async function getOrgId() {
  return SecureStore.getItemAsync(KEYS.ORG_ID);
}

export async function setOrg(id, name) {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.ORG_ID, id),
    SecureStore.setItemAsync(KEYS.ORG_NAME, name ?? ''),
  ]);
}

export async function getOrgName() {
  return SecureStore.getItemAsync(KEYS.ORG_NAME);
}
