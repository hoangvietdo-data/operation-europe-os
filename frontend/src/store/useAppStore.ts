import { create } from 'zustand';

interface AppState {
  scholarships: any[];
  universities: any[];
  setScholarships: (scholarships: any[]) => void;
  setUniversities: (universities: any[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  scholarships: [],
  universities: [],
  setScholarships: (scholarships) => set({ scholarships }),
  setUniversities: (universities) => set({ universities }),
}));
