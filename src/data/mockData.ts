import type {
  SchoolYear,
  Semester,
  Grade,
  Subject,
  Teacher,
  Student,
  Parent,
  ClassRoom,
  StudentClass,
  TeachingAssignment,
  ClassSession,
  Attendance,
  Assessment,
  Score,
  RewardDiscipline,
  UserAccount,
  NotificationItem,
  Gender,
} from '@/types'

export const schoolYears: SchoolYear[] = [
  { id: 'sy-2024-2025', name: 'Năm học 2024–2025', startDate: '2024-09-02', endDate: '2025-05-31', isActive: true },
  { id: 'sy-2023-2024', name: 'Năm học 2023–2024', startDate: '2023-09-04', endDate: '2024-05-31', isActive: false },
]

export const semesters: Semester[] = [
  { id: 'sem-1-2425', name: 'Học kỳ I', code: 'HK1', schoolYearId: 'sy-2024-2025', startDate: '2024-09-02', endDate: '2025-01-15' },
  { id: 'sem-2-2425', name: 'Học kỳ II', code: 'HK2', schoolYearId: 'sy-2024-2025', startDate: '2025-01-16', endDate: '2025-05-31' },
  { id: 'sem-1-2324', name: 'Học kỳ I', code: 'HK1', schoolYearId: 'sy-2023-2024', startDate: '2023-09-04', endDate: '2024-01-15' },
  { id: 'sem-2-2324', name: 'Học kỳ II', code: 'HK2', schoolYearId: 'sy-2023-2024', startDate: '2024-01-16', endDate: '2024-05-31' },
]

export const grades: Grade[] = [
  { id: 'g-10', name: 'Khối 10', code: 'K10', level: 10 },
  { id: 'g-11', name: 'Khối 11', code: 'K11', level: 11 },
  { id: 'g-12', name: 'Khối 12', code: 'K12', level: 12 },
]

const baseSubjects = [
  { name: 'Toán học', code: 'TOAN' },
  { name: 'Ngữ văn', code: 'VAN' },
  { name: 'Tiếng Anh', code: 'ANH' },
  { name: 'Vật lý', code: 'LY' },
  { name: 'Hóa học', code: 'HOA' },
  { name: 'Sinh học', code: 'SINH' },
  { name: 'Lịch sử', code: 'SU' },
  { name: 'Địa lý', code: 'DIA' },
  { name: 'Giáo dục công dân', code: 'GDCD' },
  { name: 'Công nghệ', code: 'CN' },
  { name: 'Thể dục', code: 'TD' },
  { name: 'Mỹ thuật', code: 'MT' },
  { name: 'Âm nhạc', code: 'AM' },
  { name: 'Tin học', code: 'TIN' },
  { name: 'Giáo dục quốc phòng', code: 'GQPQ' },
]

export const subjects: Subject[] = baseSubjects.flatMap((s) =>
  grades.map((g) => ({
    id: `${s.code}-${g.code}`,
    name: s.name,
    code: s.code,
    gradeId: g.id,
    isElective: ['MT', 'AM', 'TIN'].includes(s.code),
  }))
)

export const teachers: Teacher[] = [
  { id: 't-001', code: 'GV001', fullName: 'Nguyễn Thị Mai', gender: 'FEMALE', dateOfBirth: '1985-03-15', phone: '0912111001', email: 'nguyenmai@edumanage.edu.vn', address: 'Quận Cầu Giấy, Hà Nội', subjectIds: ['TOAN-K10', 'TOAN-K11', 'TOAN-K12'], hireDate: '2010-08-15', status: 'ACTIVE' },
  { id: 't-002', code: 'GV002', fullName: 'Trần Văn Bình', gender: 'MALE', dateOfBirth: '1980-07-22', phone: '0912111002', email: 'tranbinh@edumanage.edu.vn', address: 'Quận Đống Đa, Hà Nội', subjectIds: ['VAN-K10', 'VAN-K11', 'VAN-K12'], hireDate: '2008-08-15', status: 'ACTIVE' },
  { id: 't-003', code: 'GV003', fullName: 'Lê Thị Hoa', gender: 'FEMALE', dateOfBirth: '1988-11-08', phone: '0912111003', email: 'lehoa@edumanage.edu.vn', address: 'Quận Hoàng Mai, Hà Nội', subjectIds: ['ANH-K10', 'ANH-K11', 'ANH-K12'], hireDate: '2012-08-15', status: 'ACTIVE' },
  { id: 't-004', code: 'GV004', fullName: 'Phạm Văn Đức', gender: 'MALE', dateOfBirth: '1982-05-30', phone: '0912111004', email: 'phamduc@edumanage.edu.vn', address: 'Quận Thanh Xuân, Hà Nội', subjectIds: ['LY-K10', 'LY-K11', 'LY-K12'], hireDate: '2009-08-15', status: 'ACTIVE' },
  { id: 't-005', code: 'GV005', fullName: 'Vũ Thị Lan', gender: 'FEMALE', dateOfBirth: '1986-09-12', phone: '0912111005', email: 'vulan@edumanage.edu.vn', address: 'Quận Hai Bà Trưng, Hà Nội', subjectIds: ['HOA-K10', 'HOA-K11', 'HOA-K12'], hireDate: '2011-08-15', status: 'ACTIVE' },
  { id: 't-006', code: 'GV006', fullName: 'Đặng Văn Sơn', gender: 'MALE', dateOfBirth: '1984-12-18', phone: '0912111006', email: 'dangson@edumanage.edu.vn', address: 'Quận Tây Hồ, Hà Nội', subjectIds: ['SINH-K10', 'SINH-K11', 'SINH-K12'], hireDate: '2010-08-15', status: 'ACTIVE' },
  { id: 't-007', code: 'GV007', fullName: 'Hoàng Thị Giang', gender: 'FEMALE', dateOfBirth: '1987-04-25', phone: '0912111007', email: 'hoanggiang@edumanage.edu.vn', address: 'Quận Long Biên, Hà Nội', subjectIds: ['SU-K10', 'SU-K11', 'SU-K12'], hireDate: '2013-08-15', status: 'ACTIVE' },
  { id: 't-008', code: 'GV008', fullName: 'Bùi Văn Tùng', gender: 'MALE', dateOfBirth: '1983-08-03', phone: '0912111008', email: 'buitung@edumanage.edu.vn', address: 'Quận Ba Đình, Hà Nội', subjectIds: ['DIA-K10', 'DIA-K11', 'DIA-K12'], hireDate: '2008-08-15', status: 'ACTIVE' },
  { id: 't-009', code: 'GV009', fullName: 'Trịnh Thị Hồng', gender: 'FEMALE', dateOfBirth: '1989-06-19', phone: '0912111009', email: 'trinhhong@edumanage.edu.vn', address: 'Quận Hà Đông, Hà Nội', subjectIds: ['GDCD-K10', 'GDCD-K11', 'GDCD-K12'], hireDate: '2014-08-15', status: 'ACTIVE' },
  { id: 't-010', code: 'GV010', fullName: 'Cao Minh Châu', gender: 'MALE', dateOfBirth: '1985-10-07', phone: '0912111010', email: 'caochau@edumanage.edu.vn', address: 'Quận Bắc Từ Liêm, Hà Nội', subjectIds: ['CN-K10', 'CN-K11', 'CN-K12', 'TIN-K10', 'TIN-K11', 'TIN-K12'], hireDate: '2011-08-15', status: 'ACTIVE' },
  { id: 't-011', code: 'GV011', fullName: 'Dương Thị Yến', gender: 'FEMALE', dateOfBirth: '1990-02-14', phone: '0912111011', email: 'duongyen@edumanage.edu.vn', address: 'Quận Nam Từ Liêm, Hà Nội', subjectIds: ['TD-K10', 'TD-K11', 'TD-K12', 'GQPQ-K10', 'GQPQ-K11', 'GQPQ-K12'], hireDate: '2015-08-15', status: 'ACTIVE' },
  { id: 't-012', code: 'GV012', fullName: 'Lý Văn Quang', gender: 'MALE', dateOfBirth: '1981-11-21', phone: '0912111012', email: 'lyquang@edumanage.edu.vn', address: 'Quận Hoàn Kiếm, Hà Nội', subjectIds: ['MT-K10', 'MT-K11', 'MT-K12', 'AM-K10', 'AM-K11', 'AM-K12'], hireDate: '2007-08-15', status: 'ACTIVE' },
]

const avatarColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

const firstNamesMale = ['Minh', 'Nam', 'Đức', 'Long', 'Khoa', 'Huy', 'Bảo', 'An', 'Việt', 'Anh', 'Thành', 'Đạt', 'Tùng', 'Phúc', 'Vinh']
const firstNamesFemale = ['Anh', 'Linh', 'Mai', 'Ngọc', 'Hương', 'Thảo', 'Trang', 'Linh', 'Chi', 'Nga', 'Vân', 'Phương', 'Dung', 'Quỳnh', 'Giang']
const midNames = ['Văn', 'Thị', 'Đức', 'Hoàng', 'Minh', 'Ngọc', 'Thanh', 'Xuân', 'Thu', 'Hồng', 'Kim', 'Bá']
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Vũ', 'Đặng', 'Hoàng', 'Bùi', 'Trịnh', 'Cao', 'Dương', 'Lý', 'Đỗ', 'Hồ', 'Ngô']

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

function makeStudent(code: string, index: number, gender: Gender): Student {
  const firstNames = gender === 'MALE' ? firstNamesMale : firstNamesFemale
  const firstName = pick(firstNames, index)
  const midName = pick(midNames, index + 3)
  const lastName = pick(lastNames, index * 2)
  const fullName = `${lastName} ${midName} ${firstName}`
  const year = 2008 + (index % 4)
  const month = String((index % 12) + 1).padStart(2, '0')
  const day = String((index % 27) + 1).padStart(2, '0')
  return {
    id: code,
    code,
    fullName,
    gender,
    dateOfBirth: `${year}-${month}-${day}`,
    placeOfBirth: pick(['Hà Nội', 'Hải Phòng', 'Nam Định', 'Hưng Yên', 'Bắc Ninh', 'Hà Nam'], index),
    ethnicity: pick(['Kinh', 'Tày', 'Nùng', 'Mường'], index),
    religion: pick(['Không', 'Phật giáo', 'Công giáo'], index),
    phone: `090${String(1000000 + index).padStart(7, '0')}`,
    email: `${code.toLowerCase()}@hocsinh.edu.vn`,
    address: `${100 + index} Đường ${pick(['Láng', 'Đội Cấn', 'Kim Mã', 'Giang Vo', 'Tôn Đức Thắng'], index)}, Quận ${pick(['Cầu Giấy', 'Đống Đa', 'Ba Đình'], index)}, Hà Nội`,
    enrollmentDate: '2023-09-05',
    status: 'STUDYING',
    avatarColor: pick(avatarColors, index),
  }
}

export const students: Student[] = [
  ...Array.from({ length: 12 }, (_, i) => makeStudent(`HS2024${String(i + 1).padStart(3, '0')}`, i, 'MALE')),
  ...Array.from({ length: 12 }, (_, i) => makeStudent(`HS2024${String(i + 13).padStart(3, '0')}`, i + 12, 'FEMALE')),
  ...Array.from({ length: 10 }, (_, i) => makeStudent(`HS2023${String(i + 1).padStart(3, '0')}`, i + 25, 'MALE')),
  ...Array.from({ length: 10 }, (_, i) => makeStudent(`HS2023${String(i + 11).padStart(3, '0')}`, i + 35, 'FEMALE')),
  ...Array.from({ length: 8 }, (_, i) => makeStudent(`HS2022${String(i + 1).padStart(3, '0')}`, i + 45, 'MALE')),
  ...Array.from({ length: 8 }, (_, i) => makeStudent(`HS2022${String(i + 9).padStart(3, '0')}`, i + 53, 'FEMALE')),
]

export const parents: Parent[] = students.slice(0, 30).map((s, i) => {
  const gender: Gender = i % 2 === 0 ? 'MALE' : 'FEMALE'
  const firstNames = gender === 'MALE' ? ['Văn', 'Đức', 'Minh', 'Hữu', 'Thành'] : ['Thị', 'Hoàng', 'Ngọc', 'Thanh', 'Kim']
  const lastName = pick(lastNames, i + 1)
  const firstName = pick(firstNames, i)
  return {
    id: `p-${s.id}`,
    fullName: `${lastName} ${firstName} ${pick(['An', 'Bình', 'Cường', 'Dũng', 'Em', 'Phúc', 'Giang', 'Hùng'], i)}`,
    gender,
    phone: `091${String(3000000 + i).padStart(7, '0')}`,
    email: `ph${i + 1}@gmail.com`,
    address: s.address,
    occupation: pick(['Công nhân', 'Giáo viên', 'Kỹ sư', 'Bác sĩ', 'Kinh doanh', 'Nhân viên văn phòng', 'Nông dân'], i),
    studentId: s.id,
    relation: gender === 'MALE' ? 'Cha' : 'Mẹ',
  }
})

export const classRooms: ClassRoom[] = [
  { id: 'c-10a', name: 'Lớp 10A1', code: '10A1', gradeId: 'g-10', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-001', maxStudents: 40 },
  { id: 'c-10b', name: 'Lớp 10A2', code: '10A2', gradeId: 'g-10', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-002', maxStudents: 40 },
  { id: 'c-11a', name: 'Lớp 11A1', code: '11A1', gradeId: 'g-11', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-003', maxStudents: 40 },
  { id: 'c-11b', name: 'Lớp 11A2', code: '11A2', gradeId: 'g-11', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-004', maxStudents: 40 },
  { id: 'c-12a', name: 'Lớp 12A1', code: '12A1', gradeId: 'g-12', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-005', maxStudents: 40 },
  { id: 'c-12b', name: 'Lớp 12A2', code: '12A2', gradeId: 'g-12', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-006', maxStudents: 40 },
]

function makeStudentClass(studentId: string, classId: string, roll: number): StudentClass {
  return { id: `sc-${studentId}-${classId}`, studentId, classId, schoolYearId: 'sy-2024-2025', rollNumber: roll }
}

export const studentClasses: StudentClass[] = [
  ...students.slice(0, 12).map((s, i) => makeStudentClass(s.id, 'c-10a', i + 1)),
  ...students.slice(12, 24).map((s, i) => makeStudentClass(s.id, 'c-10b', i + 1)),
  ...students.slice(24, 34).map((s, i) => makeStudentClass(s.id, 'c-11a', i + 1)),
  ...students.slice(34, 44).map((s, i) => makeStudentClass(s.id, 'c-11b', i + 1)),
  ...students.slice(44, 52).map((s, i) => makeStudentClass(s.id, 'c-12a', i + 1)),
  ...students.slice(52, 60).map((s, i) => makeStudentClass(s.id, 'c-12b', i + 1)),
]

export const teachingAssignments: TeachingAssignment[] = (() => {
  const list: TeachingAssignment[] = []
  let n = 1
  const mainSubjects = ['TOAN', 'VAN', 'ANH', 'LY', 'HOA', 'SINH', 'SU', 'DIA', 'GDCD', 'CN', 'TD']
  classRooms.forEach((cls) => {
    const gradeCode = cls.gradeId.replace('g-', 'K')
    mainSubjects.forEach((subjCode) => {
      const subjectId = `${subjCode}-${gradeCode}`
      const teacher = teachers.find((t) => t.subjectIds.includes(subjectId))
      if (!teacher) return
      list.push({
        id: `ta-${n++}`,
        teacherId: teacher.id,
        subjectId,
        classId: cls.id,
        semesterId: 'sem-1-2425',
        schoolYearId: 'sy-2024-2025',
      })
      list.push({
        id: `ta-${n++}`,
        teacherId: teacher.id,
        subjectId,
        classId: cls.id,
        semesterId: 'sem-2-2425',
        schoolYearId: 'sy-2024-2025',
      })
    })
  })
  return list
})()

export const classSessions: ClassSession[] = (() => {
  const list: ClassSession[] = []
  let n = 1
  const dates = ['2024-09-05', '2024-09-09', '2024-09-12', '2024-09-16', '2024-09-19']
  classRooms.forEach((cls) => {
    dates.forEach((date, idx) => {
      const subj = ['TOAN', 'VAN', 'ANH', 'LY', 'HOA'][idx]
      const gradeCode = cls.gradeId.replace('g-', 'K')
      const subjectId = `${subj}-${gradeCode}`
      const ta = teachingAssignments.find(
        (a) => a.classId === cls.id && a.subjectId === subjectId && a.semesterId === 'sem-1-2425'
      )
      list.push({
        id: `sess-${n++}`,
        classId: cls.id,
        date,
        period: idx + 1,
        subjectId,
        teacherId: ta?.teacherId ?? 't-001',
        note: undefined,
      })
    })
  })
  return list
})()

export const attendances: Attendance[] = (() => {
  const list: Attendance[] = []
  let n = 1
  classSessions.forEach((sess) => {
    const scList = studentClasses.filter((sc) => sc.classId === sess.classId)
    scList.forEach((sc, i) => {
      const r = (i + sess.period) % 10
      let status: Attendance['status'] = 'CO_MAT'
      if (r === 7) status = 'VANG_KHONG_PHEP'
      else if (r === 8) status = 'VANG_PHEP'
      else if (r === 9) status = 'DI_MUON'
      list.push({
        id: `att-${n++}`,
        sessionId: sess.id,
        studentId: sc.studentId,
        status,
        note: status === 'VANG_PHEP' ? 'Đi khám bệnh' : undefined,
      })
    })
  })
  return list
})()

export const assessments: Assessment[] = (() => {
  const list: Assessment[] = []
  let n = 1
  const types: { name: string; type: Assessment['scoreType']; coef: number }[] = [
    { name: 'Điểm 15 phút', type: 'TX', coef: 1 },
    { name: 'Điểm 1 tiết', type: 'TX', coef: 2 },
    { name: 'Điểm giữa kỳ', type: 'GK', coef: 3 },
    { name: 'Điểm cuối kỳ', type: 'CK', coef: 5 },
  ]
  classRooms.forEach((cls) => {
    const gradeCode = cls.gradeId.replace('g-', 'K')
    const mainSubjects = ['TOAN', 'VAN', 'ANH', 'LY', 'HOA', 'SINH']
    mainSubjects.forEach((subjCode) => {
      types.forEach((t) => {
        list.push({
          id: `asm-${n++}`,
          name: `${t.name} - ${subjCode}`,
          subjectId: `${subjCode}-${gradeCode}`,
          classId: cls.id,
          semesterId: 'sem-1-2425',
          scoreType: t.type,
          coefficient: t.coef,
          schoolYearId: 'sy-2024-2025',
        })
      })
    })
  })
  return list
})()

function randScore(seed: number): number {
  const vals = [8.5, 7.0, 9.0, 6.5, 8.0, 7.5, 9.5, 6.0, 8.5, 7.0, 5.5, 8.0]
  return vals[seed % vals.length]
}

export const scores: Score[] = (() => {
  const list: Score[] = []
  let n = 1
  assessments.forEach((asm) => {
    const scList = studentClasses.filter((sc) => sc.classId === asm.classId)
    scList.forEach((sc, i) => {
      const value = randScore(i + n)
      list.push({
        id: `sc-${n++}`,
        studentId: sc.studentId,
        assessmentId: asm.id,
        subjectId: asm.subjectId,
        classId: asm.classId,
        semesterId: asm.semesterId,
        schoolYearId: asm.schoolYearId,
        scoreType: asm.scoreType,
        value,
        coefficient: asm.coefficient,
        comment: undefined,
        isLocked: true,
      })
    })
  })
  return list
})()

export const rewardDisciplines: RewardDiscipline[] = [
  { id: 'rd-1', studentId: students[0].id, type: 'REWARD', title: 'Học sinh giỏi cấp trường', reason: 'Đạt thành tích cao trong học tập kỳ I', date: '2025-01-10', decisionNumber: 'QĐ-01/KT' },
  { id: 'rd-2', studentId: students[2].id, type: 'REWARD', title: 'Giải nhất Olympic Toán', reason: 'Giành giải nhất cuộc thi Olympic Toán học cấp thành phố', date: '2024-12-20', decisionNumber: 'QĐ-02/KT' },
  { id: 'rd-3', studentId: students[5].id, type: 'REWARD', title: 'Học sinh 3 tốt', reason: 'Đạt danh hiệu Học sinh 3 tốt cấp trường', date: '2025-03-15', decisionNumber: 'QĐ-03/KT' },
  { id: 'rd-4', studentId: students[8].id, type: 'DISCIPLINE', title: 'Nhắc nhở về chuyên cần', reason: 'Đi muộn nhiều buổi trong tháng', date: '2024-10-12', decisionNumber: 'QĐ-01/KL' },
  { id: 'rd-5', studentId: students[10].id, type: 'DISCIPLINE', title: 'Cảnh cáo vi phạm nội quy', reason: 'Vi phạm nội quy nhà trường', date: '2024-11-05', decisionNumber: 'QĐ-02/KL' },
  { id: 'rd-6', studentId: students[14].id, type: 'REWARD', title: 'Giải khuyến khích Văn học', reason: 'Cuộc thi văn nghệ mùng 20-11', date: '2024-11-20', decisionNumber: 'QĐ-04/KT' },
]

export const userAccounts: UserAccount[] = [
  { id: 'u-1', username: 'admin', fullName: 'Quản trị hệ thống', email: 'admin@edumanage.edu.vn', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2025-10-12 08:30', avatarColor: '#3b82f6' },
  { id: 'u-2', username: 'nguyenmai', fullName: 'Nguyễn Thị Mai', email: 'nguyenmai@edumanage.edu.vn', role: 'TEACHER', status: 'ACTIVE', lastLogin: '2025-10-11 14:20', avatarColor: '#10b981', teacherId: 't-001' },
  { id: 'u-3', username: 'tranbinh', fullName: 'Trần Văn Bình', email: 'tranbinh@edumanage.edu.vn', role: 'TEACHER', status: 'ACTIVE', lastLogin: '2025-10-10 09:15', avatarColor: '#f59e0b', teacherId: 't-002' },
  { id: 'u-4', username: 'lehoa', fullName: 'Lê Thị Hoa', email: 'lehoa@edumanage.edu.vn', role: 'TEACHER', status: 'ACTIVE', lastLogin: '2025-10-09 16:45', avatarColor: '#8b5cf6', teacherId: 't-003' },
  { id: 'u-5', username: students[0].code.toLowerCase(), fullName: students[0].fullName, email: students[0].email, role: 'STUDENT', status: 'ACTIVE', lastLogin: '2025-10-12 07:00', avatarColor: students[0].avatarColor, studentId: students[0].id },
]

export const notifications: NotificationItem[] = [
  { id: 'n-1', title: 'Có điểm mới được cập nhật', message: 'Điểm cuối kỳ môn Toán lớp 10A1 đã được nhập', time: '5 phút trước', type: 'info' },
  { id: 'n-2', title: 'Khen thưởng học sinh', message: 'Trường vừa ban hành quyết định khen thưởng học sinh giỏi', time: '1 giờ trước', type: 'success' },
  { id: 'n-3', title: 'Nhắc nhở chốt điểm', message: 'Hạn chốt điểm học kỳ I còn 3 ngày', time: '3 giờ trước', type: 'warning' },
  { id: 'n-4', title: 'Lịch họp giáo viên', message: 'Họp chuyên môn chiều nay 14:00 tại phòng 301', time: 'Hôm qua', type: 'info' },
]

export const rolePermissions = [
  { role: 'ADMIN' as const, label: 'Quản trị viên', permissions: ['Tất cả'] },
  { role: 'TEACHER' as const, label: 'Giáo viên', permissions: ['Xem học sinh', 'Nhập điểm', 'Điểm danh', 'Xem lớp học'] },
  { role: 'STUDENT' as const, label: 'Học sinh', permissions: ['Xem điểm cá nhân', 'Xem thời khóa biểu', 'Xem thông báo'] },
  { role: 'PARENT' as const, label: 'Phụ huynh', permissions: ['Xem điểm con', 'Xem chuyên cần', 'Xem thông báo'] },
]
