import { create } from "zustand";

export interface WizardState {
  currentStep: number;
  totalSteps: number;
  setTotalSteps: (totalSteps: number) => void;
  setStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;
  reset: () => void;
}

export function createWizardStore() {
  return create<WizardState>((set) => ({
    currentStep: 1,
    totalSteps: 1,
    setTotalSteps: (totalSteps) => set({ totalSteps }),
    setStep: (step) => set({ currentStep: step }),
    goNext: () =>
      set((state) => ({
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
      })),
    goBack: () =>
      set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
    reset: () => set({ currentStep: 1 }),
  }));
}
