import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Create isolated axios instance for React Query
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to parse structured errors
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const errorObj = err.response?.data?.error || {
      code: 'UNEXPECTED_ERROR',
      message: err.message || 'An unexpected error occurred.',
      retryable: true
    };
    return Promise.reject(errorObj);
  }
);

// 1. Chat Clear Mutation
export function useClearChatMutation() {
  return useMutation({
    mutationFn: async (sessionId) => {
      const response = await apiClient.post('/chat/clear', { sessionId });
      return response.data;
    }
  });
}

// 2. Document Analyze Mutation (Triggers Async Job, returns jobId)
export function useDocumentAnalyzeMutation() {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/document/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data; // { success: true, jobId: "..." }
    }
  });
}

// 3. Document Status Query (Checks progress of Async Job)
export function useDocumentStatusQuery(jobId, enabled = false) {
  return useQuery({
    queryKey: ['documentStatus', jobId],
    queryFn: async () => {
      const response = await apiClient.get(`/document/status/${jobId}`);
      return response.data; // { status, result }
    },
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      // Poll every 1 second until completed or failed
      const data = query.state.data;
      if (data && (data.status === 'completed' || data.status === 'failed')) {
        return false;
      }
      return 1000;
    }
  });
}

// 4. Claim Analyze Mutation
export function useClaimAnalyzeMutation() {
  return useMutation({
    mutationFn: async (claimData) => {
      const response = await apiClient.post('/claim/analyze', { claimData });
      return response.data;
    }
  });
}

// 5. Analytics Impact Mutation
export function useAnalyticsImpactMutation() {
  return useMutation({
    mutationFn: async ({ amount, years, inflationRate }) => {
      const response = await apiClient.post('/analytics/impact', { amount, years, inflationRate });
      return response.data;
    }
  });
}

// 6. PDF Generation Mutation
export function useGeneratePdfMutation() {
  return useMutation({
    mutationFn: async ({ documentType, claimData, templateVersion = 'v2' }) => {
      const response = await apiClient.post('/document/generate-pdf', {
        documentType,
        claimData,
        templateVersion
      }, {
        responseType: 'arraybuffer'
      });
      return response.data; // binary array buffer
    }
  });
}
