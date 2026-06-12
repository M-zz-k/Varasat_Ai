import { create } from 'zustand';

export const useDocumentStore = create((set) => ({
  documents: [],
  activeDocument: null,
  ocrResults: null,
  uploading: false,
  uploadProgress: 0,

  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
  setActiveDocument: (doc) => set({ activeDocument: doc }),
  setOcrResults: (results) => set({ ocrResults: results }),
  setUploading: (isUploading) => set({ uploading: isUploading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  resetDocuments: () => set({
    documents: [],
    activeDocument: null,
    ocrResults: null,
    uploading: false,
    uploadProgress: 0
  })
}));
