import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched jobs from Supabase:', data);

      // Преобразуем данные в нужный формат
      const formattedJobs = data.map(job => ({
        id: job.id,
        position: job.position,
        school: job.school,
        hours: job.hours,
        salary: job.salary,
        region: job.region,
        housing: job.housing,
        benefits: job.benefits,
        contacts: job.contacts,
        email: job.email,
        support: job.support,
        studentEmployment: job.student_employment,
        duties: job.duties,
        openDate: job.open_date || job.created_at,
        school_id: job.school_id,
        created_at: job.created_at
      }));

      setJobs(formattedJobs);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
      // Тестовые данные
      setJobs([
        {
          id: "1",
          position: "Учитель математики",
          school: "Тестовая школа №1",
          region: "Якутск",
          hours: "18 часов",
          salary: "45000 руб.",
          housing: "Предоставляется общежитие",
          benefits: "Социальный пакет",
          contacts: "+7 (999) 123-45-67",
          email: "school1@example.com",
          openDate: new Date().toISOString(),
          school_id: "test-user-1"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const addJob = async (jobData) => {
    try {
      console.log('Adding job:', jobData);

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Job added successfully:', data);

      // Обновляем список
      await fetchJobs();
      return data[0];
    } catch (err) {
      console.error('Error adding job:', err);
      throw err;
    }
  };

  const deleteJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      throw err;
    }
  };

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
    addJob,
    deleteJob
  };
};