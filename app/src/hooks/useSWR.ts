import useSWR from "swr";
import {
  api,
  News,
  Program,
  Curriculum,
  Research,
  Achievement,
} from "@/lib/api";

// SWR configuration options
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  shouldRetryOnError: false,
};

// Custom hook for fetching news
export const useNews = () => {
  const { data, error, isLoading, mutate } = useSWR<News[]>(
    "/api/news",
    () => api.news.findAll(),
    swrConfig,
  );

  return {
    news: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Custom hook for fetching programs
export const usePrograms = (params?: { status?: string; level?: string }) => {
  const key = params
    ? `/api/programs?${new URLSearchParams(params as any).toString()}`
    : "/api/programs";

  const { data, error, isLoading, mutate } = useSWR<Program[]>(
    key,
    () => api.programs.findAll(params),
    swrConfig,
  );

  return {
    programs: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Custom hook for fetching curriculums
export const useCurriculums = (programId?: string) => {
  const key = programId
    ? `/api/curriculums?programId=${programId}`
    : "/api/curriculums";

  const { data, error, isLoading, mutate } = useSWR<Curriculum[]>(
    key,
    () => api.curriculums.findAll(programId),
    swrConfig,
  );

  return {
    curriculums: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Custom hook for fetching research
export const useResearch = (type?: "PROJECT" | "PUBLICATION") => {
  const key = type ? `/api/research?type=${type}` : "/api/research";

  const { data, error, isLoading, mutate } = useSWR<Research[]>(
    key,
    () => api.research.findAll(type),
    swrConfig,
  );

  return {
    research: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Custom hook for fetching achievements
export const useAchievements = (filters?: {
  type?: string;
  level?: string;
  visibility?: string;
  isHighlight?: boolean;
}) => {
  const key = filters
    ? `/api/achievements?${new URLSearchParams(filters as any).toString()}`
    : "/api/achievements";

  const { data, error, isLoading, mutate } = useSWR<Achievement[]>(
    key,
    () => api.achievements.findAll(filters),
    swrConfig,
  );

  return {
    achievements: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};
