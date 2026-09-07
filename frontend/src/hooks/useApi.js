import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../utils/api';

export const useApiGet = (key, url, options = {}) => {
    return useQuery(
        key,
        async () => {
            const response = await api.get(url);
            return response.data;
        },
        options
    );
};

export const useApiPost = (url, options = {}) => {
    const queryClient = useQueryClient();
    
    return useMutation(
        async (data) => {
            const response = await api.post(url, data);
            return response.data;
        },
        {
            onSuccess: () => {
                if (options.invalidate) {
                    queryClient.invalidateQueries(options.invalidate);
                }
                if (options.onSuccess) {
                    options.onSuccess();
                }
            },
            onError: (error) => {
                if (options.onError) {
                    options.onError(error);
                }
            }
        }
    );
};

export const useApiPut = (url, options = {}) => {
    const queryClient = useQueryClient();
    
    return useMutation(
        async (data) => {
            const response = await api.put(url, data);
            return response.data;
        },
        {
            onSuccess: () => {
                if (options.invalidate) {
                    queryClient.invalidateQueries(options.invalidate);
                }
                if (options.onSuccess) {
                    options.onSuccess();
                }
            },
            onError: (error) => {
                if (options.onError) {
                    options.onError(error);
                }
            }
        }
    );
};

export const useApiDelete = (url, options = {}) => {
    const queryClient = useQueryClient();
    
    return useMutation(
        async () => {
            const response = await api.delete(url);
            return response.data;
        },
        {
            onSuccess: () => {
                if (options.invalidate) {
                    queryClient.invalidateQueries(options.invalidate);
                }
                if (options.onSuccess) {
                    options.onSuccess();
                }
            },
            onError: (error) => {
                if (options.onError) {
                    options.onError(error);
                }
            }
        }
    );
};