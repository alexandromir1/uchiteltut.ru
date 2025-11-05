import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword, generateToken, getUserIdFromContext } from '../lib/auth.js';

export const resolvers = {
  Query: {
    // Get current user
    me: async (parent, args, context) => {
      const userId = getUserIdFromContext(context);
      if (!userId) return null;

      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          teacher: true,
          school: true,
        },
      });
    },

    // Get all jobs
    jobs: async (parent, { active }) => {
      const where = active !== undefined ? { isActive: active } : {};
      
      return await prisma.job.findMany({
        where,
        orderBy: [
          { schoolId: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          schoolInfo: true,
          user: true,
        },
      });
    },

    // Get job by ID
    job: async (parent, { id }) => {
      return await prisma.job.findUnique({
        where: { id: parseInt(id) },
        include: {
          schoolInfo: true,
          user: true,
        },
      });
    },

    // Get all teachers
    teachers: async (parent, { publicOnly }) => {
      const where = publicOnly ? { isPublic: true } : {};
      
      return await prisma.teacher.findMany({
        where,
        include: {
          user: true,
        },
      });
    },

    // Get teacher by ID
    teacher: async (parent, { id }) => {
      return await prisma.teacher.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
        },
      });
    },

    // Get all schools
    schools: async () => {
      return await prisma.school.findMany({
        include: {
          user: true,
        },
      });
    },

    // Get school by ID
    school: async (parent, { id }) => {
      return await prisma.school.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
        },
      });
    },

    // Get responses
    responses: async (parent, { jobId }) => {
      const where = jobId ? { jobId } : {};
      
      return await prisma.response.findMany({
        where,
        include: {
          user: true,
          job: true,
          teacher: true,
        },
      });
    },

    // Get response by ID
    response: async (parent, { id }) => {
      return await prisma.response.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
          job: true,
          teacher: true,
        },
      });
    },
  },

  Mutation: {
    // Register
    register: async (parent, { input }) => {
      const { email, password, name, role, schoolName, district, phone } = input;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('Пользователь уже существует');
      }

      const hashedPassword = await hashPassword(password);

      // Create user and profile in transaction
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role,
          },
        });

        if (role === 'school') {
          await tx.school.create({
            data: {
              userId: newUser.id,
              schoolName: schoolName || name,
              district,
              phone,
            },
          });
        } else if (role === 'teacher') {
          await tx.teacher.create({
            data: {
              userId: newUser.id,
              fullName: name,
              contactEmail: email,
              contactPhone: phone,
            },
          });
        }

        return newUser;
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            teacher: true,
            school: true,
          },
        }),
      };
    },

    // Login
    login: async (parent, { input }) => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          teacher: true,
          school: true,
        },
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const validPassword = await comparePassword(password, user.password);
      if (!validPassword) {
        throw new Error('Неверный пароль');
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user,
      };
    },

    // Create job
    createJob: async (parent, { input }, context) => {
      const userId = getUserIdFromContext(context);
      if (!userId) {
        throw new Error('Необходима авторизация');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { school: true },
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const schoolId = user.school?.id || null;

      const job = await prisma.job.create({
        data: {
          ...input,
          schoolId,
          userId,
          school: input.school || user.school?.schoolName || 'Не указано',
        },
        include: {
          schoolInfo: true,
          user: true,
        },
      });

      return job;
    },

    // Update job
    updateJob: async (parent, { id, input }, context) => {
      const userId = getUserIdFromContext(context);
      if (!userId) {
        throw new Error('Необходима авторизация');
      }

      const job = await prisma.job.findUnique({
        where: { id: parseInt(id) },
      });

      if (!job) {
        throw new Error('Вакансия не найдена');
      }

      if (job.userId !== userId) {
        throw new Error('У вас нет прав на изменение этой вакансии');
      }

      return await prisma.job.update({
        where: { id: parseInt(id) },
        data: input,
        include: {
          schoolInfo: true,
          user: true,
        },
      });
    },

    // Delete job
    deleteJob: async (parent, { id }, context) => {
      const userId = getUserIdFromContext(context);
      if (!userId) {
        throw new Error('Необходима авторизация');
      }

      const job = await prisma.job.findUnique({
        where: { id: parseInt(id) },
      });

      if (!job) {
        throw new Error('Вакансия не найдена');
      }

      if (job.userId !== userId) {
        throw new Error('У вас нет прав на удаление этой вакансии');
      }

      await prisma.job.delete({
        where: { id: parseInt(id) },
      });

      return true;
    },

    // Create response
    createResponse: async (parent, { input }, context) => {
      const userId = getUserIdFromContext(context);
      if (!userId) {
        throw new Error('Необходима авторизация');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { teacher: true },
      });

      const response = await prisma.response.create({
        data: {
          ...input,
          userId,
          teacherId: user?.teacher?.id || null,
        },
        include: {
          user: true,
          job: true,
          teacher: true,
        },
      });

      return response;
    },

    // Delete response
    deleteResponse: async (parent, { id }, context) => {
      const userId = getUserIdFromContext(context);
      if (!userId) {
        throw new Error('Необходима авторизация');
      }

      const response = await prisma.response.findUnique({
        where: { id: parseInt(id) },
      });

      if (!response) {
        throw new Error('Отклик не найден');
      }

      if (response.userId !== userId) {
        throw new Error('У вас нет прав на удаление этого отклика');
      }

      await prisma.response.delete({
        where: { id: parseInt(id) },
      });

      return true;
    },
  },
};

