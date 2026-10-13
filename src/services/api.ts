import type {
  Student,
  Teacher,
  ClassRoom,
  Subject,
  Score,
  Attendance,
  RewardDiscipline,
  UserAccount,
  SchoolYear,
  Semester,
  Grade,
  Assessment,
  TeachingAssignment,
  ClassSession,
  StudentClass,
  Parent,
  NotificationItem,
  RoleDefinition,
} from '@/types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  getSchoolYears: async (): Promise<SchoolYear[]> => request('/school-years'),
  getSemesters: async (): Promise<Semester[]> => request('/semesters'),
  getGrades: async (): Promise<Grade[]> => request('/grades'),
  getSubjects: async (): Promise<Subject[]> => request('/subjects'),
  getStudents: async (): Promise<Student[]> => request('/students'),
  getTeachers: async (): Promise<Teacher[]> => request('/teachers'),
  getClassRooms: async (): Promise<ClassRoom[]> => request('/class-rooms'),
  getStudentClasses: async (): Promise<StudentClass[]> => request('/student-classes'),
  getParents: async (): Promise<Parent[]> => request('/parents'),
  getTeachingAssignments: async (): Promise<TeachingAssignment[]> => request('/teaching-assignments'),
  getClassSessions: async (): Promise<ClassSession[]> => request('/class-sessions'),
  getAttendances: async (): Promise<Attendance[]> => request('/attendances'),
  getAssessments: async (): Promise<Assessment[]> => request('/assessments'),
  getScores: async (): Promise<Score[]> => request('/scores'),
  getRewardDisciplines: async (): Promise<RewardDiscipline[]> => request('/reward-disciplines'),
  getRoles: async (): Promise<RoleDefinition[]> => request('/roles'),
  getUserAccounts: async (): Promise<UserAccount[]> => request('/user-accounts'),
  getNotifications: async (): Promise<NotificationItem[]> => request('/notifications'),

  createStudent: async (data: Partial<Student>): Promise<Student> => request('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: async (id: string, data: Partial<Student>): Promise<Student> => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: async (id: string): Promise<void> => { await request(`/students/${id}`, { method: 'DELETE' }) },

  createTeacher: async (data: Partial<Teacher>): Promise<Teacher> => request('/teachers', { method: 'POST', body: JSON.stringify(data) }),
  updateTeacher: async (id: string, data: Partial<Teacher>): Promise<Teacher> => request(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeacher: async (id: string): Promise<void> => { await request(`/teachers/${id}`, { method: 'DELETE' }) },

  createClassRoom: async (data: Partial<ClassRoom>): Promise<ClassRoom> => request('/class-rooms', { method: 'POST', body: JSON.stringify(data) }),
  updateClassRoom: async (id: string, data: Partial<ClassRoom>): Promise<ClassRoom> => request(`/class-rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClassRoom: async (id: string): Promise<void> => { await request(`/class-rooms/${id}`, { method: 'DELETE' }) },

  createSubject: async (data: Partial<Subject>): Promise<Subject> => request('/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: async (id: string, data: Partial<Subject>): Promise<Subject> => request(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubject: async (id: string): Promise<void> => { await request(`/subjects/${id}`, { method: 'DELETE' }) },

  createTeachingAssignment: async (data: Partial<TeachingAssignment>): Promise<TeachingAssignment> => request('/teaching-assignments', { method: 'POST', body: JSON.stringify(data) }),
  updateTeachingAssignment: async (id: string, data: Partial<TeachingAssignment>): Promise<TeachingAssignment> => request(`/teaching-assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeachingAssignment: async (id: string): Promise<void> => { await request(`/teaching-assignments/${id}`, { method: 'DELETE' }) },

  createScore: async (data: Partial<Score>): Promise<Score> => request('/scores', { method: 'POST', body: JSON.stringify(data) }),
  updateScore: async (id: string, data: Partial<Score>): Promise<Score> => request(`/scores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  createAttendances: async (data: Partial<Attendance>[]): Promise<void> => { await request('/attendances', { method: 'POST', body: JSON.stringify(data) }) },

  createRewardDiscipline: async (data: Partial<RewardDiscipline>): Promise<RewardDiscipline> => request('/reward-disciplines', { method: 'POST', body: JSON.stringify(data) }),
  updateRewardDiscipline: async (id: string, data: Partial<RewardDiscipline>): Promise<RewardDiscipline> => request(`/reward-disciplines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRewardDiscipline: async (id: string): Promise<void> => { await request(`/reward-disciplines/${id}`, { method: 'DELETE' }) },

  createUserAccount: async (data: Partial<UserAccount>): Promise<UserAccount> => request('/user-accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateUserAccount: async (id: string, data: Partial<UserAccount>): Promise<UserAccount> => request(`/user-accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  login: async (username: string, password: string): Promise<{ user: UserAccount; permissions: string[] } | null> => {
    try {
      const res = await request<{ user: UserAccount; permissions: string[] }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      return res
    } catch {
      return null
    }
  },
}

export type Api = typeof api
