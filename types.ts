
export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export interface SRTFile {
  content: string;
  fileName: string;
}
