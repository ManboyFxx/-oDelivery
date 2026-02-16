import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchPendingJobsFromApi,
  subscribeToJobsViaPolling,
  processJob,
} from '../services/printJobsService';
import { PrintJob } from '../types';
import { PollingService } from '../services/pollingService';

interface UsePrintJobsOptions {
  deviceId: string;
  autoPrint: boolean;
  onPrint: (htmlContent: string) => Promise<void>;
  apiConfigured: boolean;
}

export function usePrintJobs({ deviceId, autoPrint, onPrint, apiConfigured }: UsePrintJobsOptions) {
  const [pendingJobs, setPendingJobs] = useState<PrintJob[]>([]);
  const [printedJobs, setPrintedJobs] = useState<PrintJob[]>(() => {
    try {
      const saved = localStorage.getItem('printed_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load printed jobs:', e);
      return [];
    }
  });

  // Persist printed jobs whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('printed_jobs', JSON.stringify(printedJobs.slice(0, 50))); // Keep last 50
    } catch (e) {
      console.error('Failed to save printed jobs:', e);
    }
  }, [printedJobs]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const pollingRef = useRef<PollingService | null>(null);

  // Define handleProcessJob first so it can be used in effects
  const handleProcessJob = useCallback(
    async (job: PrintJob) => {
      try {
        const success = await processJob(job, deviceId, onPrint);

        if (success) {
          // Remove from pending
          setPendingJobs((prev) => prev.filter((j) => j.id !== job.id));

          // Add to printed history (local)
          const printedJob: PrintJob = {
            ...job,
            status: 'printed',
            printed_at: new Date().toISOString(),
            device_id: deviceId,
          };
          setPrintedJobs((prev) => {
            const newList = [printedJob, ...prev];
            return newList.slice(0, 50); // Keep max 50 in memory too
          });
        }

        return success;
      } catch (err: any) {
        console.error('Error processing job:', err);
        return false;
      }
    },
    [deviceId, onPrint]
  );

  // Load initial jobs only when API is configured
  useEffect(() => {
    if (!apiConfigured) {
      setLoading(false);
      return;
    }

    const loadInitialJobs = async () => {
      setLoading(true);
      try {
        const jobs = await fetchPendingJobsFromApi();
        setPendingJobs(jobs);
        setError(null);

        // Auto-process if enabled
        if (autoPrint) {
          for (const job of jobs) {
            await handleProcessJob(job);
          }
        }
      } catch (err: any) {
        console.error('Error loading initial jobs:', err);
        setError(err.message || 'Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };

    loadInitialJobs();
  }, [apiConfigured, autoPrint, handleProcessJob]);

  // Subscribe to polling service only when API is configured
  useEffect(() => {
    if (!apiConfigured) {
      // Stop polling if API becomes unconfigured
      if (pollingRef.current) {
        pollingRef.current.stop();
        pollingRef.current = null;
      }
      return;
    }

    const polling = subscribeToJobsViaPolling(
      (allJobs) => {
        setLastChecked(new Date());

        // Update pending jobs - keep existing ones that are still in the list
        setPendingJobs((prevJobs) => {
          // Get IDs of jobs that are still pending on the server
          const jobIds = new Set(allJobs.map((job) => job.id));

          // Remove jobs that are no longer on the server (likely already printed)
          // but keep any local pending jobs for now
          const existing = prevJobs.filter((job) => jobIds.has(job.id));

          // Add new jobs from server
          const newJobIds = new Set(existing.map((job) => job.id));
          const newJobs = allJobs.filter((job) => !newJobIds.has(job.id));

          return [...existing, ...newJobs];
        });

        // Auto-process if enabled
        if (autoPrint) {
          allJobs.forEach((job) => {
            handleProcessJob(job).catch((err) => {
              console.error('Error auto-printing job:', err);
            });
          });
        }
      },
      (err) => {
        console.error('Polling error:', err);
        setError(err.message || 'Erro de conexão');
      }
    );

    pollingRef.current = polling;

    return () => {
      polling.stop();
    };
  }, [apiConfigured, autoPrint]); // Removido handleProcessJob para evitar reinicializações desnecessárias

  const manualPrint = useCallback(
    async (jobId: string) => {
      const job = pendingJobs.find((j) => j.id === jobId);
      if (!job) {
        console.error('Job not found:', jobId);
        return false;
      }

      return await handleProcessJob(job);
    },
    [pendingJobs, handleProcessJob]
  );

  const forceRefresh = useCallback(async () => {
    try {
      const jobs = await fetchPendingJobsFromApi();
      setPendingJobs(jobs);
      setLastChecked(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error during manual refresh:', err);
      setError(err.message || 'Erro ao atualizar pedidos');
    }
  }, []);

  return {
    pendingJobs,
    printedJobs,
    loading,
    error,
    lastChecked,
    manualPrint,
    forceRefresh,
  };
}
