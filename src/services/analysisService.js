// src/services/analysisService.js
import axios from '../config/axios';

export const analysisService = {
  // GET /api/analysis?year=2025
  getAnalysis: (year) => axios.get('/analysis', { params: { year } }),
};