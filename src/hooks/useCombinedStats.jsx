// src/hooks/useCombinedStats.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../Config";

// Since API_BASE_URL is in the same file, define it here
// export const API_BASE_URL = "http://172.20.0.9/laravel/myhomedashboard/api/";
// export const API_BASE_URL = "http://127.0.0.1:8000/api/";

const useCombinedStats = (userToken) => {
  const [combinedStats, setCombinedStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchCombinedData = async () => {
    if (!userToken?.token) return;
    
    setLoading(true);
    try {
      // Fetch both inbox and participant data concurrently
      const [inboxResponse, participantResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}getData`, {
          headers: {
            "Content-Type": "application/json",
            Accept: 'application/json',
            Authorization: `Bearer ${userToken.token}`
          }
        }),
        axios.get(`${API_BASE_URL}participants`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userToken.token}`
          }
        })
      ]);

      // Process inbox data
      const inboxData = inboxResponse.data.allAprvls || [];
      const inboxCounts = {
        total: inboxData.length,
        completed: 0,
        pending: inboxData.length, // As per your original logic
        rejected: 0,
      };

      inboxData.forEach(item => {
        const status = item.Status?.toLowerCase();
        if (status === 'completed') inboxCounts.completed += 1;
        else if (status === 'rejected') inboxCounts.rejected += 1;
      });

      // Process participant data
      const participantData = Array.isArray(participantResponse.data.participantData) 
        ? participantResponse.data.participantData 
        : [];
      
      const participantCounts = {
        total: participantData.length,
        completed: 0,
        pending: 0,
        rejected: 0
      };

      participantData.forEach(row => {
        const status = row.ACTION_STATUS?.toLowerCase();
        if (status === 'completed') {
          participantCounts.completed++;
        } else if (status === 'pending' || status === 'to_do') {
          participantCounts.pending++;
        } else if (status === 'reject') {
          participantCounts.rejected++;
        }
      });

      // Combine the counts
      const combined = {
        total: inboxCounts.total + participantCounts.total,
        completed: inboxCounts.completed + participantCounts.completed,
        pending: inboxCounts.pending + participantCounts.pending,
        rejected: inboxCounts.rejected + participantCounts.rejected
      };

      setCombinedStats(combined);

    } catch (error) {
      console.error("Error fetching combined data:", error);
      // Set default values on error
      setCombinedStats({
        total: 0,
        completed: 0,
        pending: 0,
        rejected: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombinedData();
  }, [userToken?.token]);

  return { combinedStats, loading, refetch: fetchCombinedData };
};

export default useCombinedStats;