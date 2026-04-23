// ============================================================
// MOCK DATA - School Management System
// ============================================================

export type Role = "admin" | "teacher" | "parent" | "ta";

// ---- Students ----
export interface Student {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  level: string;
  enrollDate: string;
  status: "active" | "inactive" | "graduated";
  classIds: string[];
  totalFee: number;
  paidFee: number;
  attendanceCount: number;
  parentName: string;
  parentPhone: string;
  dob: string;
  notes: { author: string; date: string; content: string }[];
  examResults: { exam: string; score: number; date: string; skill: string }[];
}

export const students: Student[] = [
  {
    id: "STU001", name: "Đăng Khoa Bing", avatar: "DK", email: "dkkhoa@email.com", phone: "0901234501",
    level: "4CLC 2", enrollDate: "2024-09-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 45, parentName: "Bố Khoa", parentPhone: "0912345601",
    dob: "2015-03-22", notes: [], examResults: []
  },
  {
    id: "STU002", name: "Bảo Thư Mimi", avatar: "BT", email: "baothu@email.com", phone: "0901234502",
    level: "4CLC 2", enrollDate: "2024-09-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 44, parentName: "Mẹ Thư", parentPhone: "0912345602",
    dob: "2015-07-11", notes: [], examResults: []
  },
  {
    id: "STU003", name: "Thành Vinh Brian", avatar: "TV", email: "thanhvinh@email.com", phone: "0901234503",
    level: "4CLC 2", enrollDate: "2024-09-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 43, parentName: "Bố Vinh", parentPhone: "0912345603",
    dob: "2015-12-05", notes: [], examResults: []
  },
  {
    id: "STU004", name: "Jessica", avatar: "JS", email: "jessica@email.com", phone: "0901234504",
    level: "4CLC 2", enrollDate: "2024-09-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 42, parentName: "Parent Jessica", parentPhone: "0912345604",
    dob: "2015-05-18", notes: [], examResults: []
  },
  {
    id: "STU005", name: "Thiện Nhân Tom", avatar: "TN", email: "thiennhan@email.com", phone: "0901234505",
    level: "4CLC 2", enrollDate: "2024-09-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 46, parentName: "Bố Nhân", parentPhone: "0912345605",
    dob: "2015-09-30", notes: [], examResults: []
  },
  {
    id: "STU006", name: "Hà Anh Kuromi", avatar: "HA", email: "haanh@email.com", phone: "0901234506",
    level: "4CLC 2", enrollDate: "2025-02-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 12, parentName: "Mẹ Hà Anh", parentPhone: "0912345606",
    dob: "2015-04-12", notes: [], examResults: []
  },
  {
    id: "STU007", name: "Peter Nhật Anh", avatar: "NA", email: "nhatanh@email.com", phone: "0901234507",
    level: "4CLC 2", enrollDate: "2025-02-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 12, parentName: "Bố Nhật Anh", parentPhone: "0912345607",
    dob: "2015-05-15", notes: [], examResults: []
  },
  {
    id: "STU008", name: "Minh Thảo Rosy", avatar: "MT", email: "minhthao@email.com", phone: "0901234508",
    level: "4CLC 2", enrollDate: "2025-02-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 12, parentName: "Mẹ Minh Thảo", parentPhone: "0912345608",
    dob: "2015-06-20", notes: [], examResults: []
  },
  {
    id: "STU009", name: "Minh Hải Tony", avatar: "MH", email: "minhhai@email.com", phone: "0901234509",
    level: "4CLC 2", enrollDate: "2025-02-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 12, parentName: "Bố Minh Hải", parentPhone: "0912345609",
    dob: "2015-07-25", notes: [], examResults: []
  },
  {
    id: "STU010", name: "Hoàng Anh Robert", avatar: "RA", email: "hoanganh@email.com", phone: "0901234510",
    level: "4CLC 2", enrollDate: "2025-02-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 12, parentName: "Bố Hoàng Anh", parentPhone: "0912345610",
    dob: "2015-08-30", notes: [], examResults: []
  },
  {
    id: "STU011", name: "Minh Anh Mina", avatar: "MA", email: "mina@email.com", phone: "0901234511",
    level: "4CLC 2", enrollDate: "2025-02-15", status: "active", classIds: ["CLS001"],
    totalFee: 12000000, paidFee: 12000000, attendanceCount: 12, parentName: "Nguyễn Văn Hùng", parentPhone: "0912345611",
    dob: "2015-09-05", notes: [], examResults: []
  },
];

// ---- Branches ----
export interface Branch {
  id: string;
  name: string;
  location: string;
  phone: string;
}

export const branches: Branch[] = [
  { id: "BR001", name: "MENGLISH - Cầu Giấy", location: "8 Xuân Thủy, Cầu Giấy, HN", phone: "024.123.456" },
  { id: "BR002", name: "MENGLISH - Quận 1", location: "15 Lê Thánh Tôn, Quận 1, HCM", phone: "028.987.654" },
  { id: "BR003", name: "MENGLISH - Online", location: "Hệ thống học trực tuyến", phone: "1900.555.666" },
];

// ---- Users (Giảng viên, Vận hành, Trợ giảng...) ----
export type AppUserRole = "teacher" | "ta" | "ops" | "accounting" | "admin";

export interface AppUser {
  id: string;
  name: string;
  avatar: string;
  role: AppUserRole;
  branchId: string;
  specialty?: string; // Only for teachers/TAs
  hoursThisMonth?: number;
  totalClasses?: number;
  avgRating?: number;
  email: string;
  phone: string;
  status: "active" | "inactive";
  contractInfo: {
    type: string;
    baseSalary: number;
    startDate: string;
    endDate: string | null;
    contractFile?: string;
  };
}

export const users: AppUser[] = [
  { 
    id: "USR001", name: "Ms. Thu Trang", avatar: "TT", role: "teacher", branchId: "BR001",
    specialty: "English Foundation & Kids", hoursThisMonth: 48, totalClasses: 3, avgRating: 4.9, 
    email: "thutrang@menglish.edu.vn", phone: "0912345678", status: "active",
    contractInfo: { type: "Toàn thời gian", baseSalary: 15000000, startDate: "2022-01-15", endDate: null, contractFile: "hop-dong-lao-dong-thutrang.pdf" } 
  },
  { 
    id: "USR002", name: "Sarah Johnson", avatar: "SJ", role: "teacher", branchId: "BR002",
    specialty: "General English & Pronunciation", hoursThisMonth: 36, totalClasses: 2, avgRating: 4.9, 
    email: "sarah.j@menglish.edu.vn", phone: "0923456789", status: "active",
    contractInfo: { type: "Bán thời gian", baseSalary: 8000000, startDate: "2023-06-01", endDate: "2025-06-01", contractFile: "contract-sarah-j.pdf" } 
  },
  { 
    id: "USR003", name: "Nguyễn Thị Phượng", avatar: "TP", role: "teacher", branchId: "BR001",
    specialty: "TOEIC & Business English", hoursThisMonth: 40, totalClasses: 3, avgRating: 4.6, 
    email: "phuongnt@menglish.edu.vn", phone: "0934567890", status: "active",
    contractInfo: { type: "Toàn thời gian", baseSalary: 12000000, startDate: "2021-09-10", endDate: null, contractFile: "hdld-phuongnt.pdf" } 
  },
  { 
    id: "USR004", name: "Trần Minh Đức", avatar: "MD", role: "ta", branchId: "BR001",
    specialty: "IELTS Support", hoursThisMonth: 20, totalClasses: 2,
    email: "ductm@menglish.edu.vn", phone: "0944555666", status: "active",
    contractInfo: { type: "Bán thời gian", baseSalary: 4000000, startDate: "2024-01-10", endDate: null, contractFile: "hdld-duc.pdf" } 
  },
  { 
    id: "USR005", name: "Phạm Hồng Nhung", avatar: "HN", role: "ops", branchId: "BR002",
    email: "nhungph@menglish.edu.vn", phone: "0966777888", status: "active",
    contractInfo: { type: "Toàn thời gian", baseSalary: 10000000, startDate: "2023-11-01", endDate: null, contractFile: "hop-dong-nhung.pdf" } 
  },
  { 
    id: "USR006", name: "Hoàng Gia Bảo", avatar: "GB", role: "accounting", branchId: "BR001",
    email: "baohg@menglish.edu.vn", phone: "0977888999", status: "active",
    contractInfo: { type: "Toàn thời gian", baseSalary: 12000000, startDate: "2023-08-15", endDate: null, contractFile: "contract-gb.pdf" } 
  },
];

// Re-export teachers for legacy support
export const teachers = users.filter(u => u.role === "teacher");
export type Teacher = AppUser;

// ---- Classes ----
export interface ClassItem {
  id: string;
  name: string;
  course: string;
  teacherId: string;
  schedule: string;
  room: string;
  studentCount: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "completed";
  levelId?: string;
}

export const classes: ClassItem[] = [
  { id: "CLS001", name: "4CLC 2 - T3/T7", course: "4CLC 2", teacherId: "USR001", schedule: "T3, T7 | 17:30-19:00", room: "Room A1", studentCount: 11, maxStudents: 15, startDate: "2024-09-16", endDate: "2025-03-16", status: "active", levelId: "LVL_I_1" },
  { id: "CLS002", name: "English A2 - Chiều T3/T5", course: "General English A2", teacherId: "USR002", schedule: "T3, T5 | 14:00-15:30", room: "Room B2", studentCount: 8, maxStudents: 12, startDate: "2024-10-01", endDate: "2025-04-01", status: "active", levelId: "LVL_S_2" },
  { id: "CLS003", name: "IELTS B2 - Tối T2/T4/T6", course: "IELTS Advanced", teacherId: "USR002", schedule: "T2, T4, T6 | 18:30-20:00", room: "Room A2", studentCount: 10, maxStudents: 12, startDate: "2024-06-01", endDate: "2025-06-01", status: "active", levelId: "LVL_I_2" },
  { id: "CLS004", name: "Starter A1 - Sáng T7/CN", course: "English Starter", teacherId: "USR003", schedule: "T7, CN | 9:00-11:00", room: "Room C1", studentCount: 6, maxStudents: 10, startDate: "2025-01-11", endDate: "2025-07-11", status: "active", levelId: "LVL_S_1" },
  { id: "CLS005", name: "Business 1 - Tối T2/T4/T6", course: "Business English 1", teacherId: "USR002", schedule: "T2, T4, T6 | 19:30-21:00", room: "Room B1", studentCount: 15, maxStudents: 15, startDate: "2025-02-01", endDate: "2025-05-01", status: "active", levelId: "LVL_B_1" },
  { id: "CLS006", name: "Tiền Tiểu Học 1 (T7/CN)", course: "Kids Pre-School", teacherId: "USR002", schedule: "T7, CN | 14:00-16:00", room: "Room C2", studentCount: 12, maxStudents: 15, startDate: "2025-03-01", endDate: "2025-09-01", status: "active", levelId: "LVL_K_1" },
  { id: "CLS_TRIAL", name: "Lớp học thử 01", course: "Trial English", teacherId: "USR001", schedule: "Linh hoạt", room: "Room A1", studentCount: 5, maxStudents: 20, startDate: "2025-03-28", endDate: "2025-03-31", status: "active", levelId: "LVL_TRIAL" },
];

// ---- CRM Leads ----
export interface CareLogEntry {
  id: string;
  timestamp: string;          // ISO datetime
  by: string;                 // staff name
  type: "call" | "sms" | "zalo" | "meet" | "test_result_sent" | "note" | "stage_change";
  content: string;
}

export interface LeadTestInfo {
  scheduledDate?: string;     // YYYY-MM-DD
  actualDate?: string;
  score?: number;             // /10
  level?: string;             // VD: "Movers", "Flyers"
  teacherFeedback?: string;
  suggestedProgram?: string;
  sentToParentAt?: string;    // ISO when result sent
  parentResponse?: "agree" | "decline" | "pending";
}

export interface LeadEnrollment {
  classId: string;
  className: string;
  enrolledAt: string;         // ISO
}

export interface LeadPayment {
  tuitionFee: number;         // Học phí
  materialFee: number;        // Học liệu
  paidTuition: boolean;
  paidMaterial: boolean;
  paidAt?: string;
  receiptCode?: string;
}

export type LeadStage =
  | "new"               // Lead mới
  | "nurturing"         // Đang chăm sóc
  | "test_scheduled"    // Đã hẹn lịch test
  | "test_done"         // Đã test, chờ gửi KQ
  | "result_sent"       // Đã gửi KQ phụ huynh
  | "waiting_class"     // Chờ xếp lớp
  | "enrolled";         // Đã xếp lớp + thu HP

export interface Lead {
  id: string;
  stt: number;
  name: string;
  dob: string;
  phone: string;
  parentName?: string;
  parentPhone?: string;
  customerGroup: string;
  program: {
    name: string;
    sessions?: number;
    fee?: number;
    collectionDate?: string;
  };
  assignee: string;
  followUpHistory: string;     // legacy plain string (kept for back-compat)
  source: string;
  category: "nurturing" | "completed" | "raw" | "student";
  stage: LeadStage;
  // ---- NEW ----
  test?: LeadTestInfo;
  enrollment?: LeadEnrollment;
  payment?: LeadPayment;
  careLog: CareLogEntry[];
  createdAt: string;          // ISO
}

const stagesList: Lead["stage"][] = ["new", "nurturing", "test_scheduled", "test_done", "result_sent", "waiting_class", "enrolled"];
const names = ["NGUYỄN THANH VÂN", "TRẦN HOÀNG KHẢI", "ĐINH HÀ LINH", "NGUYỄN BẢO HÂN", "HOÀNG MINH TÚ", "PHẠM ĐỨC ANH", "LÊ THỊ HỒNG", "VŨ QUANG MINH", "ĐẶNG THU THẢO", "BÙI TIẾN DŨNG", "TRỊNH QUỐC BẢO", "LÊ MINH CHÂU", "PHAN THANH TÙNG", "LÝ THU HÀ", "NGUYỄN TUẤN KIỆT"];
const sources = ["FACEBOOK", "PHỤ HUYNH CŨ GIỚI THIỆU", "VÃNG LAI", "MARKETING", "TIKTOK", "GOOGLE ADS"];
const staffNames = ["Nguyễn Bích Ngọc", "Nguyễn Thuỳ Linh", "Trần Minh Quân", "Phạm Hồng Nhung", "Lê Gia Huy"];
const groups = ["ĐÃ CHỐT THÀNH CÔNG", "CHỜ XẾP LỚP", "Chưa phân nhóm", "TIỀM NĂNG CAO", "KHÁCH HÀNG VIP"];

const samplePerStage = 18;
export const leads: Lead[] = stagesList.flatMap((stage, stageIdx) =>
  Array.from({ length: samplePerStage }).map((_, i) => {
    const name = names[i % names.length] + " " + (i + 1 + stageIdx * samplePerStage);
    const assignee = staffNames[i % staffNames.length];
    const tuition = Math.floor(Math.random() * 3000000 + 1500000);
    const material = Math.floor(Math.random() * 800000 + 200000);
    const baseDate = new Date(2025, 2, 1 + i);

    const lead: Lead = {
      id: `L-${stage}-${i}`,
      stt: i + 1 + stageIdx * samplePerStage,
      name,
      dob: "01/01/2018",
      phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
      parentName: i % 2 === 0 ? "Phụ huynh " + name.split(" ").slice(-1)[0] : undefined,
      parentPhone: i % 2 === 0 ? `08${Math.floor(Math.random() * 90000000 + 10000000)}` : undefined,
      customerGroup: stage === "enrolled" ? "ĐÃ CHỐT THÀNH CÔNG" : groups[i % groups.length],
      program: {
        name: i % 3 === 0 ? "Tiểu học" : i % 3 === 1 ? "Mẫu giáo" : "Trung học cơ sở",
        sessions: Math.floor(Math.random() * 20 + 10),
        fee: tuition,
        collectionDate: "24/10/2025"
      },
      assignee,
      followUpHistory: "",
      source: sources[i % sources.length],
      category: stage === "enrolled" ? "completed" : "nurturing",
      stage,
      careLog: [
        {
          id: `cl-${stage}-${i}-0`,
          timestamp: baseDate.toISOString(),
          by: assignee,
          type: "note",
          content: "Khởi tạo lead từ nguồn " + sources[i % sources.length],
        },
      ],
      createdAt: baseDate.toISOString(),
    };

    // Augment by stage
    if (["test_scheduled", "test_done", "result_sent", "waiting_class", "enrolled"].includes(stage)) {
      lead.test = {
        scheduledDate: "2025-03-" + String(10 + (i % 15)).padStart(2, "0"),
      };
    }
    if (["test_done", "result_sent", "waiting_class", "enrolled"].includes(stage)) {
      lead.test = {
        ...lead.test!,
        actualDate: lead.test!.scheduledDate,
        score: Math.round((5 + Math.random() * 5) * 10) / 10,
        level: ["Starters", "Movers", "Flyers", "KET", "PET"][i % 5],
        teacherFeedback: "Bé tiếp thu tốt, phát âm cần luyện thêm.",
        suggestedProgram: "Lộ trình Cambridge YL",
      };
    }
    if (["result_sent", "waiting_class", "enrolled"].includes(stage)) {
      lead.test = {
        ...lead.test!,
        sentToParentAt: new Date(baseDate.getTime() + 86400000 * 2).toISOString(),
        parentResponse: stage === "result_sent" ? "pending" : "agree",
      };
    }
    if (stage === "enrolled") {
      const classNames = ["Cam 10", "Cam 25", "Cam 33", "Cam 21", "Cam 34"];
      const cn = classNames[i % classNames.length];
      lead.enrollment = {
        classId: "CLS-" + cn.replace(" ", ""),
        className: cn,
        enrolledAt: new Date(baseDate.getTime() + 86400000 * 5).toISOString(),
      };
      lead.payment = {
        tuitionFee: tuition,
        materialFee: material,
        paidTuition: true,
        paidMaterial: true,
        paidAt: new Date(baseDate.getTime() + 86400000 * 5).toISOString(),
        receiptCode: "RC-" + lead.id,
      };
    }
    return lead;
  })
);

// ---- Courses ----
export interface Course {
  id: string;
  name: string;
  level: string;
  duration: string;
  fee: number;
  description: string;
  classCount: number;
  studentCount: number;
}

export const courses: Course[] = [
  { id: "CRS001", name: "English Starter", level: "A1", duration: "6 tháng", fee: 6000000, description: "Khóa học nền tảng cho người mới bắt đầu", classCount: 1, studentCount: 6 },
  { id: "CRS002", name: "General English A2", level: "A2", duration: "6 tháng", fee: 8000000, description: "Tiếng Anh tổng quát trình độ sơ cấp", classCount: 1, studentCount: 8 },
  { id: "CRS003", name: "IELTS Foundation", level: "B1", duration: "6 tháng", fee: 12000000, description: "Nền tảng IELTS cho trình độ trung cấp", classCount: 1, studentCount: 12 },
  { id: "CRS004", name: "IELTS Advanced", level: "B2", duration: "12 tháng", fee: 15000000, description: "Luyện thi IELTS chuyên sâu band 6.5+", classCount: 1, studentCount: 10 },
  { id: "CRS005", name: "TOEIC Preparation", level: "B1-B2", duration: "4 tháng", fee: 10000000, description: "Luyện thi TOEIC 600-800+", classCount: 0, studentCount: 0 },
];

// ---- Tickets ----
export interface Ticket {
  id: string;
  title: string;
  from: string;
  category: string;
  priority: "low" | "medium" | "high";
  stage: "new" | "processing" | "closed";
  createdDate: string;
  assignee: string;
}

export const tickets: Ticket[] = [
  { id: "TK001", title: "Xin chuyển lớp sáng sang tối", from: "PH Nguyễn Văn Hùng", category: "Chuyển lớp", priority: "medium", stage: "new", createdDate: "2025-03-21", assignee: "Admin" },
  { id: "TK002", title: "Hỏi về lịch thi cuối kỳ", from: "Trần Quốc Bảo", category: "Thông tin", priority: "low", stage: "processing", createdDate: "2025-03-19", assignee: "Lê Hoàng Nam" },
  { id: "TK003", title: "Yêu cầu hoàn học phí", from: "PH Võ Văn Sơn", category: "Tài chính", priority: "high", stage: "new", createdDate: "2025-03-22", assignee: "Admin" },
  { id: "TK004", title: "Góp ý về chất lượng phòng học", from: "Lê Thị Hương", category: "Cơ sở vật chất", priority: "medium", stage: "closed", createdDate: "2025-03-10", assignee: "Admin" },
];

// ---- Finance ----
export interface FinanceRecord {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue";
  relatedTo: string;
  classId?: string;
  branchId: string;
}

export const financeRecords: FinanceRecord[] = [
  { id: "FIN001", type: "income", category: "Học phí", description: "Học phí IELTS B1 - Nguyễn Minh Anh", amount: 4500000, date: "2025-03-01", status: "paid", relatedTo: "STU001", classId: "CLS001", branchId: "BR001" },
  { id: "FIN002", type: "income", category: "Học phí", description: "Học phí English A2 - Trần Quốc Bảo", amount: 8000000, date: "2025-01-15", status: "paid", relatedTo: "STU002", classId: "CLS002", branchId: "BR002" },
  { id: "FIN003", type: "expense", category: "Lương GV", description: "Lương T2/2025 - Lê Hoàng Nam", amount: 18000000, date: "2025-03-05", status: "paid", relatedTo: "TCH001", branchId: "BR001" },
  { id: "FIN004", type: "expense", category: "Lương GV", description: "Lương T2/2025 - Sarah Johnson", amount: 22000000, date: "2025-03-05", status: "paid", relatedTo: "TCH002", branchId: "BR002" },
  { id: "FIN005", type: "income", category: "Học phí", description: "Học phí IELTS B2 - Ngô Quang Vinh", amount: 18000000, date: "2025-03-06", status: "paid", relatedTo: "L005", classId: "CLS003", branchId: "BR001" },
  { id: "FIN006", type: "expense", category: "Thuê mặt bằng", description: "Tiền thuê T3/2025", amount: 25000000, date: "2025-03-01", status: "paid", relatedTo: "", branchId: "BR001" },
  { id: "FIN007", type: "income", category: "Học phí", description: "Học phí còn lại - Nguyễn Minh Anh", amount: 3000000, date: "2025-03-25", status: "pending", relatedTo: "STU001", classId: "CLS001", branchId: "BR001" },
  { id: "FIN008", type: "income", category: "Học phí", description: "Học phí A1 - Phạm Đức Khang", amount: 3000000, date: "2025-02-15", status: "overdue", relatedTo: "STU004", classId: "CLS004", branchId: "BR003" },
  { id: "FIN009", type: "expense", category: "Lương GV", description: "Lương T2/2025 - Nguyễn Thị Phượng", amount: 16000000, date: "2025-03-05", status: "paid", relatedTo: "TCH003", branchId: "BR001" },
  { id: "FIN010", type: "expense", category: "Marketing", description: "Facebook Ads T3/2025", amount: 5000000, date: "2025-03-01", status: "paid", relatedTo: "", branchId: "BR003" },
];

// ---- HR Tasks ----
export interface Task {
  id: string;
  title: string;
  assignee: string;
  stage: "todo" | "in_progress" | "done" | "overdue" | "pending";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
  dept: string;
  // Các trường cho Order giáo cụ
  type?: "task" | "order";
  useDate?: string;
  classId?: string;
  className?: string;
  branch?: string;
  orderType?: string;
  orderContent?: string;
  printSpecs?: string;
  quantity?: number;
  lesson?: string;
  resourceLink?: string;
  createdBy?: string;
}

export const tasks: Task[] = [
  { 
    id: "TSK001", 
    title: "Chuẩn bị đề thi cuối kỳ B1", 
    assignee: "Lê Hoàng Nam", 
    stage: "in_progress", 
    priority: "high", 
    dueDate: "2025-03-28",
    createdAt: "2025-03-20",
    dept: "Đào tạo",
    type: "task"
  },
  { 
    id: "ORD001", 
    title: "Order Flashcard - Lớp Kindy 4", 
    assignee: "Admin", 
    stage: "overdue", 
    priority: "medium", 
    dueDate: "2025-04-01",
    createdAt: "2025-03-15",
    dept: "Vận hành",
    type: "order",
    useDate: "2025-04-02",
    className: "KINDY 4",
    branch: "Đội Cấn",
    orderType: "Order đạo cụ lớp học",
    orderContent: "Flashcard",
    quantity: 1,
    lesson: "doctor, policeman, farmer, postman, zookeeper",
    createdBy: "Ms. Hà"
  },
  { 
    id: "TSK002", 
    title: "Sắp xếp lại phòng học A2", 
    assignee: "Admin", 
    stage: "todo", 
    priority: "medium", 
    dueDate: "2025-03-25",
    createdAt: "2025-03-20",
    dept: "Vận hành",
    type: "task"
  },
  { 
    id: "ORD002", 
    title: "In Worksheet Past Simple - 4CLC1", 
    assignee: "Phạm Hồng Nhung", 
    stage: "in_progress", 
    priority: "high", 
    dueDate: "2025-04-03",
    createdAt: "2025-03-28",
    dept: "Vận hành",
    type: "order",
    useDate: "2025-04-04",
    className: "4CLC1",
    branch: "HHT",
    orderType: "Order in ấn",
    orderContent: "Worksheet",
    printSpecs: "In màu",
    quantity: 10,
    lesson: "PAST SIMPLE TENSE",
    resourceLink: "https://drive.google.com/file/d/1...",
    createdBy: "Trần Thu Hà"
  },
  { id: "TSK003", title: "Gửi báo cáo tháng 2 cho BGĐ", assignee: "Admin", stage: "done", priority: "high", dueDate: "2025-03-10", createdAt: "2025-03-01", dept: "Kế toán", type: "task" },
  { id: "TSK004", title: "Họp review chương trình IELTS", assignee: "Nguyễn Thị Phượng", stage: "todo", priority: "medium", dueDate: "2025-03-30", createdAt: "2025-03-25", dept: "Đào tạo", type: "task" },
  { id: "TSK005", title: "Cập nhật tài liệu Speaking Part 2", assignee: "Sarah Johnson", stage: "in_progress", priority: "low", dueDate: "2025-04-01", createdAt: "2025-03-20", dept: "Đào tạo", type: "task" },
  { id: "TSK006", title: "Chấm điểm bài tập viết Unit 4", assignee: "Sarah Johnson", stage: "overdue", priority: "high", dueDate: "2025-03-27", createdAt: "2025-03-20", dept: "Đào tạo", type: "task" },
  { id: "TSK007", title: "Gửi thông báo họp phụ huynh CLS002", assignee: "Sarah Johnson", stage: "todo", priority: "medium", dueDate: "2025-03-29", createdAt: "2025-03-25", dept: "Tuyển sinh", type: "task" },
  { id: "TSK008", title: "Hoàn thành nhận xét tháng 3", assignee: "Sarah Johnson", stage: "done", priority: "high", dueDate: "2025-03-24", createdAt: "2025-03-15", dept: "Đào tạo", type: "task" },
  { 
    id: "ORD003", 
    title: "Order Sticker thưởng tháng 4", 
    assignee: "Nguyễn Văn A", 
    stage: "pending", 
    priority: "medium", 
    dueDate: "2025-04-05", 
    createdAt: "2025-03-30", 
    dept: "Hành chính", 
    type: "order", 
    branch: "Quận 1",
    className: "KINDY 2",
    createdBy: "Sarah Johnson"
  },
  { 
    id: "TSK009", 
    title: "Kiểm tra cơ sở vật chất tầng 3", 
    assignee: "Lê Hoàng Nam", 
    stage: "todo", 
    priority: "low", 
    dueDate: "2025-04-02", 
    createdAt: "2025-03-31", 
    dept: "Vận hành", 
    type: "task",
    branch: "Đội Cấn"
  },
  { 
    id: "TSK010", 
    title: "Thanh toán tiền điện tháng 3", 
    assignee: "Admin", 
    stage: "in_progress", 
    priority: "high", 
    dueDate: "2025-04-05", 
    createdAt: "2025-04-01", 
    dept: "Kế toán", 
    type: "task",
    branch: "HHT"
  },
  { 
    id: "ORD004", 
    title: "In đề thi Mini Test Unit 5", 
    assignee: "Phạm Hồng Nhung", 
    stage: "todo", 
    priority: "high", 
    dueDate: "2025-04-10", 
    createdAt: "2025-04-02", 
    dept: "Vận hành", 
    type: "order",
    branch: "HHT",
    className: "IELTS 1",
    createdBy: "Nguyễn Thị Phượng"
  },
  { 
    id: "TSK011", 
    title: "Gọi điện tư vấn data mới T4", 
    assignee: "Trần Thu Hà", 
    stage: "todo", 
    priority: "medium", 
    dueDate: "2025-04-07", 
    createdAt: "2025-04-02", 
    dept: "Tuyển sinh", 
    type: "task",
    branch: "Đội Cấn"
  },
  { 
    id: "TSK012", 
    title: "Phỏng vấn giáo viên Part-time", 
    assignee: "Nguyễn Thị Phượng", 
    stage: "in_progress", 
    priority: "high", 
    dueDate: "2025-04-08", 
    createdAt: "2025-04-02", 
    dept: "Nhân sự", 
    type: "task"
  },
  { 
    id: "ORD005", 
    title: "Chuẩn bị bánh kẹo liên hoan lớp KINDY 1", 
    assignee: "Admin", 
    stage: "todo", 
    priority: "low", 
    dueDate: "2025-04-12", 
    createdAt: "2025-04-05", 
    dept: "Vận hành", 
    type: "order",
    branch: "Cầu Giấy",
    className: "KINDY 1",
    createdBy: "Sarah Johnson"
  },
];

// ---- Documents ----
export interface DocumentItem {
  id: string;
  title: string;
  type: "pdf" | "docx" | "xlsx" | "pptx";
  classId: string;
  uploadDate: string;
  size: string;
  addedBy: string;
}

export const documents: DocumentItem[] = [
  { id: "DOC001", title: "Giáo trình IELTS Foundation - Unit 1-5", type: "pdf", classId: "CLS001", uploadDate: "2024-09-10", size: "4.5 MB", addedBy: "Admin" },
  { id: "DOC002", title: "Bài tập bổ trợ Grammar B1", type: "docx", classId: "CLS001", uploadDate: "2024-10-15", size: "1.2 MB", addedBy: "Lê Hoàng Nam" },
  { id: "DOC003", title: "Danh sách từ vựng Topic Environment", type: "pdf", classId: "CLS003", uploadDate: "2024-11-20", size: "0.8 MB", addedBy: "Lê Hoàng Nam" },
  { id: "DOC004", title: "Đề thi thử Mock Test Reading B2", type: "pdf", classId: "CLS003", uploadDate: "2024-12-05", size: "2.1 MB", addedBy: "Admin" },
  { id: "DOC005", title: "Tài liệu Pronunciation Guide", type: "pptx", classId: "CLS002", uploadDate: "2024-10-10", size: "8.4 MB", addedBy: "Sarah Johnson" },
  { id: "DOC006", title: "Bảng chia động từ bất quy tắc", type: "pdf", classId: "CLS004", uploadDate: "2025-01-15", size: "0.5 MB", addedBy: "Nguyễn Thị Phượng" },
  { id: "DOC007", title: "Kế hoạch giảng dạy quý 1/2025", type: "xlsx", classId: "all", uploadDate: "2025-01-01", size: "0.3 MB", addedBy: "Admin" },
];

// ---- Attendance ----
export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: "present" | "absent" | "late";
  note?: string;
}

export const attendanceRecords: AttendanceRecord[] = [
  { id: "ATT001", classId: "CLS001", studentId: "STU001", date: "2025-03-24", status: "present" },
  { id: "ATT002", classId: "CLS001", studentId: "STU002", date: "2025-03-24", status: "late", note: "Kẹt xe" },
  { id: "ATT003", classId: "CLS001", studentId: "STU003", date: "2025-03-24", status: "present" },
  { id: "ATT004", classId: "CLS001", studentId: "STU004", date: "2025-03-24", status: "absent", note: "Ốm" },
  { id: "ATT005", classId: "CLS001", studentId: "STU001", date: "2025-03-22", status: "present" },
  { id: "ATT006", classId: "CLS001", studentId: "STU002", date: "2025-03-22", status: "present" },
  { id: "ATT007", classId: "CLS002", studentId: "STU002", date: "2025-03-24", status: "present" },
  { id: "ATT008", classId: "CLS003", studentId: "STU001", date: "2025-03-24", status: "present" },
  { id: "ATT009", classId: "CLS001", studentId: "STU001", date: "2025-03-20", status: "present" },
  { id: "ATT010", classId: "CLS001", studentId: "STU001", date: "2025-03-18", status: "absent", note: "Bận việc gia đình" },
  { id: "ATT011", classId: "CLS003", studentId: "STU001", date: "2025-03-17", status: "present" },
  { id: "ATT012", classId: "CLS001", studentId: "STU001", date: "2025-03-15", status: "late", note: "Xe hỏng" },
];

// ---- Teacher Schedule (for Calendar) ----
export interface ScheduleEvent {
  id: string;
  title: string;
  classId: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "class" | "meeting" | "exam";
}

export const teacherSchedule: ScheduleEvent[] = [
  { id: "EVT001", title: "IELTS B1 - Sáng", classId: "CLS001", room: "Room A1", date: "2025-03-24", startTime: "08:00", endTime: "09:30", type: "class" },
  { id: "EVT002", title: "IELTS B2 - Tối", classId: "CLS003", room: "Room A2", date: "2025-03-24", startTime: "18:30", endTime: "20:00", type: "class" },
  { id: "EVT003", title: "IELTS B1 - Sáng", classId: "CLS001", room: "Room A1", date: "2025-03-26", startTime: "08:00", endTime: "09:30", type: "class" },
  { id: "EVT004", title: "Meeting: Review B1", classId: "", room: "Phòng họp 1", date: "2025-03-25", startTime: "10:00", endTime: "11:30", type: "meeting" },
  { id: "EVT005", title: "English A2 - Chiều", classId: "CLS002", room: "Room B2", date: "2025-03-25", startTime: "14:00", endTime: "15:30", type: "class" },
  { id: "EVT006", title: "IELTS B2 - Tối", classId: "CLS003", room: "Room A2", date: "2025-03-26", startTime: "18:30", endTime: "20:00", type: "class" },
  { id: "EVT007", title: "English A2 - Chiều", classId: "CLS002", room: "Room B2", date: "2025-03-27", startTime: "14:00", endTime: "15:30", type: "class" },
  { id: "EVT008", title: "IELTS B1 - Sáng", classId: "CLS001", room: "Room A1", date: "2025-03-28", startTime: "08:00", endTime: "09:30", type: "class" },
  { id: "EVT009", title: "Mock Test IELTS", classId: "CLS003", room: "Room A2", date: "2025-03-29", startTime: "09:00", endTime: "12:00", type: "exam" },
];

// ---- Dashboard KPIs ----
export const adminKPIs = {
  newStudents: 14,
  newStudentsDelta: "+23%",
  totalRevenue: 76500000,
  revenueDelta: "+12%",
  activeClasses: 4,
  fillRate: 78,
  pendingPayments: 6000000,
  ticketsOpen: 3,
};

export const teacherKPIs = {
  classesToday: 2,
  homeworkToGrade: 8,
  upcomingExams: 1,
  notifications: 3,
};

// Revenue chart data
export const revenueChartData = [
  { month: "T10", revenue: 45000000, expense: 38000000 },
  { month: "T11", revenue: 52000000, expense: 40000000 },
  { month: "T12", revenue: 61000000, expense: 42000000 },
  { month: "T1", revenue: 48000000, expense: 39000000 },
  { month: "T2", revenue: 58000000, expense: 41000000 },
  { month: "T3", revenue: 76500000, expense: 46000000 },
];

export const fillRateData = [
  { name: "IELTS B1", fill: 80, max: 100 },
  { name: "English A2", fill: 67, max: 100 },
  { name: "IELTS B2", fill: 83, max: 100 },
  { name: "Starter A1", fill: 60, max: 100 },
];

// ---- Notifications ----
export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  type: "info" | "warning" | "success";
  role: Role | "all";
}

export const notifications: NotificationItem[] = [
  { id: "NTF001", title: "Yêu cầu chuyển lớp", content: "PH Nguyễn Văn Hùng vừa gửi yêu cầu chuyển lớp cho học sinh Nguyễn Minh Anh.", time: "10 phút trước", isRead: false, type: "warning", role: "admin" },
  { id: "NTF002", title: "Học phí đến hạn", content: "Học sinh Phạm Đức Khang quá hạn đóng học phí 5 ngày.", time: "1 giờ trước", isRead: false, type: "info", role: "admin" },
  { id: "NTF003", title: "Đề thi mới", content: "Admin vừa cập nhật đề thi Mock Test B2 mới.", time: "2 giờ trước", isRead: true, type: "success", role: "teacher" },
  { id: "NTF004", title: "Nhắc nhở điểm danh", content: "Bạn chưa điểm danh lớp CLS001 ngày hôm qua.", time: "1 ngày trước", isRead: false, type: "warning", role: "teacher" },
];

// ---- Timekeeping (Chấm công) ----
export interface TimekeepingRecord {
  id: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  checkInTime: string | null; // HH:mm
  checkOutTime: string | null; // HH:mm
  location: { lat: number; lng: number; name?: string } | null;
  status: "on-time" | "late" | "missing-checkout" | "absent" | "early-leave";
  note?: string;
}

export const timekeepingRecords: TimekeepingRecord[] = [
  { id: "TK001", teacherId: "USR001", date: "2025-03-24", checkInTime: "07:45", checkOutTime: "17:15", location: { lat: 21.028511, lng: 105.804817, name: "Menglish Ba Đình" }, status: "on-time" },
  { id: "TK002", teacherId: "USR002", date: "2025-03-24", checkInTime: "08:15", checkOutTime: null, location: { lat: 21.028511, lng: 105.804817, name: "Menglish Ba Đình" }, status: "late", note: "Xe hỏng ngang đường" },
  { id: "TK003", teacherId: "USR003", date: "2025-03-24", checkInTime: "07:50", checkOutTime: "17:00", location: { lat: 21.028511, lng: 105.804817, name: "Menglish Ba Đình" }, status: "on-time" },
  { id: "TK004", teacherId: "USR001", date: "2025-03-23", checkInTime: "07:55", checkOutTime: "17:30", location: { lat: 21.028511, lng: 105.804817, name: "Menglish Ba Đình" }, status: "on-time" },
  { id: "TK005", teacherId: "USR002", date: "2025-03-23", checkInTime: "08:00", checkOutTime: "17:00", location: { lat: 21.028511, lng: 105.804817, name: "Menglish Ba Đình" }, status: "on-time" },
  { id: "TK006", teacherId: "USR003", date: "2025-03-23", checkInTime: "07:40", checkOutTime: null, location: { lat: 21.328511, lng: 105.844817, name: "Menglish Quận 1" }, status: "missing-checkout" },
  { id: "TK007", teacherId: "USR001", date: "2025-03-22", checkInTime: "08:05", checkOutTime: "17:05", location: { lat: 21.028511, lng: 105.804817, name: "Menglish Ba Đình" }, status: "late" },
  { id: "TK008", teacherId: "USR001", date: "2025-03-21", checkInTime: "07:50", checkOutTime: "15:30", location: { lat: 21.028511, lng: 105.804817, name: "Menglish Ba Đình" }, status: "early-leave", note: "Về sớm đưa con đi khám" },
  { id: "TK009", teacherId: "USR001", date: "2025-03-20", checkInTime: "08:10", checkOutTime: "17:00", location: { lat: 21.028511, lng: 105.804817, name: "Menglish Ba Đình" }, status: "late" },
  { id: "TK010", teacherId: "USR001", date: "2025-03-19", checkInTime: "07:55", checkOutTime: "16:00", location: { lat: 21.028511, lng: 105.804817, name: "Menglish Ba Đình" }, status: "early-leave" },
  { id: "TK011", teacherId: "USR001", date: "2025-03-18", checkInTime: "07:45", checkOutTime: "17:15", location: { lat: 21.028511, lng: 105.804817, name: "Menglish Ba Đình" }, status: "on-time" },
  { id: "TK012", teacherId: "USR001", date: "2025-03-17", checkInTime: "07:45", checkOutTime: "17:15", location: { lat: 21.328511, lng: 105.844817, name: "Menglish Quận 1" }, status: "on-time" },
];

// ---- Accounting (Kế toán Thu Chi) ----
export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: "Học phí" | "Lương" | "Mặt bằng" | "Marketing" | "Khác";
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  createdBy: string;
}

export const transactions: Transaction[] = [
  { id: "TRX001", type: "income", category: "Học phí", amount: 15000000, date: "2025-03-24", description: "Thu học phí học sinh Nguyễn Minh Anh (IELTS Cấp tốc)", createdBy: "Admin" },
  { id: "TRX002", type: "income", category: "Học phí", amount: 8000000, date: "2025-03-23", description: "Thu học phí Phạm Hữu Nam (Trọn gói B1)", createdBy: "Admin" },
  { id: "TRX003", type: "expense", category: "Mặt bằng", amount: 25000000, date: "2025-03-15", description: "Thanh toán mặt bằng tháng 3/2025", createdBy: "Admin" },
  { id: "TRX004", type: "expense", category: "Marketing", amount: 5000000, date: "2025-03-20", description: "Chạy ads Facebook tháng 3", createdBy: "Admin" },
  { id: "TRX006", type: "income", category: "Khác", amount: 2000000, date: "2025-03-22", description: "Bán giáo trình", createdBy: "Admin" },
];

// ---- Course Hierarchy (Khóa học lồng nhau) ----
export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface CourseLevel {
  id: string;
  categoryId: string;
  name: string;
  durationInMonths: number;
  fee: number;
}

export const courseCategories: CourseCategory[] = [
  { id: "CAT_S", name: "Sơ cấp", description: "Dành cho người mất gốc hoặc bắt đầu từ con số 0.", color: "bg-blue-500" },
  { id: "CAT_T", name: "Trung cấp", description: "Củng cố ngữ pháp, giao tiếp căn bản hàng ngày.", color: "bg-green-500" },
  { id: "CAT_K", name: "Sắp vào lớp 1 (Tiền Tiểu học)", description: "Chương trình làm quen Tiếng Anh cho trẻ em 5-6 tuổi.", color: "bg-amber-500" },
  { id: "CAT_TRIAL", name: "Học viên học thử", description: "Lớp dành riêng cho học viên trải nghiệm trước khi nhập học chính thức.", color: "bg-slate-500" },
];

export const courseLevels: CourseLevel[] = [
  // Sơ cấp
  { id: "LVL_S_1", categoryId: "CAT_S", name: "Sơ cấp 1", durationInMonths: 3, fee: 3000000 },
  { id: "LVL_S_2", categoryId: "CAT_S", name: "Sơ cấp 2", durationInMonths: 3, fee: 3200000 },
  { id: "LVL_S_3", categoryId: "CAT_S", name: "Sơ cấp 3", durationInMonths: 3, fee: 3500000 },
  // Trung cấp
  { id: "LVL_T_1", categoryId: "CAT_T", name: "Trung cấp 1", durationInMonths: 4, fee: 4000000 },
  { id: "LVL_T_2", categoryId: "CAT_T", name: "Trung cấp 2", durationInMonths: 4, fee: 4500000 },
  // Tiền tiểu học
  { id: "LVL_K_1", categoryId: "CAT_K", name: "Tiền tiểu học 1", durationInMonths: 6, fee: 5000000 },
  { id: "LVL_K_2", categoryId: "CAT_K", name: "Tiền tiểu học 2", durationInMonths: 6, fee: 5500000 },
  // Học thử
  { id: "LVL_TRIAL", categoryId: "CAT_TRIAL", name: "Lớp học thử", durationInMonths: 0, fee: 0 },
  // Lạc rớt lại cho code có thể tham chiếu
  { id: "LVL_G_1", categoryId: "CAT_S", name: "General 1", durationInMonths: 2, fee: 2000000 },
  { id: "LVL_G_2", categoryId: "CAT_S", name: "General 2", durationInMonths: 2, fee: 2500000 },
  { id: "LVL_B_1", categoryId: "CAT_T", name: "Business 1", durationInMonths: 3, fee: 4000000 },
];

// ---- Parent Mock Data ----
export interface Grade {
  subject: string;
  midterm: number;
  final: number;
  comments: string;
}

export const mockGrades: Grade[] = [
  { subject: "Ngữ pháp Căn bản", midterm: 8.5, final: 9.0, comments: "Học sinh hiểu bài nhanh, làm bài tập đầy đủ." },
  { subject: "Giao tiếp Tình huống", midterm: 7.0, final: 8.5, comments: "Cần mạnh dạn phát biểu hơn trên lớp." },
  { subject: "Tiếng Anh Nghe Hiểu", midterm: 8.0, final: 8.5, comments: "Kỹ năng nghe tốt, cần luyện thêm phản xạ." },
];

export interface Homework {
  id: string;
  title: string;
  dueDate: string;
  status: "submitted" | "pending" | "late";
  score?: number;
  comments?: string;
}

export const mockHomeworks: Homework[] = [
  { id: "HW001", title: "Unit 1: Present Simple Exercises", dueDate: "2025-03-01", status: "submitted", score: 9.5, comments: "Làm bài rất tốt, chữ viết cẩn thận." },
  { id: "HW002", title: "Unit 2: Vocabulary Matching", dueDate: "2025-03-10", status: "submitted", score: 8.0, comments: "Sai một số từ vựng nâng cao, cần ôn thêm." },
  { id: "HW003", title: "Unit 3: Speaking Video Recording", dueDate: "2025-03-18", status: "submitted", score: 9.0, comments: "Phát âm tiến bộ, tự tin." },
  { id: "HW004", title: "Unit 4: Reading Comprehension", dueDate: "2025-03-25", status: "pending" },
  { id: "HW005", title: "Unit 5: Grammar Quiz", dueDate: "2025-03-30", status: "pending" },
];

export interface TuitionRecord {
  id: string;
  studentId: string;
  month: string;
  amount: number;
  dueDate: string;
  status: "paid" | "unpaid";
  paymentDate?: string;
}

export const mockTuitions: TuitionRecord[] = [
  { id: "BILL001", studentId: "STU001", month: "Tháng 03/2025", amount: 15000000, dueDate: "2025-03-20", status: "paid", paymentDate: "2025-03-24" },
  { id: "BILL002", studentId: "STU001", month: "Tháng 02/2025", amount: 15000000, dueDate: "2025-02-20", status: "paid", paymentDate: "2025-02-18" },
  { id: "BILL003", studentId: "STU001", month: "Tháng 01/2025", amount: 15000000, dueDate: "2025-01-20", status: "paid", paymentDate: "2025-01-15" },
  { id: "BILL004", studentId: "STU001", month: "Tháng 04/2025", amount: 15000000, dueDate: "2025-04-20", status: "unpaid" },
  { id: "BILL005", studentId: "STU002", month: "Tháng 03/2025", amount: 8000000, dueDate: "2025-03-25", status: "unpaid" },
];

// ---- Student Make-up Classes (Danh sách học bù) ----
export interface MakeUpRecord {
  id: string;
  studentId: string;
  absentDate: string;
  makeUpDate?: string;
  learnWith?: string; // Class name or Teacher
  note?: string;
  status: "pending" | "scheduled" | "completed";
}

export const mockMakeUpRecords: MakeUpRecord[] = [
  { id: "MUP001", studentId: "STU001", absentDate: "2025-03-18", status: "completed", makeUpDate: "2025-03-20", learnWith: "CLS001", note: "Bù buổi T3" },
  { id: "MUP002", studentId: "STU002", absentDate: "2025-03-24", status: "pending", note: "Kẹt xe nghỉ có phép" },
  { id: "MUP003", studentId: "STU004", absentDate: "2025-03-24", status: "scheduled", makeUpDate: "2025-03-26", learnWith: "CLS002", note: "Học bù cùng lớp 4CLC" },
];

// ---- CRM Sales Reports ----
export interface SalesStats {
  id: string;
  staffName: string;
  customers: number;
  saleAmount: number;
  commissionRate: number;
  totalCommission: number;
  kpi: number; // Percentage
  month: string;
}

export const salesData: SalesStats[] = [
  {
    id: "S1",
    staffName: "Nguyễn Bích Ngọc",
    customers: 1,
    saleAmount: 3550000,
    commissionRate: 3,
    totalCommission: 106500,
    kpi: 75,
    month: "3/2026"
  },
  {
    id: "S2",
    staffName: "Nguyễn Thuỳ Linh",
    customers: 4,
    saleAmount: 15445000,
    commissionRate: 3,
    totalCommission: 463350,
    kpi: 92,
    month: "3/2026"
  },
  {
    id: "S3",
    staffName: "Trần Minh Quân",
    customers: 2,
    saleAmount: 8200000,
    commissionRate: 3,
    totalCommission: 246000,
    kpi: 60,
    month: "2/2026"
  },
  {
    id: "S4",
    staffName: "Phạm Hồng Nhung",
    customers: 3,
    saleAmount: 12000000,
    commissionRate: 3,
    totalCommission: 360000,
    kpi: 85,
    month: "2/2026"
  }
];

// ---- Pronunciation Exercises (Nộp kết quả phát âm) ----
export interface PronunciationAttempt {
  id: string;
  studentId: string;
  studentName: string;
  audioUrl: string;
  submittedAt: string;
  score: number;
  feedback: string;
}

export interface PronunciationAssignment {
  id: string;
  classId: string;
  word: string;
  phonetic: string;
  audioExample: string;
  deadline: string;
  status: "pending" | "completed" | "late";
  attempts: PronunciationAttempt[];
}

export const mockPronunciations: PronunciationAssignment[] = [
  {
    id: "PRON001",
    classId: "CLS001",
    word: "Beautiful",
    phonetic: "/ˈbjuːtɪfl/",
    audioExample: "https://dictionary.cambridge.org/media/english/us_pron/b/bea/beaut/beautiful.mp3",
    deadline: "2025-04-05",
    status: "completed",
    attempts: [
      { id: "ATT001", studentId: "STU001", studentName: "Đăng Khoa Bing", audioUrl: "#", submittedAt: "01/04/2025 10:00", score: 75, feedback: "Phát âm âm 't' hơi cứng, cần mềm mại hơn ở âm cuối." },
      { id: "ATT002", studentId: "STU001", studentName: "Đăng Khoa Bing", audioUrl: "#", submittedAt: "02/04/2025 14:30", score: 92, feedback: "Rất tốt! Âm 'eau' và 'ti' đã chuẩn hơn nhiều. Cố gắng phát huy nhé." },
      { id: "ATT003", studentId: "STU002", studentName: "Bảo Thư Mimi", audioUrl: "#", submittedAt: "02/04/2025 15:00", score: 85, feedback: "Tốt, nhưng cần chú ý trọng âm." }
    ]
  },
  {
    id: "PRON002",
    classId: "CLS001",
    word: "Environment",
    phonetic: "/ɪnˈvaɪrənmənt/",
    audioExample: "https://dictionary.cambridge.org/media/english/us_pron/e/env/envir/environment.mp3",
    deadline: "2025-04-07",
    status: "pending",
    attempts: [
      { id: "ATT004", studentId: "STU001", studentName: "Đăng Khoa Bing", audioUrl: "#", submittedAt: "03/04/2025 09:00", score: 65, feedback: "Chú ý nhấn trọng âm rơi vào âm tiết thứ hai 'vi'. Em đọc hơi bị đều." },
      { id: "ATT005", studentId: "STU003", studentName: "Thành Vinh Brian", audioUrl: "#", submittedAt: "03/04/2025 11:30", score: 0, feedback: "" } // Pending grade
    ]
  },
  {
    id: "PRON003",
    classId: "CLS002",
    word: "Schedule",
    phonetic: "/ˈʃedjuːl/",
    audioExample: "https://dictionary.cambridge.org/media/english/us_pron/s/sch/sched/schedule.mp3",
    deadline: "2025-04-10",
    status: "pending",
    attempts: []
  },
  {
    id: "PRON004",
    classId: "CLS001",
    word: "Success",
    phonetic: "/səkˈses/",
    audioExample: "https://dictionary.cambridge.org/media/english/us_pron/s/suc/succe/success.mp3",
    deadline: "2025-03-30",
    status: "late",
    attempts: []
  }
];

// ---- Survey Module Data ----
export interface SurveyQuestion {
  id: string;
  content: string;
  type: "rating" | "text";
  weight?: number; // percent
}

export interface SurveyTemplate {
  id: string;
  name: string;
  questions: SurveyQuestion[];
}

export interface SurveySubmission {
  id: string;
  templateId: string;
  studentId: string;
  studentName: string;
  className?: string;
  segment: string; // "Cấp 1", "IELTS", "Giao tiếp"
  totalScore: number;
  feedback: string;
  submittedAt: string;
  answers: { questionId: string; rating?: number; textAnswer?: string }[];
}

export const mockSurveyTemplates: SurveyTemplate[] = [
  {
    id: "TPL_CAP1",
    name: "Khảo sát chất lượng đào tạo - Tiếng Anh Cấp 1",
    questions: [
      { id: "q1", content: "Mức độ hài lòng của Phụ huynh về sự tiến bộ của con?", type: "rating", weight: 30 },
      { id: "q2", content: "Mức độ hài lòng với phương pháp giảng dạy của giáo viên?", type: "rating", weight: 30 },
      { id: "q3", content: "Cơ sở vật chất của phòng học có đáp ứng tốt không?", type: "rating", weight: 20 },
      { id: "q4", content: "Tần suất liên lạc của bộ phận CSKH có phù hợp không?", type: "rating", weight: 20 },
      { id: "q5", content: "Phụ huynh có góp ý thêm để cải thiện chất lượng giảng dạy?", type: "text" }
    ]
  },
  {
    id: "TPL_IELTS",
    name: "Khảo sát chất lượng đào tạo - Luyện thi IELTS",
    questions: [
      { id: "q6", content: "Giáo trình và bài tập về nhà có bám sát mục tiêu band điểm?", type: "rating", weight: 40 },
      { id: "q7", content: "Giáo viên chữa bài Writing/Speaking có chi tiết không?", type: "rating", weight: 40 },
      { id: "q8", content: "Cơ sở vật chất và môi trường học tập thế nào?", type: "rating", weight: 20 },
      { id: "q9", content: "Bạn có góp ý gì để cải thiện khóa học IELTS không?", type: "text" }
    ]
  },
  {
    id: "TPL_GIAOTIEP",
    name: "Khảo sát chất lượng đào tạo - Tiếng Anh Giao tiếp",
    questions: [
      { id: "q10", content: "Mức độ tự tin khi giao tiếp bằng Tiếng Anh sau khóa học?", type: "rating", weight: 50 },
      { id: "q11", content: "Giáo viên có thường xuyên tạo không khí học tập sôi nổi?", type: "rating", weight: 50 },
      { id: "q12", content: "Góp ý khác của bạn:", type: "text" }
    ]
  }
];

export const mockSurveySubmissions: SurveySubmission[] = [
  { id: "SUB01", templateId: "TPL_CAP1", studentId: "STU001", studentName: "Đăng Khoa Bing", className: "4CLC 2", segment: "Cấp 1", totalScore: 4.8, feedback: "Giáo viên nhiệt tình, con học rất thích. Tôi rất hài lòng về phương pháp giảng dạy.", submittedAt: "01/04/2026", answers: [] },
  { id: "SUB02", templateId: "TPL_CAP1", studentId: "STU002", studentName: "Bảo Thư Mimi", className: "4CLC 2", segment: "Cấp 1", totalScore: 5.0, feedback: "Mọi thứ rất tốt, bé tiến bộ rõ. Mong trung tâm tiếp tục phát huy.", submittedAt: "02/04/2026", answers: [] },
  { id: "SUB03", templateId: "TPL_CAP1", studentId: "STU003", studentName: "Thành Vinh Brian", className: "4CLC 2", segment: "Cấp 1", totalScore: 2.5, feedback: "Lớp hơi đông, bé ít được tương tác bằng tiếng Anh. Giáo viên ít quan tâm bé.", submittedAt: "03/04/2026", answers: [] },
  { id: "SUB04", templateId: "TPL_IELTS", studentId: "STU004", studentName: "Trần Minh Quân", className: "IELTS B1", segment: "IELTS", totalScore: 4.5, feedback: "Giáo trình bám sát đề thi thật. Mình đã thi đạt mục tiêu đề ra.", submittedAt: "01/04/2026", answers: [] },
  { id: "SUB05", templateId: "TPL_IELTS", studentId: "STU005", studentName: "Nguyễn Bảo Hân", className: "IELTS B2", segment: "IELTS", totalScore: 2.8, feedback: "Chấm bài Writing chậm, không có nhiều góp ý sâu. Cơ sở vật chất ổn nhưng phòng hơi tối.", submittedAt: "05/04/2026", answers: [] },
  { id: "SUB06", templateId: "TPL_CAP1", studentId: "STU006", studentName: "Hà Anh Kuromi", className: "4CLC 2", segment: "Cấp 1", totalScore: 3.5, feedback: "Phòng học hơi nóng vào buổi chiều. Máy lạnh thường kêu to.", submittedAt: "02/04/2026", answers: [] },
  { id: "SUB07", templateId: "TPL_CAP1", studentId: "STU007", studentName: "Tấn Kiệt", className: "4CLC 2", segment: "Cấp 1", totalScore: 4.2, feedback: "Tốt", submittedAt: "04/04/2026", answers: [] },
  { id: "SUB08", templateId: "TPL_IELTS", studentId: "STU008", studentName: "Lê Minh Châu", className: "IELTS B2", segment: "IELTS", totalScore: 3.8, feedback: "Cần cập nhật đề Cambridge mới hơn để luyện tập sát thực tế.", submittedAt: "06/04/2026", answers: [] },
  { id: "SUB09", templateId: "TPL_GIAOTIEP", studentId: "STU009", studentName: "Vũ Quang Minh", className: "Giao tiếp T1", segment: "Giao tiếp", totalScore: 4.6, feedback: "Thầy Tây dạy rất hay, tạo động lực tốt cho học viên.", submittedAt: "07/04/2026", answers: [] },
  { id: "SUB10", templateId: "TPL_GIAOTIEP", studentId: "STU010", studentName: "Lý Thu Hà", className: "Giao tiếp T1", segment: "Giao tiếp", totalScore: 2.0, feedback: "Trung tâm hay đổi lịch học đột xuất không báo trước, ảnh hưởng đến kế hoạch của mình.", submittedAt: "08/04/2026", answers: [] }
];

// ============================================================
// SYLLABUS MODULE DATA
// ============================================================

export type HomeworkType = "video_speaking" | "quizizz" | "writing";
export type HomeworkStatus = "pending" | "submitted" | "graded";
export type AttendanceStatus = "present" | "absent" | "late";

export interface SyllabusHomework {
  id: string;
  type: HomeworkType;
  title: string;
  description: string;
  externalLink?: string; // Quizizz link hoặc tài liệu tham khảo
}

export interface SyllabusSession {
  id: string;
  syllabusId: string;
  order: number;
  title: string;
  vocab: string;
  grammar: string;
  teachingProcess: string;
  materialsLink?: string;
  homeworks: SyllabusHomework[];
}

export interface Syllabus {
  id: string;
  name: string;
  description: string;
  level: string;
  totalSessions: number;
  createdAt: string;
  updatedAt: string;
  sessions: SyllabusSession[];
}

export interface ClassSchedule {
  id: string;
  classId: string;
  className: string;
  syllabusId: string;
  syllabusSessionId: string;
  teacherId: string;
  teacherName: string;
  taId?: string;
  taName?: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  status: "upcoming" | "in_progress" | "completed";

  // ─── Phase 1: Class Schedule Instance Layer ──────────────────────
  /** Loại buổi: regular = buổi gốc theo template; split-a/-b = sau khi tách; makeup = buổi bù; merged = buổi gộp 2 session */
  kind?: "regular" | "split-a" | "split-b" | "makeup" | "merged";
  /** Trạng thái tiến độ chi tiết (Phase 2 sẽ giáo viên tick) */
  progressStatus?: "planned" | "completed-full" | "completed-partial" | "skipped";
  /** % nội dung session đã dạy (0-100). Mặc định 100 nếu completed-full */
  progressPercent?: number;
  /** Ghi chú từ giáo viên về tiến độ buổi học */
  progressNote?: string;
  /** Nếu là split/makeup, tham chiếu tới buổi gốc */
  parentScheduleId?: string;
  /** Nếu kind=merged, danh sách session gộp thêm (ngoài syllabusSessionId chính) */
  mergedSessionIds?: string[];
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  studentAvatar: string;
  status: AttendanceStatus;
  note?: string;
}

export interface DailyReport {
  id: string;
  classScheduleId: string;
  classId: string;
  className: string;
  sessionTitle: string;
  date: string;
  taId: string;
  taName: string;
  attendance: AttendanceRecord[];
  classEnergy: number; // 1-5
  generalNotes: string;
  issues: string;
  submittedAt?: string;
  isDraft: boolean;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  homeworkType: HomeworkType;
  classScheduleId: string;
  sessionTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  submitUrl?: string;
  submitText?: string;
  submitVideoFileName?: string;
  submittedAt: string;
  status: HomeworkStatus;
  score?: number; // 0-10
  feedback?: string;
  gradedAt?: string;
  gradedByName?: string;
}

// --- Mock Syllabuses ---
export const syllabuses: Syllabus[] = [
  {
    id: "SYL001",
    name: "Family & Friends 1",
    description: "Giáo trình tiếng Anh cho trẻ em lớp 1-2, xây dựng nền tảng từ vựng và giao tiếp cơ bản",
    level: "4CLC 1",
    totalSessions: 10,
    createdAt: "2025-09-01",
    updatedAt: "2026-01-10",
    sessions: [
      {
        id: "SS001", syllabusId: "SYL001", order: 1,
        title: "Hello! My name is...",
        vocab: "Hello, Hi, My name is, What's your name?, Nice to meet you, Goodbye, Bye",
        grammar: "Subject pronouns: I, You. Simple present: My name is... / I am...",
        teachingProcess: "1. Warm-up: Teacher greets students (3 min)\n2. Introduce vocabulary with flashcards (10 min)\n3. Model dialogue practice in pairs (10 min)\n4. Role-play: Meet and greet activity (10 min)\n5. Song: 'Hello Song' (5 min)\n6. Wrap-up & assign homework (2 min)",
        materialsLink: "https://docs.google.com/presentation/d/1LaQbRKZF42ixQhsHeXDEaIXn8ZkjZK-M/edit?slide=id.p10#slide=id.p10",
        homeworks: [
          { id: "HW001", type: "video_speaking", title: "Introduce yourself", description: "Record a 30-second video introducing yourself in English: name, age, class." },
          { id: "HW002", type: "writing", title: "Write your name card", description: "Draw and write: My name is ___, I am ___ years old." }
        ]
      },
      {
        id: "SS002", syllabusId: "SYL001", order: 2,
        title: "My family",
        vocab: "Mother, Father, Sister, Brother, Grandmother, Grandfather, Family",
        grammar: "This is my... / These are my... | Possessive: my, your, his, her",
        teachingProcess: "1. Review Unit 1 vocabulary (5 min)\n2. Family flashcards presentation (10 min)\n3. Listen & point in the book (8 min)\n4. Draw your family tree activity (10 min)\n5. Present family tree to class (7 min)\n6. Homework explanation (2 min)",
        materialsLink: "https://docs.google.com/presentation/d/1LaQbRKZF42ixQhsHeXDEaIXn8ZkjZK-M/edit?slide=id.p10#slide=id.p10",
        homeworks: [
          { id: "HW003", type: "video_speaking", title: "Talk about your family", description: "Record a video (45 seconds) talking about your family members." },
          { id: "HW004", type: "quizizz", title: "Family vocabulary quiz", description: "Complete the Quizizz on family vocabulary.", externalLink: "https://quizizz.com/join?gc=123456" }
        ]
      },
      {
        id: "SS003", syllabusId: "SYL001", order: 3,
        title: "My toys",
        vocab: "Ball, Doll, Car, Train, Robot, Teddy bear, Bike",
        grammar: "I have a/an... | Do you have a...? Yes, I do / No, I don't",
        teachingProcess: "1. Warm-up toy guessing game (5 min)\n2. Introduce toy vocabulary with realia (10 min)\n3. Chant: 'I have a ball' (5 min)\n4. Survey activity: Ask classmates about toys (12 min)\n5. Report back findings (5 min)\n6. Assign homework (3 min)",
        materialsLink: "https://drive.google.com/ff1-session3",
        homeworks: [
          { id: "HW005", type: "video_speaking", title: "Show your favourite toy", description: "Record a video showing and describing your favourite toy." },
          { id: "HW006", type: "writing", title: "My toy list", description: "Write 5 sentences: I have a ___ . It is ___." }
        ]
      },
      {
        id: "SS004", syllabusId: "SYL001", order: 4,
        title: "Colors & Shapes",
        vocab: "Red, Blue, Green, Yellow, Orange, Circle, Square, Triangle, Star, Heart",
        grammar: "What color is it? It's... | What shape is it? It's a...",
        teachingProcess: "1. Rainbow song warm-up (5 min)\n2. Color & shape flashcard drill (10 min)\n3. Art activity: Draw and color shapes (12 min)\n4. Describe each other's artwork (8 min)\n5. Digital quiz on screen (5 min)\n6. Wrap-up (2 min)",
        materialsLink: "https://drive.google.com/ff1-session4",
        homeworks: [
          { id: "HW007", type: "quizizz", title: "Colors & shapes quiz", description: "Complete the Quizizz about colors and shapes.", externalLink: "https://quizizz.com/join?gc=654321" },
          { id: "HW008", type: "writing", title: "My colorful drawing", description: "Draw a picture and write 5 sentences describing the colors and shapes." }
        ]
      },
      {
        id: "SS005", syllabusId: "SYL001", order: 5,
        title: "Food I like",
        vocab: "Apple, Banana, Rice, Bread, Milk, Juice, Chicken, Fish, Vegetables",
        grammar: "I like... / I don't like... | Do you like...? Yes, I do / No, I don't",
        teachingProcess: "1. Food bingo warm-up (5 min)\n2. Food vocabulary with real pictures (10 min)\n3. Like/Don't like sorting activity (10 min)\n4. Interview a classmate about food (10 min)\n5. Share results (5 min)\n6. Homework (2 min)",
        materialsLink: "https://drive.google.com/ff1-session5",
        homeworks: [
          { id: "HW009", type: "video_speaking", title: "My favourite food", description: "Record a 45-second video talking about your favourite food." },
          { id: "HW010", type: "quizizz", title: "Food vocabulary practice", description: "Complete the Quizizz on food vocabulary.", externalLink: "https://quizizz.com/join?gc=789012" }
        ]
      },
      {
        id: "SS006", syllabusId: "SYL001", order: 6,
        title: "My body",
        vocab: "Head, Shoulders, Knees, Toes, Eyes, Ears, Mouth, Nose, Hands, Feet",
        grammar: "I have two... | Touch your... | Body part commands",
        teachingProcess: "1. Head Shoulders Knees & Toes song (5 min)\n2. Body parts flashcard labeling (8 min)\n3. Simon Says game (10 min)\n4. Draw & label a body (10 min)\n5. TPR activity with music (7 min)\n6. Homework (2 min)",
        materialsLink: "https://drive.google.com/ff1-session6",
        homeworks: [
          { id: "HW011", type: "video_speaking", title: "Sing the body parts song", description: "Record yourself singing and acting out 'Head, Shoulders, Knees and Toes'." },
          { id: "HW012", type: "writing", title: "Body drawing homework", description: "Draw and label 8 body parts in English." }
        ]
      },
      {
        id: "SS007", syllabusId: "SYL001", order: 7,
        title: "Animals",
        vocab: "Cat, Dog, Bird, Fish, Rabbit, Elephant, Lion, Tiger, Monkey, Duck",
        grammar: "It's a... | It can... (jump, fly, swim, run) | I like animals.",
        teachingProcess: "1. Animal sound warm-up (5 min)\n2. Introduce animals with flashcards (10 min)\n3. Animal can/can't chart activity (10 min)\n4. Animal riddle game (10 min)\n5. Mini project: My favourite animal (5 min)\n6. Homework (2 min)",
        materialsLink: "https://drive.google.com/ff1-session7",
        homeworks: [
          { id: "HW013", type: "video_speaking", title: "My favourite animal", description: "Record a video about your favourite animal: what it looks like and what it can do." },
          { id: "HW014", type: "quizizz", title: "Animal vocabulary quiz", description: "Complete the Quizizz on animals.", externalLink: "https://quizizz.com/join?gc=345678" }
        ]
      },
      {
        id: "SS008", syllabusId: "SYL001", order: 8,
        title: "At school",
        vocab: "Classroom, Book, Pencil, Ruler, Bag, Desk, Chair, Teacher, Student, Board",
        grammar: "There is a... / There are... | Where is the...? It's on/in/under...",
        teachingProcess: "1. Classroom scavenger hunt (7 min)\n2. School vocab flashcards (8 min)\n3. Preposition practice with classroom objects (10 min)\n4. Listening: find the object (8 min)\n5. Group activity: describe our classroom (7 min)\n6. Homework (2 min)",
        materialsLink: "https://drive.google.com/ff1-session8",
        homeworks: [
          { id: "HW015", type: "video_speaking", title: "Tour of my school bag", description: "Record a video showing what's in your school bag and describing each item." },
          { id: "HW016", type: "writing", title: "My classroom description", description: "Write 5 sentences describing your classroom using there is/there are." }
        ]
      },
      {
        id: "SS009", syllabusId: "SYL001", order: 9,
        title: "Numbers & Counting",
        vocab: "One to twenty, How many?, First, Second, Third, More, Less",
        grammar: "How many...are there? There are... | Ordinal numbers: 1st, 2nd, 3rd",
        teachingProcess: "1. Number song warm-up 1-20 (5 min)\n2. Counting flashcard drill (8 min)\n3. Number line activity on board (8 min)\n4. Ordinal number game (racing) (10 min)\n5. Math in English mini worksheet (9 min)\n6. Homework (2 min)",
        materialsLink: "https://drive.google.com/ff1-session9",
        homeworks: [
          { id: "HW017", type: "video_speaking", title: "Count 1-20 challenge", description: "Record yourself counting from 1-20 and pointing to 5 objects, saying how many." },
          { id: "HW018", type: "quizizz", title: "Numbers quiz", description: "Complete the Quizizz on numbers 1-20.", externalLink: "https://quizizz.com/join?gc=901234" }
        ]
      },
      {
        id: "SS010", syllabusId: "SYL001", order: 10,
        title: "Review & End-of-term celebration",
        vocab: "Review all units 1-9",
        grammar: "Review all grammar points from Unit 1-9",
        teachingProcess: "1. Kahoot review game covering all units (15 min)\n2. Student presentations (from HW) (15 min)\n3. Certificates & celebration (10 min)",
        materialsLink: "https://drive.google.com/ff1-session10",
        homeworks: [
          { id: "HW019", type: "video_speaking", title: "Final speaking showcase", description: "Record a 1-minute video: introduce yourself, talk about your family, favourite food, and favourite animal." }
        ]
      }
    ]
  },
  {
    id: "SYL002",
    name: "Family & Friends 2",
    description: "Giáo trình tiếng Anh nâng cao cho trẻ em, mở rộng từ vựng và cấu trúc ngữ pháp",
    level: "4CLC 2",
    totalSessions: 10,
    createdAt: "2025-09-01",
    updatedAt: "2026-02-15",
    sessions: [
      {
        id: "SS101", syllabusId: "SYL002", order: 1,
        title: "At home",
        vocab: "Living room, Bedroom, Kitchen, Bathroom, Garden, Sofa, Table, Window, Door",
        grammar: "There is/are... | Prepositions: in, on, under, next to, behind, in front of",
        teachingProcess: "1. House tour video warm-up (5 min)\n2. Room vocabulary flashcards (10 min)\n3. Preposition practice with toy house (10 min)\n4. Describe your dream home (10 min)\n5. Listening activity (5 min)\n6. Homework (2 min)",
        materialsLink: "https://drive.google.com/ff2-session1",
        homeworks: [
          { id: "HW101", type: "video_speaking", title: "Tour of my home", description: "Record a video giving a tour of your home in English." },
          { id: "HW102", type: "quizizz", title: "Home vocabulary quiz", description: "Complete the Quizizz on home vocabulary.", externalLink: "https://quizizz.com/join?gc=111222" }
        ]
      },
      {
        id: "SS102", syllabusId: "SYL002", order: 2,
        title: "Daily routines",
        vocab: "Wake up, Brush teeth, Have breakfast, Go to school, Do homework, Have dinner, Go to bed",
        grammar: "Present simple for routines: I wake up at... | Frequency adverbs: always, usually, sometimes, never",
        teachingProcess: "1. Daily routine timeline warm-up (5 min)\n2. Vocabulary presentation with pictures (10 min)\n3. Adverb of frequency ranking (8 min)\n4. My day writing activity (10 min)\n5. Share routines in pairs (7 min)\n6. Homework (2 min)",
        materialsLink: "https://drive.google.com/ff2-session2",
        homeworks: [
          { id: "HW103", type: "video_speaking", title: "My morning routine", description: "Record a video describing your morning routine from wake up to going to school." },
          { id: "HW104", type: "writing", title: "My daily schedule", description: "Write a paragraph about your daily routine using frequency adverbs." }
        ]
      }
    ]
  }
];

// --- Mock Class Schedules ---
export const classSchedules: ClassSchedule[] = [
  {
    id: "CS001", classId: "CLS001", className: "4CLC 2",
    syllabusId: "SYL001", syllabusSessionId: "SS004",
    teacherId: "USR001", teacherName: "Ms. Thu Trang",
    taId: "USR003", taName: "Ms. Linh Chi",
    date: "2026-04-22", startTime: "08:00", endTime: "09:30",
    room: "Phòng A1", status: "in_progress",
    kind: "regular", progressStatus: "planned",
  },
  {
    id: "CS002", classId: "CLS001", className: "4CLC 2",
    syllabusId: "SYL001", syllabusSessionId: "SS003",
    teacherId: "USR001", teacherName: "Ms. Thu Trang",
    taId: "USR003", taName: "Ms. Linh Chi",
    date: "2026-04-19", startTime: "08:00", endTime: "09:30",
    room: "Phòng A1", status: "completed",
    kind: "regular", progressStatus: "completed-full", progressPercent: 100,
  },
  // SS002 (My family) bị tách thành 2 buổi vì lớp học chậm
  {
    id: "CS003", classId: "CLS001", className: "4CLC 2",
    syllabusId: "SYL001", syllabusSessionId: "SS002",
    teacherId: "USR001", teacherName: "Ms. Thu Trang",
    taId: "USR003", taName: "Ms. Linh Chi",
    date: "2026-04-15", startTime: "08:00", endTime: "09:30",
    room: "Phòng A1", status: "completed",
    kind: "split-a", progressStatus: "completed-partial", progressPercent: 60,
    progressNote: "Dạy được Vocab + giới thiệu Grammar. Phần luyện tập + Speaking dời sang buổi sau.",
  },
  {
    id: "CS003B", classId: "CLS001", className: "4CLC 2",
    syllabusId: "SYL001", syllabusSessionId: "SS002",
    teacherId: "USR001", teacherName: "Ms. Thu Trang",
    taId: "USR003", taName: "Ms. Linh Chi",
    date: "2026-04-17", startTime: "08:00", endTime: "09:30",
    room: "Phòng A1", status: "completed",
    kind: "split-b", parentScheduleId: "CS003",
    progressStatus: "completed-full", progressPercent: 40,
    progressNote: "Hoàn thành 40% còn lại của Session 2 (luyện tập + Speaking).",
  },
  {
    id: "CS004", classId: "CLS001", className: "4CLC 2",
    syllabusId: "SYL001", syllabusSessionId: "SS001",
    teacherId: "USR001", teacherName: "Ms. Thu Trang",
    taId: "USR003", taName: "Ms. Linh Chi",
    date: "2026-04-10", startTime: "08:00", endTime: "09:30",
    room: "Phòng A1", status: "completed",
    kind: "regular", progressStatus: "completed-full", progressPercent: 100,
  },
  {
    id: "CS005", classId: "CLS001", className: "4CLC 2",
    syllabusId: "SYL001", syllabusSessionId: "SS005",
    teacherId: "USR001", teacherName: "Ms. Thu Trang",
    taId: "USR003", taName: "Ms. Linh Chi",
    date: "2026-04-26", startTime: "08:00", endTime: "09:30",
    room: "Phòng A1", status: "upcoming",
    kind: "regular", progressStatus: "planned",
  },
];

// --- Mock Daily Reports ---
export const dailyReports: DailyReport[] = [
  {
    id: "DR001",
    classScheduleId: "CS003",
    classId: "CLS001",
    className: "4CLC 2",
    sessionTitle: "My family",
    date: "2026-04-15",
    taId: "USR003",
    taName: "Ms. Linh Chi",
    attendance: [
      { studentId: "STU001", studentName: "Đăng Khoa Bing", studentAvatar: "DK", status: "present" },
      { studentId: "STU002", studentName: "Bảo Thư Mimi", studentAvatar: "BT", status: "present" },
      { studentId: "STU003", studentName: "Thành Vinh Brian", studentAvatar: "TV", status: "late", note: "Đến trễ 10 phút" },
      { studentId: "STU004", studentName: "Jessica", studentAvatar: "JS", status: "absent", note: "Báo bệnh" },
      { studentId: "STU005", studentName: "Thiện Nhân Tom", studentAvatar: "TN", status: "present" },
      { studentId: "STU006", studentName: "Hà Anh Kuromi", studentAvatar: "HA", status: "present" },
    ],
    classEnergy: 4,
    generalNotes: "Lớp học sôi nổi, các bé rất hứng thú với chủ đề gia đình. Bài family tree được các bé thực hiện sáng tạo.",
    issues: "Jessica vắng buổi này, cần nhắc bé bắt kịp bài.",
    submittedAt: "2026-04-15T10:00:00",
    isDraft: false,
  },
  {
    id: "DR002",
    classScheduleId: "CS004",
    classId: "CLS001",
    className: "4CLC 2",
    sessionTitle: "Hello! My name is...",
    date: "2026-04-10",
    taId: "USR003",
    taName: "Ms. Linh Chi",
    attendance: [
      { studentId: "STU001", studentName: "Đăng Khoa Bing", studentAvatar: "DK", status: "present" },
      { studentId: "STU002", studentName: "Bảo Thư Mimi", studentAvatar: "BT", status: "present" },
      { studentId: "STU003", studentName: "Thành Vinh Brian", studentAvatar: "TV", status: "present" },
      { studentId: "STU004", studentName: "Jessica", studentAvatar: "JS", status: "present" },
      { studentId: "STU005", studentName: "Thiện Nhân Tom", studentAvatar: "TN", status: "present" },
      { studentId: "STU006", studentName: "Hà Anh Kuromi", studentAvatar: "HA", status: "present" },
    ],
    classEnergy: 5,
    generalNotes: "Buổi đầu tiên, không khí rất vui vẻ. Tất cả học sinh đến đúng giờ và hào hứng làm quen nhau.",
    issues: "",
    submittedAt: "2026-04-10T10:15:00",
    isDraft: false,
  }
];

// --- Mock Homework Submissions ---
export const homeworkSubmissions: HomeworkSubmission[] = [
  {
    id: "HWS001", homeworkId: "HW001", homeworkTitle: "Introduce yourself", homeworkType: "video_speaking",
    classScheduleId: "CS004", sessionTitle: "Hello! My name is...",
    studentId: "STU011", studentName: "Minh Anh Mina", studentAvatar: "MA",
    submitUrl: "https://www.youtube.com/watch?v=example1",
    submittedAt: "2026-04-11T08:30:00", status: "graded",
    score: 9, feedback: "Phát âm rất chuẩn, giọng tự nhiên! Cố gắng nhìn vào camera nhiều hơn nha con.", gradedAt: "2026-04-12T10:00:00", gradedByName: "Ms. Thu Trang"
  },
  {
    id: "HWS002", homeworkId: "HW001", homeworkTitle: "Introduce yourself", homeworkType: "video_speaking",
    classScheduleId: "CS004", sessionTitle: "Hello! My name is...",
    studentId: "STU001", studentName: "Đăng Khoa Bing", studentAvatar: "DK",
    submitUrl: "https://drive.google.com/file/d/example2",
    submittedAt: "2026-04-11T14:20:00", status: "graded",
    score: 8, feedback: "Tốt lắm! Câu giới thiệu rõ ràng. Lần sau thêm thông tin về sở thích nha.", gradedAt: "2026-04-12T11:00:00", gradedByName: "Ms. Thu Trang"
  },
  {
    id: "HWS003", homeworkId: "HW003", homeworkTitle: "Talk about your family", homeworkType: "video_speaking",
    classScheduleId: "CS003", sessionTitle: "My family",
    studentId: "STU002", studentName: "Bảo Thư Mimi", studentAvatar: "BT",
    submitUrl: "https://www.youtube.com/watch?v=example3",
    submittedAt: "2026-04-16T09:00:00", status: "graded",
    score: 10, feedback: "Xuất sắc! Mimi giới thiệu gia đình rất rõ ràng và tự nhiên. Keep it up!", gradedAt: "2026-04-17T09:00:00", gradedByName: "Ms. Thu Trang"
  },
  {
    id: "HWS004", homeworkId: "HW003", homeworkTitle: "Talk about your family", homeworkType: "video_speaking",
    classScheduleId: "CS003", sessionTitle: "My family",
    studentId: "STU003", studentName: "Thành Vinh Brian", studentAvatar: "TV",
    submitUrl: "https://drive.google.com/file/d/example4",
    submittedAt: "2026-04-17T16:45:00", status: "submitted",
  },
  {
    id: "HWS005", homeworkId: "HW007", homeworkTitle: "Colors & shapes quiz", homeworkType: "quizizz",
    classScheduleId: "CS001", sessionTitle: "Colors & Shapes",
    studentId: "STU001", studentName: "Đăng Khoa Bing", studentAvatar: "DK",
    submitUrl: "https://quizizz.com/results/example5",
    submitText: "Score: 18/20",
    submittedAt: "2026-04-22T11:00:00", status: "submitted",
  },
  {
    id: "HWS006", homeworkId: "HW007", homeworkTitle: "Colors & shapes quiz", homeworkType: "quizizz",
    classScheduleId: "CS001", sessionTitle: "Colors & Shapes",
    studentId: "STU011", studentName: "Minh Anh Mina", studentAvatar: "MA",
    submitText: "Đã hoàn thành Quizizz - 100% correct!",
    submittedAt: "2026-04-22T12:00:00", status: "submitted",
  },
  {
    id: "HWS007", homeworkId: "HW008", homeworkTitle: "My colorful drawing", homeworkType: "writing",
    classScheduleId: "CS001", sessionTitle: "Colors & Shapes",
    studentId: "STU005", studentName: "Thiện Nhân Tom", studentAvatar: "TN",
    submitUrl: "https://drive.google.com/file/d/example7",
    submitText: "I have a red circle. I have a blue square. I have a green triangle. I have a yellow star. I have an orange heart.",
    submittedAt: "2026-04-22T13:30:00", status: "submitted",
  },
];
