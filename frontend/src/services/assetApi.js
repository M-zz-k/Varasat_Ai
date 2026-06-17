import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Asset API failed';
    return Promise.reject(new Error(message));
  }
);

export async function fetchAssetGraph(familyId = 'demo') {
  const response = await api.get(`/assets/graph?familyId=${familyId}`);
  return response.data;
}

export async function buildGraphFromExtraction(familyId, deceasedName, extractedData) {
  const response = await api.post('/assets/build-from-extraction', {
    familyId,
    deceasedName,
    extractedData,
  });
  return response.data;
}

export async function explainAssetMap(graphData, language = 'English') {
  const response = await api.post('/assets/explain-map', {
    graph: graphData,
    language,
  });
  return response.data;
}

export async function buildComplexGraphFromExtraction(familyId, complexData) {
  const response = await api.post('/assets/build-complex-from-extraction', {
    familyId,
    complexData,
  });
  return response.data;
}

export async function resolveGraphEntities(familyId) {
  const response = await api.post('/assets/resolve-entities', {
    familyId
  });
  return response.data;
}
