const pool = require('./config/db')

const schoolYears = [
  { id: 'sy-2024-2025', name: 'Năm học 2024–2025', startDate: '2024-09-02', endDate: '2025-05-31', isActive: 1 },
  { id: 'sy-2023-2024', name: 'Năm học 2023–2024', startDate: '2023-09-04', endDate: '2024-05-31', isActive: 0 },
]

const semesters = [
  { id: 'sem-1-2425', name: 'Học kỳ I', code: 'HK1', schoolYearId: 'sy-2024-2025', startDate: '2024-09-02', endDate: '2025-01-15' },
  { id: 'sem-2-2425', name: 'Học kỳ II', code: 'HK2', schoolYearId: 'sy-2024-2025', startDate: '2025-01-16', endDate: '2025-05-31' },
  { id: 'sem-1-2324', name: 'Học kỳ I', code: 'HK1', schoolYearId: 'sy-2023-2024', startDate: '2023-09-04', endDate: '2024-01-15' },
  { id: 'sem-2-2324', name: 'Học kỳ II', code: 'HK2', schoolYearId: 'sy-2023-2024', startDate: '2024-01-16', endDate: '2024-05-31' },
]

const grades = [
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

const subjects = baseSubjects.flatMap((s) =>
  grades.map((g) => ({
    id: `${s.code}-${g.code}`,
    name: s.name,
    code: s.code,
    gradeId: g.id,
    isElective: ['MT', 'AM', 'TIN'].includes(s.code) ? 1 : 0,
  }))
)

const teachers = [
  { id: 't-001', code: 'GV001', fullName: 'Nguyễn Thị Mai', gender: 'FEMALE', dateOfBirth: '1985-03-15', phone: '0912111001', email: 'nguyenmai@edumanage.edu.vn', address: 'Quận Cầu Giấy, Hà Nội', subjectIds: JSON.stringify(['TOAN-K10', 'TOAN-K11', 'TOAN-K12']), hireDate: '2010-08-15', status: 'ACTIVE' },
  { id: 't-002', code: 'GV002', fullName: 'Trần Văn Bình', gender: 'MALE', dateOfBirth: '1980-07-22', phone: '0912111002', email: 'tranbinh@edumanage.edu.vn', address: 'Quận Đống Đa, Hà Nội', subjectIds: JSON.stringify(['VAN-K10', 'VAN-K11', 'VAN-K12']), hireDate: '2008-08-15', status: 'ACTIVE' },
  { id: 't-003', code: 'GV003', fullName: 'Lê Thị Hoa', gender: 'FEMALE', dateOfBirth: '1988-11-08', phone: '0912111003', email: 'lehoa@edumanage.edu.vn', address: 'Quận Hoàng Mai, Hà Nội', subjectIds: JSON.stringify(['ANH-K10', 'ANH-K11', 'ANH-K12']), hireDate: '2012-08-15', status: 'ACTIVE' },
  { id: 't-004', code: 'GV004', fullName: 'Phạm Văn Đức', gender: 'MALE', dateOfBirth: '1982-05-30', phone: '0912111004', email: 'phamduc@edumanage.edu.vn', address: 'Quận Thanh Xuân, Hà Nội', subjectIds: JSON.stringify(['LY-K10', 'LY-K11', 'LY-K12']), hireDate: '2009-08-15', status: 'ACTIVE' },
  { id: 't-005', code: 'GV005', fullName: 'Vũ Thị Lan', gender: 'FEMALE', dateOfBirth: '1986-09-12', phone: '0912111005', email: 'vulan@edumanage.edu.vn', address: 'Quận Hai Bà Trưng, Hà Nội', subjectIds: JSON.stringify(['HOA-K10', 'HOA-K11', 'HOA-K12']), hireDate: '2011-08-15', status: 'ACTIVE' },
  { id: 't-006', code: 'GV006', fullName: 'Đặng Văn Sơn', gender: 'MALE', dateOfBirth: '1984-12-18', phone: '0912111006', email: 'dangson@edumanage.edu.vn', address: 'Quận Tây Hồ, Hà Nội', subjectIds: JSON.stringify(['SINH-K10', 'SINH-K11', 'SINH-K12']), hireDate: '2010-08-15', status: 'ACTIVE' },
  { id: 't-007', code: 'GV007', fullName: 'Hoàng Thị Giang', gender: 'FEMALE', dateOfBirth: '1987-04-25', phone: '0912111007', email: 'hoanggiang@edumanage.edu.vn', address: 'Quận Long Biên, Hà Nội', subjectIds: JSON.stringify(['SU-K10', 'SU-K11', 'SU-K12']), hireDate: '2013-08-15', status: 'ACTIVE' },
  { id: 't-008', code: 'GV008', fullName: 'Bùi Văn Tùng', gender: 'MALE', dateOfBirth: '1983-08-03', phone: '0912111008', email: 'buitung@edumanage.edu.vn', address: 'Quận Ba Đình, Hà Nội', subjectIds: JSON.stringify(['DIA-K10', 'DIA-K11', 'DIA-K12']), hireDate: '2008-08-15', status: 'ACTIVE' },
  { id: 't-009', code: 'GV009', fullName: 'Trịnh Thị Hồng', gender: 'FEMALE', dateOfBirth: '1989-06-19', phone: '0912111009', email: 'trinhhong@edumanage.edu.vn', address: 'Quận Hà Đông, Hà Nội', subjectIds: JSON.stringify(['GDCD-K10', 'GDCD-K11', 'GDCD-K12']), hireDate: '2014-08-15', status: 'ACTIVE' },
  { id: 't-010', code: 'GV010', fullName: 'Cao Minh Châu', gender: 'MALE', dateOfBirth: '1985-10-07', phone: '0912111010', email: 'caochau@edumanage.edu.vn', address: 'Quận Bắc Từ Liêm, Hà Nội', subjectIds: JSON.stringify(['CN-K10', 'CN-K11', 'CN-K12', 'TIN-K10', 'TIN-K11', 'TIN-K12']), hireDate: '2011-08-15', status: 'ACTIVE' },
  { id: 't-011', code: 'GV011', fullName: 'Dương Thị Yến', gender: 'FEMALE', dateOfBirth: '1990-02-14', phone: '0912111011', email: 'duongyen@edumanage.edu.vn', address: 'Quận Nam Từ Liêm, Hà Nội', subjectIds: JSON.stringify(['TD-K10', 'TD-K11', 'TD-K12', 'GQPQ-K10', 'GQPQ-K11', 'GQPQ-K12']), hireDate: '2015-08-15', status: 'ACTIVE' },
  { id: 't-012', code: 'GV012', fullName: 'Lý Văn Quang', gender: 'MALE', dateOfBirth: '1981-11-21', phone: '0912111012', email: 'lyquang@edumanage.edu.vn', address: 'Quận Hoàn Kiếm, Hà Nội', subjectIds: JSON.stringify(['MT-K10', 'MT-K11', 'MT-K12', 'AM-K10', 'AM-K11', 'AM-K12']), hireDate: '2007-08-15', status: 'ACTIVE' },
  { id: 't-013', code: 'GV013', fullName: 'Nguyễn Thu Hương', gender: 'FEMALE', dateOfBirth: '1987-01-06', phone: '0912111013', email: 'nguyenthuhuong@edumanage.edu.vn', address: 'Quận Hà Đông, Hà Nội', subjectIds: JSON.stringify(['TOAN-K10', 'TOAN-K11', 'TOAN-K12']), hireDate: '2016-08-15', status: 'ACTIVE' },
  { id: 't-014', code: 'GV014', fullName: 'Phan Thị Hồng', gender: 'FEMALE', dateOfBirth: '1991-03-18', phone: '0912111014', email: 'phanthihong@edumanage.edu.vn', address: 'Quận Long Biên, Hà Nội', subjectIds: JSON.stringify(['VAN-K10', 'VAN-K11', 'VAN-K12']), hireDate: '2017-08-15', status: 'ACTIVE' },
  { id: 't-015', code: 'GV015', fullName: 'Nguyễn Văn Khánh', gender: 'MALE', dateOfBirth: '1986-07-11', phone: '0912111015', email: 'nguyenvankhanh@edumanage.edu.vn', address: 'Quận Cầu Giấy, Hà Nội', subjectIds: JSON.stringify(['ANH-K10', 'ANH-K11', 'ANH-K12']), hireDate: '2014-08-15', status: 'ACTIVE' },
  { id: 't-016', code: 'GV016', fullName: 'Lương Đức Anh', gender: 'MALE', dateOfBirth: '1984-09-23', phone: '0912111016', email: 'luongducanh@edumanage.edu.vn', address: 'Quận Thanh Xuân, Hà Nội', subjectIds: JSON.stringify(['TIN-K10', 'TIN-K11', 'TIN-K12']), hireDate: '2012-08-15', status: 'ACTIVE' },
  { id: 't-017', code: 'GV017', fullName: 'Mai Thị Lan', gender: 'FEMALE', dateOfBirth: '1989-05-28', phone: '0912111017', email: 'maithilan@edumanage.edu.vn', address: 'Quận Tây Hồ, Hà Nội', subjectIds: JSON.stringify(['GDCD-K10', 'GDCD-K11', 'GDCD-K12']), hireDate: '2018-08-15', status: 'ACTIVE' },
  { id: 't-018', code: 'GV018', fullName: 'Võ Minh Tâm', gender: 'MALE', dateOfBirth: '1983-12-08', phone: '0912111018', email: 'vominhtam@edumanage.edu.vn', address: 'Quận Đống Đa, Hà Nội', subjectIds: JSON.stringify(['TD-K10', 'TD-K11', 'TD-K12']), hireDate: '2009-08-15', status: 'ACTIVE' },
]

const avatarColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']
const firstNamesMale = ['Minh', 'Nam', 'Đức', 'Long', 'Khoa', 'Huy', 'Bảo', 'An', 'Việt', 'Anh', 'Thành', 'Đạt', 'Tùng', 'Phúc', 'Vinh']
const firstNamesFemale = ['Anh', 'Linh', 'Mai', 'Ngọc', 'Hương', 'Thảo', 'Trang', 'Linh', 'Chi', 'Nga', 'Vân', 'Phương', 'Dung', 'Quỳnh', 'Giang']
const midNames = ['Văn', 'Thị', 'Đức', 'Hoàng', 'Minh', 'Ngọc', 'Thanh', 'Xuân', 'Thu', 'Hồng', 'Kim', 'Bá']
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Vũ', 'Đặng', 'Hoàng', 'Bùi', 'Trịnh', 'Cao', 'Dương', 'Lý', 'Đỗ', 'Hồ', 'Ngô']

const pick = (arr, i) => arr[i % arr.length]

function makeStudent(code, index, gender) {
  const firstNames = gender === 'MALE' ? firstNamesMale : firstNamesFemale
  const firstName = pick(firstNames, index)
  const midName = pick(midNames, index + 3)
  const lastName = pick(lastNames, index * 2)
  const fullName = `${lastName} ${midName} ${firstName}`
  const year = 2008 + (index % 4)
  const month = String((index % 12) + 1).padStart(2, '0')
  const day = String((index % 27) + 1).padStart(2, '0')
  return {
    id: code, code, fullName, gender,
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

const students = [
  ...Array.from({ length: 12 }, (_, i) => makeStudent(`HS2024${String(i + 1).padStart(3, '0')}`, i, 'MALE')),
  ...Array.from({ length: 12 }, (_, i) => makeStudent(`HS2024${String(i + 13).padStart(3, '0')}`, i + 12, 'FEMALE')),
  ...Array.from({ length: 10 }, (_, i) => makeStudent(`HS2023${String(i + 1).padStart(3, '0')}`, i + 25, 'MALE')),
  ...Array.from({ length: 10 }, (_, i) => makeStudent(`HS2023${String(i + 11).padStart(3, '0')}`, i + 35, 'FEMALE')),
  ...Array.from({ length: 8 }, (_, i) => makeStudent(`HS2022${String(i + 1).padStart(3, '0')}`, i + 45, 'MALE')),
  ...Array.from({ length: 8 }, (_, i) => makeStudent(`HS2022${String(i + 9).padStart(3, '0')}`, i + 53, 'FEMALE')),
]

const parents = students.slice(0, 30).map((s, i) => {
  const gender = i % 2 === 0 ? 'MALE' : 'FEMALE'
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

const classRooms = [
  { id: 'c-10a', name: 'Lớp 10A1', code: '10A1', gradeId: 'g-10', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-001', maxStudents: 40 },
  { id: 'c-10b', name: 'Lớp 10A2', code: '10A2', gradeId: 'g-10', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-002', maxStudents: 40 },
  { id: 'c-11a', name: 'Lớp 11A1', code: '11A1', gradeId: 'g-11', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-003', maxStudents: 40 },
  { id: 'c-11b', name: 'Lớp 11A2', code: '11A2', gradeId: 'g-11', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-004', maxStudents: 40 },
  { id: 'c-12a', name: 'Lớp 12A1', code: '12A1', gradeId: 'g-12', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-005', maxStudents: 40 },
  { id: 'c-12b', name: 'Lớp 12A2', code: '12A2', gradeId: 'g-12', schoolYearId: 'sy-2024-2025', homeroomTeacherId: 't-006', maxStudents: 40 },
]

function makeStudentClass(studentId, classId, roll) {
  return { id: `sc-${studentId}-${classId}`, studentId, classId, schoolYearId: 'sy-2024-2025', rollNumber: roll }
}

const studentClasses = [
  ...students.slice(0, 12).map((s, i) => makeStudentClass(s.id, 'c-10a', i + 1)),
  ...students.slice(12, 24).map((s, i) => makeStudentClass(s.id, 'c-10b', i + 1)),
  ...students.slice(24, 34).map((s, i) => makeStudentClass(s.id, 'c-11a', i + 1)),
  ...students.slice(34, 44).map((s, i) => makeStudentClass(s.id, 'c-11b', i + 1)),
  ...students.slice(44, 52).map((s, i) => makeStudentClass(s.id, 'c-12a', i + 1)),
  ...students.slice(52, 60).map((s, i) => makeStudentClass(s.id, 'c-12b', i + 1)),
]

const teacherSchedules = [
  { teacherId: 't-001', classId: 'c-10a', subjectId: 'TOAN-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-001', classId: 'c-11a', subjectId: 'TOAN-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-001', classId: 'c-12a', subjectId: 'TOAN-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-001', classId: 'c-10a', subjectId: 'TOAN-K10', semesterId: 'sem-2-2425' },
  { teacherId: 't-001', classId: 'c-11a', subjectId: 'TOAN-K11', semesterId: 'sem-2-2425' },

  { teacherId: 't-002', classId: 'c-10a', subjectId: 'VAN-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-002', classId: 'c-11b', subjectId: 'VAN-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-002', classId: 'c-12b', subjectId: 'VAN-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-002', classId: 'c-10b', subjectId: 'VAN-K10', semesterId: 'sem-2-2425' },

  { teacherId: 't-003', classId: 'c-10b', subjectId: 'ANH-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-003', classId: 'c-11a', subjectId: 'ANH-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-003', classId: 'c-12a', subjectId: 'ANH-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-003', classId: 'c-10a', subjectId: 'ANH-K10', semesterId: 'sem-2-2425' },

  { teacherId: 't-004', classId: 'c-10b', subjectId: 'LY-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-004', classId: 'c-11b', subjectId: 'LY-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-004', classId: 'c-12b', subjectId: 'LY-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-004', classId: 'c-11b', subjectId: 'LY-K11', semesterId: 'sem-2-2425' },

  { teacherId: 't-005', classId: 'c-10a', subjectId: 'HOA-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-005', classId: 'c-11a', subjectId: 'HOA-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-005', classId: 'c-12a', subjectId: 'HOA-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-005', classId: 'c-10a', subjectId: 'HOA-K10', semesterId: 'sem-2-2425' },

  { teacherId: 't-006', classId: 'c-10b', subjectId: 'SINH-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-006', classId: 'c-11b', subjectId: 'SINH-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-006', classId: 'c-12b', subjectId: 'SINH-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-006', classId: 'c-12b', subjectId: 'SINH-K12', semesterId: 'sem-2-2425' },

  { teacherId: 't-007', classId: 'c-10a', subjectId: 'SU-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-007', classId: 'c-11a', subjectId: 'SU-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-007', classId: 'c-12a', subjectId: 'SU-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-007', classId: 'c-12a', subjectId: 'SU-K12', semesterId: 'sem-2-2425' },

  { teacherId: 't-008', classId: 'c-10b', subjectId: 'DIA-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-008', classId: 'c-11b', subjectId: 'DIA-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-008', classId: 'c-12b', subjectId: 'DIA-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-008', classId: 'c-11b', subjectId: 'DIA-K11', semesterId: 'sem-2-2425' },

  { teacherId: 't-009', classId: 'c-10a', subjectId: 'GDCD-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-009', classId: 'c-11a', subjectId: 'GDCD-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-009', classId: 'c-12a', subjectId: 'GDCD-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-009', classId: 'c-12a', subjectId: 'GDCD-K12', semesterId: 'sem-2-2425' },

  { teacherId: 't-010', classId: 'c-10b', subjectId: 'TIN-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-010', classId: 'c-11b', subjectId: 'TIN-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-010', classId: 'c-12b', subjectId: 'TIN-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-010', classId: 'c-11b', subjectId: 'TIN-K11', semesterId: 'sem-2-2425' },

  { teacherId: 't-011', classId: 'c-10a', subjectId: 'TD-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-011', classId: 'c-11a', subjectId: 'TD-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-011', classId: 'c-12a', subjectId: 'TD-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-011', classId: 'c-10a', subjectId: 'TD-K10', semesterId: 'sem-2-2425' },

  { teacherId: 't-012', classId: 'c-10b', subjectId: 'MT-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-012', classId: 'c-11b', subjectId: 'AM-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-012', classId: 'c-12b', subjectId: 'AM-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-012', classId: 'c-10b', subjectId: 'MT-K10', semesterId: 'sem-2-2425' },

  { teacherId: 't-013', classId: 'c-10a', subjectId: 'TOAN-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-014', classId: 'c-10b', subjectId: 'VAN-K10', semesterId: 'sem-1-2425' },
  { teacherId: 't-015', classId: 'c-11a', subjectId: 'ANH-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-016', classId: 'c-11b', subjectId: 'TIN-K11', semesterId: 'sem-1-2425' },
  { teacherId: 't-017', classId: 'c-12a', subjectId: 'GDCD-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-018', classId: 'c-12b', subjectId: 'TD-K12', semesterId: 'sem-1-2425' },
  { teacherId: 't-013', classId: 'c-11a', subjectId: 'TOAN-K11', semesterId: 'sem-2-2425' },
  { teacherId: 't-014', classId: 'c-12b', subjectId: 'VAN-K12', semesterId: 'sem-2-2425' },
  { teacherId: 't-015', classId: 'c-12a', subjectId: 'ANH-K12', semesterId: 'sem-2-2425' },
  { teacherId: 't-016', classId: 'c-10b', subjectId: 'TIN-K10', semesterId: 'sem-2-2425' },
  { teacherId: 't-017', classId: 'c-11a', subjectId: 'GDCD-K11', semesterId: 'sem-2-2425' },
  { teacherId: 't-018', classId: 'c-10a', subjectId: 'TD-K10', semesterId: 'sem-2-2425' },
]

const teachingAssignments = teacherSchedules.map((item, index) => ({
  id: `ta-${index + 1}`,
  teacherId: item.teacherId,
  subjectId: item.subjectId,
  classId: item.classId,
  semesterId: item.semesterId,
  schoolYearId: 'sy-2024-2025',
}))

const classSessions = (() => {
  const list = []
  let n = 1
  const dates = ['2024-09-02', '2024-09-05', '2024-09-09', '2024-09-12', '2024-09-16', '2024-09-19', '2024-09-23', '2024-09-26']

  classRooms.forEach((cls) => {
    const classAssignments = teachingAssignments.filter((a) => a.classId === cls.id)
    classAssignments.forEach((assignment, idx) => {
      dates.slice(0, 4).forEach((date, sessionIndex) => {
        list.push({
          id: `sess-${n++}`,
          classId: cls.id,
          date,
          period: idx + sessionIndex + 1,
          subjectId: assignment.subjectId,
          teacherId: assignment.teacherId,
          note: null,
        })
      })
    })
  })

  return list
})()

const attendances = (() => {
  const list = []
  let n = 1
  classSessions.forEach((sess) => {
    const scList = studentClasses.filter((sc) => sc.classId === sess.classId)
    scList.forEach((sc, i) => {
      const r = (i + sess.period) % 10
      let status = 'CO_MAT'
      if (r === 7) status = 'VANG_KHONG_PHEP'
      else if (r === 8) status = 'VANG_PHEP'
      else if (r === 9) status = 'DI_MUON'
      list.push({ id: `att-${n++}`, sessionId: sess.id, studentId: sc.studentId, status, note: status === 'VANG_PHEP' ? 'Đi khám bệnh' : null })
    })
  })
  return list
})()

const assessments = (() => {
  const list = []
  let n = 1
  const types = [
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
        list.push({ id: `asm-${n++}`, name: `${t.name} - ${subjCode}`, subjectId: `${subjCode}-${gradeCode}`, classId: cls.id, semesterId: 'sem-1-2425', scoreType: t.type, coefficient: t.coef, schoolYearId: 'sy-2024-2025' })
      })
    })
  })
  return list
})()

function randScore(seed) {
  const vals = [8.5, 7.0, 9.0, 6.5, 8.0, 7.5, 9.5, 6.0, 8.5, 7.0, 5.5, 8.0]
  return vals[seed % vals.length]
}

const scores = (() => {
  const list = []
  let n = 1
  assessments.forEach((asm) => {
    const scList = studentClasses.filter((sc) => sc.classId === asm.classId)
    scList.forEach((sc, i) => {
      const value = randScore(i + n)
      list.push({ id: `sc-${n++}`, studentId: sc.studentId, assessmentId: asm.id, subjectId: asm.subjectId, classId: asm.classId, semesterId: asm.semesterId, schoolYearId: asm.schoolYearId, scoreType: asm.scoreType, value, coefficient: asm.coefficient, comment: null, isLocked: 1 })
    })
  })
  return list
})()

const rewardDisciplines = [
  { id: 'rd-1', studentId: students[0].id, type: 'REWARD', title: 'Học sinh giỏi cấp trường', reason: 'Đạt thành tích cao trong học tập kỳ I', date: '2025-01-10', decisionNumber: 'QĐ-01/KT' },
  { id: 'rd-2', studentId: students[2].id, type: 'REWARD', title: 'Giải nhất Olympic Toán', reason: 'Giành giải nhất cuộc thi Olympic Toán học cấp thành phố', date: '2024-12-20', decisionNumber: 'QĐ-02/KT' },
  { id: 'rd-3', studentId: students[5].id, type: 'REWARD', title: 'Học sinh 3 tốt', reason: 'Đạt danh hiệu Học sinh 3 tốt cấp trường', date: '2025-03-15', decisionNumber: 'QĐ-03/KT' },
  { id: 'rd-4', studentId: students[8].id, type: 'DISCIPLINE', title: 'Nhắc nhở về chuyên cần', reason: 'Đi muộn nhiều buổi trong tháng', date: '2024-10-12', decisionNumber: 'QĐ-01/KL' },
  { id: 'rd-5', studentId: students[10].id, type: 'DISCIPLINE', title: 'Cảnh cáo vi phạm nội quy', reason: 'Vi phạm nội quy nhà trường', date: '2024-11-05', decisionNumber: 'QĐ-02/KL' },
  { id: 'rd-6', studentId: students[14].id, type: 'REWARD', title: 'Giải khuyến khích Văn học', reason: 'Cuộc thi văn nghệ mùng 20-11', date: '2024-11-20', decisionNumber: 'QĐ-04/KT' },
]

const roles = [
  { id: 'role-admin', name: 'ADMIN', label: 'Quản trị viên', description: 'Quản lý toàn bộ hệ thống', permissions: JSON.stringify(['students', 'teachers', 'classes', 'scores', 'attendance', 'rewards', 'reports', 'accounts', 'settings']) },
  { id: 'role-teacher', name: 'TEACHER', label: 'Giáo viên', description: 'Quản lý lớp học và điểm số', permissions: JSON.stringify(['students', 'scores', 'attendance', 'reports']) },
  { id: 'role-student', name: 'STUDENT', label: 'Học sinh', description: 'Xem thông tin cá nhân và kết quả học tập', permissions: JSON.stringify(['scores', 'attendance', 'rewards', 'reports']) },
  { id: 'role-parent', name: 'PARENT', label: 'Phụ huynh', description: 'Theo dõi tiến độ học tập của con', permissions: JSON.stringify(['students', 'scores', 'attendance', 'reports']) },
]

const userAccounts = [
  { id: 'u-1', username: 'admin', fullName: 'Quản trị hệ thống', email: 'admin@edumanage.edu.vn', role: 'ADMIN', roleId: 'role-admin', status: 'ACTIVE', lastLogin: '2025-10-12 08:30', avatarColor: '#3b82f6', teacherId: null, studentId: null },
  { id: 'u-2', username: 'nguyenmai', fullName: 'Nguyễn Thị Mai', email: 'nguyenmai@edumanage.edu.vn', role: 'TEACHER', roleId: 'role-teacher', status: 'ACTIVE', lastLogin: '2025-10-11 14:20', avatarColor: '#10b981', teacherId: 't-001', studentId: null },
  { id: 'u-3', username: 'tranbinh', fullName: 'Trần Văn Bình', email: 'tranbinh@edumanage.edu.vn', role: 'TEACHER', roleId: 'role-teacher', status: 'ACTIVE', lastLogin: '2025-10-10 09:15', avatarColor: '#f59e0b', teacherId: 't-002', studentId: null },
  { id: 'u-4', username: 'lehoa', fullName: 'Lê Thị Hoa', email: 'lehoa@edumanage.edu.vn', role: 'TEACHER', roleId: 'role-teacher', status: 'ACTIVE', lastLogin: '2025-10-09 16:45', avatarColor: '#8b5cf6', teacherId: 't-003', studentId: null },
  { id: 'u-5', username: students[0].code.toLowerCase(), fullName: students[0].fullName, email: students[0].email, role: 'STUDENT', roleId: 'role-student', status: 'ACTIVE', lastLogin: '2025-10-12 07:00', avatarColor: students[0].avatarColor, teacherId: null, studentId: students[0].id },

  // Demo tài khoản để test nhanh các role khác nhau
  { id: 'u-demo-admin', username: 'demo_admin', fullName: 'Demo Admin', email: 'demo.admin@edumanage.edu.vn', role: 'ADMIN', roleId: 'role-admin', status: 'ACTIVE', lastLogin: '2026-10-12 09:00', avatarColor: '#2563eb', teacherId: null, studentId: null },
  { id: 'u-demo-teacher', username: 'demo_teacher', fullName: 'Demo Giáo Viên', email: 'demo.teacher@edumanage.edu.vn', role: 'TEACHER', roleId: 'role-teacher', status: 'ACTIVE', lastLogin: '2026-10-12 09:05', avatarColor: '#10b981', teacherId: 't-001', studentId: null },
  { id: 'u-demo-student', username: 'demo_student', fullName: 'Demo Học Sinh', email: 'demo.student@hocsinh.edu.vn', role: 'STUDENT', roleId: 'role-student', status: 'ACTIVE', lastLogin: '2026-10-12 09:10', avatarColor: '#f59e0b', teacherId: null, studentId: students[0].id },
  { id: 'u-6', username: 'nguyenthuhuong', fullName: 'Nguyễn Thu Hương', email: 'nguyenthuhuong@edumanage.edu.vn', role: 'TEACHER', roleId: 'role-teacher', status: 'ACTIVE', lastLogin: '2026-10-12 08:10', avatarColor: '#ec4899', teacherId: 't-013', studentId: null },
  { id: 'u-7', username: 'phanthihong', fullName: 'Phan Thị Hồng', email: 'phanthihong@edumanage.edu.vn', role: 'TEACHER', roleId: 'role-teacher', status: 'ACTIVE', lastLogin: '2026-10-12 08:45', avatarColor: '#14b8a6', teacherId: 't-014', studentId: null },
  { id: 'u-8', username: 'nguyenvankhanh', fullName: 'Nguyễn Văn Khánh', email: 'nguyenvankhanh@edumanage.edu.vn', role: 'TEACHER', roleId: 'role-teacher', status: 'ACTIVE', lastLogin: '2026-10-12 09:20', avatarColor: '#f97316', teacherId: 't-015', studentId: null },
  { id: 'u-9', username: 'luongducanh', fullName: 'Lương Đức Anh', email: 'luongducanh@edumanage.edu.vn', role: 'TEACHER', roleId: 'role-teacher', status: 'ACTIVE', lastLogin: '2026-10-12 10:00', avatarColor: '#8b5cf6', teacherId: 't-016', studentId: null },
  { id: 'u-10', username: 'maithilan', fullName: 'Mai Thị Lan', email: 'maithilan@edumanage.edu.vn', role: 'TEACHER', roleId: 'role-teacher', status: 'ACTIVE', lastLogin: '2026-10-12 10:15', avatarColor: '#0ea5e9', teacherId: 't-017', studentId: null },
  { id: 'u-11', username: 'vominhtam', fullName: 'Võ Minh Tâm', email: 'vominhtam@edumanage.edu.vn', role: 'TEACHER', roleId: 'role-teacher', status: 'ACTIVE', lastLogin: '2026-10-12 10:35', avatarColor: '#22c55e', teacherId: 't-018', studentId: null },
]

const notifications = [
  { id: 'n-1', title: 'Có điểm mới được cập nhật', message: 'Điểm cuối kỳ môn Toán lớp 10A1 đã được nhập', time: '5 phút trước', type: 'info' },
  { id: 'n-2', title: 'Khen thưởng học sinh', message: 'Trường vừa ban hành quyết định khen thưởng học sinh giỏi', time: '1 giờ trước', type: 'success' },
  { id: 'n-3', title: 'Nhắc nhở chốt điểm', message: 'Hạn chốt điểm học kỳ I còn 3 ngày', time: '3 giờ trước', type: 'warning' },
  { id: 'n-4', title: 'Lịch họp giáo viên', message: 'Họp chuyên môn chiều nay 14:00 tại phòng 301', time: 'Hôm qua', type: 'info' },
]

async function seed() {
  try {
    console.log('Bắt đầu seed dữ liệu...')

    await pool.query('SET FOREIGN_KEY_CHECKS = 0')
    await pool.query('TRUNCATE TABLE notifications')
    await pool.query('TRUNCATE TABLE user_accounts')
    await pool.query('TRUNCATE TABLE roles')
    await pool.query('TRUNCATE TABLE reward_disciplines')
    await pool.query('TRUNCATE TABLE scores')
    await pool.query('TRUNCATE TABLE assessments')
    await pool.query('TRUNCATE TABLE attendances')
    await pool.query('TRUNCATE TABLE class_sessions')
    await pool.query('TRUNCATE TABLE teaching_assignments')
    await pool.query('TRUNCATE TABLE student_classes')
    await pool.query('TRUNCATE TABLE class_rooms')
    await pool.query('TRUNCATE TABLE parents')
    await pool.query('TRUNCATE TABLE students')
    await pool.query('TRUNCATE TABLE teachers')
    await pool.query('TRUNCATE TABLE subjects')
    await pool.query('TRUNCATE TABLE grades')
    await pool.query('TRUNCATE TABLE semesters')
    await pool.query('TRUNCATE TABLE school_years')
    await pool.query('SET FOREIGN_KEY_CHECKS = 1')

    const toSnake = (s) => s.replace(/([A-Z])/g, '_$1').toLowerCase()

    const insertMany = async (table, data) => {
      if (!data.length) return
      const keys = Object.keys(data[0])
      const columns = keys.map(toSnake)
      const placeholders = columns.map(() => '?').join(', ')
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
      for (const row of data) {
        await pool.query(sql, keys.map((k) => row[k]))
      }
    }

    await insertMany('school_years', schoolYears)
    console.log('✓ school_years')

    await insertMany('semesters', semesters)
    console.log('✓ semesters')

    await insertMany('grades', grades)
    console.log('✓ grades')

    await insertMany('subjects', subjects)
    console.log('✓ subjects')

    await insertMany('teachers', teachers)
    console.log('✓ teachers')

    await insertMany('students', students)
    console.log('✓ students')

    await insertMany('parents', parents)
    console.log('✓ parents')

    await insertMany('class_rooms', classRooms)
    console.log('✓ class_rooms')

    await insertMany('student_classes', studentClasses)
    console.log('✓ student_classes')

    await insertMany('teaching_assignments', teachingAssignments)
    console.log('✓ teaching_assignments')

    await insertMany('class_sessions', classSessions)
    console.log('✓ class_sessions')

    await insertMany('attendances', attendances)
    console.log('✓ attendances')

    await insertMany('assessments', assessments)
    console.log('✓ assessments')

    await insertMany('scores', scores)
    console.log('✓ scores')

    await insertMany('roles', roles)
    console.log('✓ roles')

    await insertMany('reward_disciplines', rewardDisciplines)
    console.log('✓ reward_disciplines')

    await insertMany('user_accounts', userAccounts)
    console.log('✓ user_accounts')

    await insertMany('notifications', notifications)
    console.log('✓ notifications')

    console.log('\n✅ Seed dữ liệu thành công!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi khi seed:', err.message)
    process.exit(1)
  }
}

seed()
