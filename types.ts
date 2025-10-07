export interface StyleOption {
  id: string;
  label: string;
  prompt: string;
}

export interface StyleCategory {
  title: string;
  options: StyleOption[];
}
