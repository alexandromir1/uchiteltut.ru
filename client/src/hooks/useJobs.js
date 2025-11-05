import { useQuery, useMutation } from '@apollo/client';
import { GET_JOBS } from '../graphql/queries';
import { CREATE_JOB, DELETE_JOB } from '../graphql/mutations';

export const useJobs = () => {
  const { data, loading, error, refetch } = useQuery(GET_JOBS, {
    variables: { active: true },
    errorPolicy: 'all',
  });

  const [createJobMutation] = useMutation(CREATE_JOB, {
    refetchQueries: [{ query: GET_JOBS, variables: { active: true } }],
  });

  const [deleteJobMutation] = useMutation(DELETE_JOB, {
    refetchQueries: [{ query: GET_JOBS, variables: { active: true } }],
  });

  const jobs = data?.jobs || [];

  const addJob = async (jobData) => {
    try {
      console.log('Adding job:', jobData);

      const { data: result } = await createJobMutation({
        variables: {
          input: {
            position: jobData.position,
            school: jobData.school,
            region: jobData.region,
            hours: jobData.hours,
            salary: jobData.salary,
            housing: jobData.housing,
            benefits: jobData.benefits,
            contacts: jobData.contacts,
            email: jobData.email,
            support: jobData.support,
            studentEmployment: jobData.student_employment || jobData.studentEmployment,
            duties: jobData.duties,
          },
        },
      });

      console.log('Job added successfully:', result);
      return result?.createJob;
    } catch (err) {
      console.error('Error adding job:', err);
      throw err;
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await deleteJobMutation({
        variables: { id: String(jobId) },
      });
    } catch (err) {
      console.error('Error deleting job:', err);
      throw err;
    }
  };

  return {
    jobs,
    loading,
    error: error?.message || null,
    refetch,
    addJob,
    deleteJob
  };
};