import { MyStateCreator } from './store';

export type SettingsSlice = {
  openAIKey: string | null;
  openPipeKey: string | null;
  selectedModel: string;
  actions: {
    update: (values: Partial<SettingsSlice>) => void;
  };
};
export const createSettingsSlice: MyStateCreator<SettingsSlice> = (set) => ({
  openAIKey: null,
  openPipeKey: null,
  selectedModel: 'gpt-3.5-turbo',
  actions: {
    update: (values) => {
      set((state) => {
        state.settings = { ...state.settings, ...values };
      });
    },
  },
});
