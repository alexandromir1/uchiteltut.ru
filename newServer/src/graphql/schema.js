import gql from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: String!
    teacher: Teacher
    school: School
  }

  type Teacher {
    id: ID!
    userId: Int!
    fullName: String!
    specialization: String
    subjects: String
    experience: Int
    education: String
    qualification: String
    skills: String
    contactEmail: String
    contactPhone: String
    isPublic: Boolean!
    user: User
  }

  type School {
    id: ID!
    userId: Int!
    schoolName: String!
    district: String
    phone: String
    user: User
  }

  type Job {
    id: ID!
    schoolId: Int
    userId: Int
    position: String!
    school: String!
    region: String
    hours: String
    salary: String
    housing: String
    benefits: String
    contacts: String
    email: String
    support: String
    studentEmployment: String
    duties: String
    openDate: String
    isActive: Boolean!
    createdAt: String!
    schoolInfo: School
    user: User
  }

  type Response {
    id: ID!
    userId: Int!
    jobId: Int!
    teacherId: Int
    name: String!
    email: String!
    phone: String
    message: String
    createdAt: String!
    user: User
    job: Job
    teacher: Teacher
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
    role: String!
    schoolName: String
    district: String
    phone: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input JobInput {
    position: String!
    school: String!
    region: String
    hours: String
    salary: String
    housing: String
    benefits: String
    contacts: String
    email: String
    support: String
    studentEmployment: String
    duties: String
  }

  input ResponseInput {
    jobId: Int!
    name: String!
    email: String!
    phone: String
    message: String
  }

  type Query {
    # Auth
    me: User

    # Jobs
    jobs(active: Boolean): [Job!]!
    job(id: ID!): Job

    # Teachers
    teachers(publicOnly: Boolean): [Teacher!]!
    teacher(id: ID!): Teacher

    # Schools
    schools: [School!]!
    school(id: ID!): School

    # Responses
    responses(jobId: Int): [Response!]!
    response(id: ID!): Response
  }

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Jobs
    createJob(input: JobInput!): Job!
    updateJob(id: ID!, input: JobInput!): Job!
    deleteJob(id: ID!): Boolean!

    # Responses
    createResponse(input: ResponseInput!): Response!
    deleteResponse(id: ID!): Boolean!
  }
`;

