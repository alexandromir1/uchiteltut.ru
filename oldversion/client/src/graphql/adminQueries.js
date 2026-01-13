import { gql } from '@apollo/client';

export const GET_STATISTICS = gql`
  query GetStatistics {
    statistics {
      totalJobs
      activeJobs
      totalResponses
      totalTeachers
      totalSchools
      jobsByRegion {
        region
        count
      }
      responsesByRegion {
        region
        count
      }
      recentResponses {
        id
        name
        email
        phone
        createdAt
        job {
          id
          position
          school
          region
        }
        user {
          id
          name
          email
        }
      }
    }
  }
`;

