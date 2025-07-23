// src/services/sampleService.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => localStorage.getItem("token");

// Helper for authorized requests
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(config => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Sample management API calls
export const updateSample = async (id, payload) => {
    const response = await axiosInstance.put(`/samples/${id}`, payload);
    return response.data;
};

export const takeSampleApi = async (id, purpose, takenBy) => {
    const response = await axiosInstance.put(`/samples/${id}/take`, { purpose, taken_by: takenBy });
    return response.data;
};

export const putBackSampleApi = async (id, position, returnedBy, returnPurpose) => {
    const response = await axiosInstance.put(`/samples/putback/${id}`, { position, returned_by: returnedBy, return_purpose: returnPurpose });
    return response.data;
};

export const deleteSampleApi = async (id) => {
    const response = await axiosInstance.delete(`/samples/${id}`);
    return response.data;
};

export const increasePositionsApi = async (shelf, division, currentPosition) => {
    const response = await axiosInstance.patch(`/samples/increase-positions-by-shelf-division`, { shelf, division, currentPosition });
    return response.data;
};

export const reducePositionsApi = async (shelf, division, currentPosition) => {
    const response = await axiosInstance.patch(`/samples/decrease-positions-by-shelf-division`, { shelf, division, currentPosition });
    return response.data;
};

export const normalizeDivisionApi = async (shelf, division) => {
    const response = await axiosInstance.patch(`/samples/normalize-positions-in-division`, { shelf, division });
    return response.data;
};

export const fetchSamplesInDivisionApi = async (shelf, division) => {
    // Assuming an endpoint to fetch samples for a specific shelf and division
    const response = await axiosInstance.get(`/samples/division/${shelf}/${division}`);
    return response.data;
};