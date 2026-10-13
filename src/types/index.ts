export type Gender = 'MALE' | 'FEMALE'

export type StudentStatus = 'STUDYING' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED'

export type AttendanceStatus = 'CO_MAT' | 'VANG_PHEP' | 'VANG_KHONG_PHEP' | 'DI_MUON'

export type ScoreType = 'TX' | 'GK' | 'CK'

export type RewardType = 'REWARD' | 'DISCIPLINE'

export type AcademicRank = 'XUAT_SAC' | 'GIOI' | 'KHA' | 'TRUNG_BINH' | 'YEU'

export interface SchoolYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface Semester {
  id: string
  name: string
  code: string
  schoolYearId: string
  startDate: string
  endDate: string
}

export interface Grade {
  id: string
  name: string
  code: string
  level: number
}

export interface Subject {
  id: string
  name: string
  code: string
  gradeId: string
  isElective: boolean
  description?: string
}

export interface Teacher {
  id: string
  code: string
  fullName: string
  gender: Gender
  dateOfBirth: string
  phone: string
  email: string
  address: string
  subjectIds: string[]
  hireDate: string
  status: 'ACTIVE' | 'RESIGNED'
}

export interface Parent {
  id: string
  fullName: string
  gender: Gender
  phone: string
  email: string
  address: string
  occupation: string
  studentId: string
  relation: string
}

export interface Student {
  id: string
  code: string
  fullName: string
  gender: Gender
  dateOfBirth: string
  placeOfBirth: string
  ethnicity: string
  religion: string
  phone: string
  email: string
  address: string
  enrollmentDate: string
  status: StudentStatus
  avatarColor: string
}

export interface ClassRoom {
  id: string
  name: string
  code: string
  gradeId: string
  schoolYearId: string
  homeroomTeacherId?: string
  maxStudents: number
}

export interface StudentClass {
  id: string
  studentId: string
  classId: string
  schoolYearId: string
  rollNumber: number
}

export interface TeachingAssignment {
  id: string
  teacherId: string
  subjectId: string
  classId: string
  semesterId: string
  schoolYearId: string
}

export interface ClassSession {
  id: string
  classId: string
  date: string
  period: number
  subjectId: string
  teacherId: string
  note?: string
}

export interface Attendance {
  id: string
  sessionId: string
  studentId: string
  status: AttendanceStatus
  note?: string
}

export interface Assessment {
  id: string
  name: string
  subjectId: string
  classId: string
  semesterId: string
  scoreType: ScoreType
  coefficient: number
  schoolYearId: string
}

export interface Score {
  id: string
  studentId: string
  assessmentId: string
  subjectId: string
  classId: string
  semesterId: string
  schoolYearId: string
  scoreType: ScoreType
  value: number
  coefficient: number
  comment?: string
  isLocked: boolean
}

export interface RewardDiscipline {
  id: string
  studentId: string
  type: RewardType
  title: string
  reason: string
  date: string
  decisionNumber: string
}

export interface UserAccount {
  id: string
  username: string
  fullName: string
  email: string
  role: Role
  roleId?: string
  roleLabel?: string
  status: 'ACTIVE' | 'INACTIVE'
  lastLogin?: string
  avatarColor: string
  teacherId?: string
  studentId?: string
  permissions?: string[]
}

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

export interface RoleDefinition {
  id: string
  name: Role
  label: string
  description?: string
  permissions: string[]
}

export interface RolePermission {
  role: Role
  label: string
  permissions: string[]
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  type: 'info' | 'success' | 'warning'
}
