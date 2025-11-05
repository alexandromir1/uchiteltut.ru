import { gql } from '@apollo/client';

// Auth Query
export const ME = gql`
  query Me {
    me {
      id
      email
      name
      role
      teacher {
        id
        fullName
        specialization
        subjects
        experience
        education
        qualification
        skills
        contactEmail
        contactPhone
      }
      school {
        id
        schoolName
        district
        phone
      }
    }
  }
`;

// Job Queries
export const GET_JOBS = gql`
  query GetJobs($active: Boolean) {
    jobs(active: $active) {
      id
      position
      school
      region
      hours
      salary
      housing
      benefits
      contacts
      email
      support
      studentEmployment
      duties
      openDate
      isActive
      createdAt
      schoolInfo {
        id
        schoolName
        district
      }
      user {
        id
        name
        email
      }
    }
  }
`;

export const GET_JOB = gql`
  query GetJob($id: ID!) {
    job(id: $id) {
      id
      position
      school
      region
      hours
      salary
      housing
      benefits
      contacts
      email
      support
      studentEmployment
      duties
      openDate
      isActive
      createdAt
      schoolInfo {
        id
        schoolName
        district
        phone
      }
      user {
        id
        name
        email
      }
    }
  }
`;

// Teacher Queries
export const GET_TEACHERS = gql`
  query GetTeachers($publicOnly: Boolean) {
    teachers(publicOnly: $publicOnly) {
      id
      userId
      fullName
      specialization
      subjects
      experience
      education
      qualification
      skills
      contactEmail
      contactPhone
      isPublic
      user {
        id
        email
        name
      }
    }
  }
`;

export const GET_TEACHER = gql`
  query GetTeacher($id: ID!) {
    teacher(id: $id) {
      id
      userId
      fullName
      specialization
      subjects
      experience
      education
      qualification
      skills
      contactEmail
      contactPhone
      isPublic
      user {
        id
        email
        name
      }
    }
  }
`;

// School Queries
export const GET_SCHOOLS = gql`
  query GetSchools {
    schools {
      id
      userId
      schoolName
      district
      phone
      user {
        id
        email
        name
      }
    }
  }
`;

// Response Queries
export const GET_RESPONSES = gql`
  query GetResponses($jobId: Int) {
    responses(jobId: $jobId) {
      id
      userId
      jobId
      teacherId
      name
      email
      phone
      message
      createdAt
      job {
        id
        position
        school
      }
      user {
        id
        name
        email
      }
    }
  }
`;

