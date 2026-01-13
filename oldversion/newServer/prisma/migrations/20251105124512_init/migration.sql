-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "specialization" TEXT,
    "subjects" TEXT,
    "experience" INTEGER,
    "education" TEXT,
    "qualification" TEXT,
    "skills" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "schoolName" TEXT NOT NULL,
    "district" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER,
    "userId" INTEGER,
    "position" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "region" TEXT,
    "hours" TEXT,
    "salary" TEXT,
    "housing" TEXT,
    "benefits" TEXT,
    "contacts" TEXT,
    "email" TEXT,
    "support" TEXT,
    "studentEmployment" TEXT,
    "duties" TEXT,
    "openDate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "teacherId" INTEGER,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_userId_key" ON "teachers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_userId_key" ON "schools"("userId");

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
