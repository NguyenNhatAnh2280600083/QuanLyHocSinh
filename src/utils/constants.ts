import type { Gender, StudentStatus, AttendanceStatus, ScoreType, RewardType, Role } from '@/types'

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
}

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  STUDYING: 'Đang theo học',
  GRADUATED: 'Tốt nghiệp',
  TRANSFERRED: 'Chuyển trường',
  SUSPENDED: 'Thôi học',
}

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  CO_MAT: 'Có mặt',
  VANG_PHEP: 'Vắng có phép',
  VANG_KHONG_PHEP: 'Vắng không phép',
  DI_MUON: 'Đi muộn',
}

export const SCORE_TYPE_LABELS: Record<ScoreType, string> = {
  TX: 'Thường xuyên',
  GK: 'Giữa kỳ',
  CK: 'Cuối kỳ',
}

export const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  REWARD: 'Khen thưởng',
  DISCIPLINE: 'Kỷ luật',
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Quản trị viên',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học sinh',
  PARENT: 'Phụ huynh',
}

export const ACADEMIC_RANK_LABELS: Record<string, string> = {
  XUAT_SAC: 'Xuất sắc',
  GIOI: 'Giỏi',
  KHA: 'Khá',
  TRUNG_BINH: 'Trung bình',
  YEU: 'Yếu',
}

export function classifyRank(avg: number): { key: string; label: string; color: string } {
  if (avg >= 9) return { key: 'XUAT_SAC', label: 'Xuất sắc', color: 'text-success' }
  if (avg >= 8) return { key: 'GIOI', label: 'Giỏi', color: 'text-accent' }
  if (avg >= 6.5) return { key: 'KHA', label: 'Khá', color: 'text-primary' }
  if (avg >= 5) return { key: 'TRUNG_BINH', label: 'Trung bình', color: 'text-warning' }
  return { key: 'YEU', label: 'Yếu', color: 'text-destructive' }
}

export const ATTENDANCE_STYLES: Record<AttendanceStatus, string> = {
  CO_MAT: 'bg-success/15 text-success',
  VANG_PHEP: 'bg-warning/15 text-warning',
  VANG_KHONG_PHEP: 'bg-destructive/15 text-destructive',
  DI_MUON: 'bg-warning/15 text-warning',
}
