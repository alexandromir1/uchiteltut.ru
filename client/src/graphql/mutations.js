import { gql } from '@apollo/client';

// Auth Mutations
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
        teacher {
          id
          fullName
        }
        school {
          id
          schoolName
          district
        }
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
        teacher {
          id
          fullName
        }
        school {
          id
          schoolName
          district
        }
      }
    }
  }
`;

// Job Mutations
export const CREATE_JOB = gql`
  mutation CreateJob($input: JobInput!) {
    createJob(input: $input) {
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
    }
  }
`;

export const UPDATE_JOB = gql`
  mutation UpdateJob($id: ID!, $input: JobInput!) {
    updateJob(id: $id, input: $input) {
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
    }
  }
`;

export const DELETE_JOB = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id)
  }
`;

// Response Mutations
export const CREATE_RESPONSE = gql`
  mutation CreateResponse($input: ResponseInput!) {
    createResponse(input: $input) {
      id
      jobId
      userId
      name
      email
      phone
      message
      createdAt
    }
  }
`;

export const DELETE_RESPONSE = gql`
  mutation DeleteResponse($id: ID!) {
    deleteResponse(id: $id)
  }
`;

