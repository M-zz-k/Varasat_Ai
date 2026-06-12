import { create } from 'zustand';

export const useClaimStore = create((set) => ({
  claimantName: '',
  deceasedName: '',
  relation: '',
  institution: '',
  assetType: '',
  amount: '',
  currentStep: 1,

  setClaimantDetails: (details) => set((state) => ({ ...state, ...details })),
  setCurrentStep: (step) => set({ currentStep: step }),
  resetClaim: () => set({
    claimantName: '',
    deceasedName: '',
    relation: '',
    institution: '',
    assetType: '',
    amount: '',
    currentStep: 1
  })
}));
