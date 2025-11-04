
function isLocalHost(hostname: string = window.location.hostname): boolean {
  return ['localhost', '127.0.0.1', '', '::1'].includes(hostname);
}

const LOCAL_API_URL = 'http://localhost:8787';
const WORKER_API_URL = 'https://imp-backend.matt-merkes.workers.dev';

const API_ENDPOINT = isLocalHost() ? LOCAL_API_URL : WORKER_API_URL;

export function getApiEndpoint() {
    return API_ENDPOINT;
}