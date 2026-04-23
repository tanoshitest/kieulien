import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu, X, ChevronDown, MapPin, Phone, Mail, Clock, Users, GraduationCap, UserCog,
  BookOpen, Star, CheckCircle2, Award, Facebook, Send, Sparkles, Heart, Target,
  Rocket, Globe, Trophy, Calendar as CalendarIcon, ArrowRight, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import type { Role } from "@/data/mockData";

/* ────────── Data ────────── */

interface RoleEntry {
  id: Role;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  landing: string;
  color: string;
}

const ROLES: RoleEntry[] = [
  { id: "admin",   label: "Quản trị viên", desc: "Toàn quyền hệ thống",      Icon: ShieldCheck,  landing: "/dashboard",     color: "text-violet-600" },
  { id: "teacher", label: "Giảng viên",    desc: "Lớp học & chấm bài",       Icon: GraduationCap,landing: "/my-classes",    color: "text-blue-600"   },
  { id: "ta",      label: "Học vụ / TA",   desc: "Syllabus & lịch dạy",      Icon: UserCog,      landing: "/syllabus",      color: "text-amber-600"  },
  { id: "parent",  label: "Phụ huynh",     desc: "Theo dõi con học",         Icon: Users,        landing: "/parent-portal", color: "text-emerald-600"},
];

interface Course {
  id: string; name: string; track: string; age: string; schedule: string[];
  location: string; slots: number; color: string;
}

const COURSES: Course[] = [
  { id: "Kindy7",  name: "Kindy 7",  track: "Pre-Starters",       age: "6 - 7 tuổi · Học từ đầu",       schedule: ["Thứ 2 + Thứ 6", "18h00 - 19h30"], location: "55 Hoàng Hoa Thám", slots: 3, color: "from-emerald-500 to-green-600" },
  { id: "Cam31",   name: "Cam 31",   track: "Luyện đề Starters",  age: "7 - 8 tuổi · Nền cơ bản",        schedule: ["Thứ 3 + Thứ 6", "18h00 - 19h30"], location: "55 Hoàng Hoa Thám", slots: 1, color: "from-orange-500 to-amber-600" },
  { id: "Cam15",   name: "Cam 15",   track: "Luyện đề Starters",  age: "7 - 8 tuổi · Nền cơ bản & ngữ pháp", schedule: ["Thứ 3 + Thứ 5", "17h30 - 21h00"], location: "209 Đội Cấn",     slots: 4, color: "from-teal-500 to-emerald-600" },
  { id: "Cam21",   name: "Cam 21",   track: "Movers",             age: "7 - 11 tuổi · Đã có nền tảng",   schedule: ["Thứ 3 + Thứ 5", "17h30 - 21h00"], location: "209 Đội Cấn",     slots: 2, color: "from-green-600 to-emerald-700" },
  { id: "Kindy10", name: "Kindy 10", track: "Pre-Starters",       age: "4 - 6 tuổi · Học từ đầu",        schedule: ["Thứ 3: 19h30 - 21h00", "Thứ 7: 15h - 16h30"], location: "209 Đội Cấn", slots: 1, color: "from-yellow-500 to-orange-500" },
  { id: "Cam22",   name: "Cam 22",   track: "Starters",           age: "8 - 10 tuổi · Có nền & ngữ pháp", schedule: ["Thứ 3 + Thứ 6", "18h00 - 19h30"], location: "209 Đội Cấn",     slots: 5, color: "from-emerald-600 to-teal-700" },
];

const BRANCHES = [
  { name: "Cơ sở 1", addr: "15/172 Ngọc Hà, Ba Đình, Hà Nội" },
  { name: "Cơ sở 2", addr: "23/209 Đội Cấn, Ba Đình, Hà Nội" },
  { name: "Cơ sở 3", addr: "55 Hoàng Hoa Thám, Ba Đình, Hà Nội" },
];

const WHY_US = [
  { Icon: BookOpen,   title: "Giáo trình chuẩn Cambridge",   desc: "Lộ trình Cambridge YLE (Starters – Movers – Flyers), KET, PET, IELTS Junior bám sát khung quốc tế." },
  { Icon: Globe,      title: "Giáo viên bản ngữ + Việt Nam", desc: "GV bản ngữ (Anh – Mỹ – Úc) phối hợp trợ giảng Việt Nam giúp con vừa phát âm chuẩn, vừa hiểu ngữ pháp." },
  { Icon: Users,      title: "Sĩ số nhỏ 8-12 bé",            desc: "Lớp tối đa 12 học viên, mỗi bé đều được tương tác và kèm cặp riêng từng buổi." },
  { Icon: Target,     title: "Báo cáo học tập hàng tuần",    desc: "Phụ huynh nhận báo cáo chi tiết 4 kỹ năng + điểm danh + bài tập về nhà qua app." },
  { Icon: Trophy,     title: "Luyện thi tập trung",          desc: "Lộ trình tăng tốc trước kỳ thi Cambridge, cam kết đầu ra tối thiểu 11/15 shields." },
  { Icon: Rocket,     title: "Cơ sở vật chất hiện đại",      desc: "Phòng học trang bị máy chiếu, bảng tương tác, khu vực chơi an toàn cho bé." },
];

const TESTIMONIALS = [
  { name: "Chị Nguyễn Thu Hà",  kid: "Bé Đăng Khoa · Kindy 7", rating: 5, quote: "Con mình rất thích đi học tại MEducation. Cô giáo nhiệt tình, các hoạt động vui nên con không bị áp lực mà vẫn tiến bộ nhanh." },
  { name: "Anh Lê Hoàng Nam",   kid: "Bé Minh Anh · Cam 21",  rating: 5, quote: "Sau 6 tháng con đã lên level và đạt 13/15 shields Movers. Trung tâm có báo cáo chi tiết, mình theo dõi được con hàng tuần." },
  { name: "Chị Phạm Bích Ngọc", kid: "Bé Thành Vinh · Cam 15", rating: 5, quote: "Lớp ít người, cô quan tâm từng bé. Con tự tin nói tiếng Anh với người nước ngoài sau 1 năm học ở đây." },
];

const NEWS = [
  { id: "N1", tag: "Sự kiện",  title: "MEducation tổ chức Ngày hội tiếng Anh 2026",          date: "10/04/2026", excerpt: "Sân chơi tiếng Anh quy mô 200+ học viên 3 cơ sở với nhiều phần thưởng hấp dẫn...", img: "🎉" },
  { id: "N2", tag: "Học thuật",title: "Cập nhật cấu trúc đề Cambridge YLE 2026",              date: "02/04/2026", excerpt: "Những thay đổi quan trọng trong đề thi Starters – Movers – Flyers năm nay mà ph...", img: "📝" },
  { id: "N3", tag: "Khuyến mãi", title: "Ưu đãi 20% học phí cho học viên đăng ký trước 30/4", date: "28/03/2026", excerpt: "Chương trình ưu đãi đặc biệt cho 50 suất đầu tiên, kèm tặng voucher học bù linh hoạt...", img: "🎁" },
];

const FAQS = [
  { q: "Trung tâm nhận các độ tuổi nào?",         a: "MEducation nhận học viên từ 4 – 15 tuổi, chia thành các cấp độ Kindy (Pre-Starters), Starters, Movers, Flyers và luyện thi IELTS Junior. Mỗi bé được test đầu vào miễn phí để xếp lớp phù hợp." },
  { q: "Học phí các khoá như thế nào?",           a: "Học phí dao động 1.500.000 – 2.500.000 VND/khoá tùy cấp độ và thời lượng. Đăng ký sớm được ưu đãi 10-20%. Liên hệ hotline 0975.996.986 để được tư vấn chi tiết." },
  { q: "Có học thử miễn phí không?",              a: "Có, phụ huynh đăng ký cho bé học thử 1 buổi miễn phí tại bất kỳ cơ sở nào. Sau buổi học bạn được báo cáo đánh giá năng lực và lộ trình đề xuất." },
  { q: "Lịch học linh hoạt thế nào?",             a: "Mỗi tuần học 2 buổi, mỗi buổi 90 phút. Ca học đa dạng từ 17h30 – 21h các ngày trong tuần và cuối tuần. Nghỉ buổi nào được học bù buổi đó tại lớp khác cùng cấp độ." },
  { q: "Có dạy online không?",                     a: "Có, MEducation có chương trình online 1-kèm-1 hoặc 1-kèm-3 qua Zoom cho các bé ở xa hoặc không tiện di chuyển. Giáo trình & báo cáo tương tự lớp offline." },
  { q: "Cam kết đầu ra ra sao?",                   a: "Với các lớp luyện thi Cambridge, MEducation cam kết đầu ra tối thiểu 11/15 shields. Nếu chưa đạt, học viên được học bù miễn phí cho đến khi thi đạt." },
];

/* ────────── Login Dropdown ────────── */

const LoginDropdown: React.FC = () => {
  const { login } = useRole();
  const navigate = useNavigate();

  const handle = (r: RoleEntry) => {
    login(r.id);
    toast.success(`Chào mừng ${r.label}!`, { description: "Đang chuyển vào hệ thống..." });
    setTimeout(() => navigate(r.landing), 200);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1.5 border-brand-green/30 text-brand-green hover:bg-brand-green hover:text-white hover:border-brand-green transition-colors">
          Đăng nhập <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Chọn vai trò đăng nhập</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map(r => {
          const Icon = r.Icon;
          return (
            <DropdownMenuItem key={r.id} onClick={() => handle(r)} className="cursor-pointer gap-3 py-2.5">
              <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center ${r.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="text-[10px] text-muted-foreground">{r.desc}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* ────────── Navbar ────────── */

const NAV_LINKS = [
  { id: "hero",         label: "Trang chủ" },
  { id: "courses",      label: "Khoá học" },
  { id: "about",        label: "Về chúng tôi" },
  { id: "why",          label: "Vì sao chọn" },
  { id: "news",         label: "Tin tức" },
  { id: "faq",          label: "FAQ" },
  { id: "contact",      label: "Liên hệ" },
];

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-white/95 backdrop-blur shadow-sm border-b border-slate-200" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => go("hero")}>
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-brand-green p-1 shadow-sm">
            <img src="/logo_me.png" alt="MEducation" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-black text-brand-green">MEducation</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-brand-orange">We change · We lead</p>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {NAV_LINKS.map(l => (
            <button key={l.id} onClick={() => go(l.id)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-green transition-colors rounded-lg hover:bg-brand-green/5">
              {l.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button onClick={() => go("contact")}
            className="hidden sm:inline-flex bg-brand-orange hover:bg-brand-orange-dark text-white font-bold gap-1.5 shadow-md shadow-brand-orange/30">
            <Sparkles className="w-4 h-4" /> Đăng ký ngay
          </Button>
          <LoginDropdown />
          <button className="lg:hidden p-2 text-slate-700" onClick={() => setOpen(o => !o)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => go(l.id)}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-brand-green/10 rounded-lg">
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

/* ────────── Hero ────────── */

const Hero: React.FC = () => {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section id="hero" className="relative bg-white">
      {/* Banner image */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
          <img
            src="/660305638_1496505205818848_4103334412897090650_n.jpg"
            alt="MEducation tuyển sinh mùa hè — Cùng con bứt phá tiếng Anh"
            className="w-full h-auto block"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </motion.div>
      </div>

      {/* Sub-hero CTAs */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
        <div>
          <p className="text-brand-orange font-bold text-sm uppercase tracking-wider">
            Tuyển sinh mùa hè 2026 · 4 – 15 tuổi
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight text-slate-900">
            Cùng con bứt phá <span className="text-brand-green">tiếng Anh</span>
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-xl leading-relaxed">
            MEducation là trung tâm Anh ngữ tại Ba Đình — Hà Nội, đào tạo trẻ em theo chuẩn Cambridge.
            Giáo viên bản ngữ, sĩ số 8-12 bé, báo cáo học tập hàng tuần và cam kết đầu ra rõ ràng.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => go("contact")}
              className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold gap-2">
              Đăng ký tư vấn miễn phí
            </Button>
            <Button size="lg" variant="outline" onClick={() => go("courses")}
              className="border-brand-green/30 text-brand-green hover:bg-brand-green hover:text-white font-semibold gap-2">
              Xem các khoá học <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-6 max-w-md border-t border-slate-200 pt-6">
            {[
              { n: "500+", l: "Học viên" },
              { n: "20+",  l: "Giảng viên" },
              { n: "3",    l: "Cơ sở Ba Đình" },
            ].map(s => (
              <div key={s.l}>
                <p className="text-2xl font-bold text-brand-green">{s.n}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {[
            { Icon: ShieldCheck, title: "Xây nền tảng vững chắc",  desc: "Giáo trình Cambridge YLE từ Pre-Starters đến Flyers." },
            { Icon: Users,       title: "Giao tiếp tự tin",        desc: "Giáo viên bản ngữ kết hợp trợ giảng Việt Nam." },
            { Icon: Target,      title: "Sẵn sàng cho tương lai",  desc: "Luyện thi & lộ trình cá nhân hoá cho từng bé." },
          ].map(f => {
            const I = f.Icon;
            return (
              <div key={f.title} className="flex items-start gap-3 p-4 rounded-xl bg-brand-cream border border-brand-orange/20">
                <div className="w-10 h-10 rounded-lg bg-brand-green flex items-center justify-center flex-shrink-0">
                  <I className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{f.title}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ────────── About ────────── */

const About: React.FC = () => (
  <section
    id="about"
    className="relative py-16 md:py-24 bg-cover bg-center bg-fixed"
    style={{ backgroundImage: "url('/anh2.jpg')" }}
  >
    {/* Overlay mờ */}
    <div className="absolute inset-0 bg-slate-900/60" />
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/50 to-slate-900/70" />

    <div className="relative max-w-7xl mx-auto px-4 md:px-6">
      <div className="text-center mb-10">
        <p className="text-brand-orange-light font-semibold text-sm uppercase tracking-wider">Về chúng tôi</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-white drop-shadow">
          MEducation — <span className="text-brand-orange-light">We change, We lead</span>
        </h2>
      </div>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="rounded-2xl bg-brand-green/95 backdrop-blur-sm p-8 text-white shadow-xl border border-white/10">
            <Award className="w-10 h-10 text-brand-orange mb-4" />
            <h3 className="text-xl font-bold mb-2">8 năm đồng hành cùng các bé</h3>
            <p className="text-white/90 leading-relaxed">
              Từ những lớp học đầu tiên năm 2018, MEducation đã trở thành ngôi nhà thứ hai của hơn 500 học viên, với 3 cơ sở tại Ba Đình, Hà Nội.
            </p>
          </div>
        </div>
        <div>
          <p className="text-white/95 leading-relaxed drop-shadow-sm">
            MEducation là trung tâm Anh ngữ uy tín với đội ngũ giảng viên được tuyển chọn kỹ lưỡng, phương pháp giảng dạy tiên tiến và môi trường học tập thân thiện — nơi các bé được khơi dậy niềm đam mê tiếng Anh từ những ngày đầu.
          </p>
          <p className="mt-4 text-white/95 leading-relaxed drop-shadow-sm">
            Chúng tôi tin rằng học tiếng Anh không chỉ là kỹ năng, mà là hành trình khám phá thế giới. Mỗi giờ học tại MEducation là một trải nghiệm tương tác, vui vẻ và đầy cảm hứng.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              { Icon: Users,         n: "500+",  l: "Học viên theo học" },
              { Icon: GraduationCap, n: "20+",   l: "Giảng viên" },
              { Icon: Award,         n: "8 năm", l: "Kinh nghiệm" },
              { Icon: MapPin,        n: "3",     l: "Cơ sở Ba Đình" },
            ].map(s => {
              const I = s.Icon;
              return (
                <div key={s.l} className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-md">
                  <I className="w-5 h-5 text-brand-orange mb-2" />
                  <p className="text-xl font-bold text-brand-green">{s.n}</p>
                  <p className="text-xs text-slate-600">{s.l}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ────────── Courses ────────── */

const Courses: React.FC = () => (
  <section id="courses" className="py-16 md:py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="text-center mb-10">
        <p className="text-brand-orange font-semibold text-sm uppercase tracking-wider">Khoá học đang tuyển sinh</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
          Các lớp tại <span className="text-brand-green">MEducation</span>
        </h2>
        <p className="mt-3 text-slate-600 max-w-2xl mx-auto">6 khoá học đa cấp độ từ Pre-Starters đến Movers, phù hợp với mọi lứa tuổi 4 – 11.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {COURSES.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.04 }}
            className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-brand-green hover:shadow-md transition-all">
            <div className="bg-brand-green p-5 text-white relative">
              <div className="absolute top-3 right-3 bg-brand-orange px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Còn {c.slots} slot
              </div>
              <h3 className="text-xl font-bold">{c.name}</h3>
              <p className="text-sm opacity-90 mt-0.5">{c.track}</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-brand-green mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700"><span className="font-semibold">Đối tượng:</span> {c.age}</p>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-green mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-700">
                  <p className="font-semibold mb-0.5">Thời gian:</p>
                  {c.schedule.map((s, idx) => <p key={idx} className="text-slate-600">{s}</p>)}
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-green mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700"><span className="font-semibold">Địa điểm:</span> {c.location}</p>
              </div>
              <Button className="w-full mt-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold gap-1.5"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
                Đăng ký ngay <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ────────── Why Us ────────── */

const WhyUs: React.FC = () => (
  <section id="why" className="py-16 md:py-20 bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="text-center mb-10">
        <p className="text-brand-orange font-semibold text-sm uppercase tracking-wider">Điểm khác biệt</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
          Vì sao phụ huynh chọn <span className="text-brand-green">MEducation</span>?
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {WHY_US.map((w, i) => {
          const Icon = w.Icon;
          return (
            <motion.div key={w.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:border-brand-green transition-all">
              <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-brand-green" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 mb-1.5">{w.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{w.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ────────── Testimonials ────────── */

const Testimonials: React.FC = () => (
  <section id="testimonials" className="py-16 md:py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="text-center mb-10">
        <p className="text-brand-orange font-semibold text-sm uppercase tracking-wider">Phụ huynh nói gì?</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
          Cảm nhận từ <span className="text-brand-green">phụ huynh & học viên</span>
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.rating }).map((_, idx) => (
                <Star key={idx} className="w-4 h-4 text-brand-orange fill-brand-orange" />
              ))}
            </div>
            <p className="text-slate-700 leading-relaxed text-sm mb-5">"{t.quote}"</p>
            <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
              <div className="w-10 h-10 rounded-full bg-brand-green text-white font-semibold flex items-center justify-center">
                {t.name.split(" ").slice(-1)[0][0]}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.kid}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ────────── News ────────── */

const News: React.FC = () => (
  <section id="news" className="py-16 md:py-20 bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-brand-orange font-semibold text-sm uppercase tracking-wider">Tin tức & sự kiện</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
            Cập nhật từ <span className="text-brand-green">MEducation</span>
          </h2>
        </div>
        <Button variant="outline" className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white gap-1.5">
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {NEWS.map((n, i) => (
          <motion.article key={n.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-brand-green hover:shadow-md transition-all cursor-pointer">
            <div className="aspect-video bg-slate-100 flex items-center justify-center">
              <span className="text-5xl grayscale opacity-80">{n.img}</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block bg-brand-orange/10 text-brand-orange text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                  {n.tag}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {n.date}</span>
              </div>
              <h3 className="font-semibold text-base text-slate-900 leading-snug mb-2 line-clamp-2">{n.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2">{n.excerpt}</p>
              <button className="mt-3 text-sm font-semibold text-brand-green hover:text-brand-green-dark flex items-center gap-1">
                Đọc thêm <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

/* ────────── FAQ ────────── */

const FAQ: React.FC = () => (
  <section id="faq" className="py-16 md:py-20 bg-white">
    <div className="max-w-3xl mx-auto px-4 md:px-6">
      <div className="text-center mb-10">
        <p className="text-brand-orange font-semibold text-sm uppercase tracking-wider">Câu hỏi thường gặp</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
          Phụ huynh thường hỏi về <span className="text-brand-green">MEducation</span>
        </h2>
      </div>
      <Accordion type="single" collapsible className="space-y-2">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="bg-slate-50 rounded-lg border border-slate-200 px-5">
            <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline py-4">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-slate-700 leading-relaxed pb-4">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

/* ────────── Contact ────────── */

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: "", phone: "", course: "", note: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Vui lòng nhập họ tên và số điện thoại");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    toast.success("Đã nhận thông tin!", {
      description: `Cảm ơn ${form.name}, MEducation sẽ liên hệ qua ${form.phone} trong vòng 24h.`,
    });
    setForm({ name: "", phone: "", course: "", note: "" });
  };

  return (
    <section id="contact" className="py-16 md:py-20 bg-brand-green text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <p className="text-brand-orange-light font-semibold text-sm uppercase tracking-wider">Liên hệ</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">
            Đăng ký tư vấn miễn phí
          </h2>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">Để lại thông tin, đội ngũ MEducation sẽ liên hệ trong vòng 24 giờ.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Info */}
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-orange-light" /> Hệ thống cơ sở
              </h3>
              <div className="space-y-3">
                {BRANCHES.map(b => (
                  <div key={b.name} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-brand-orange-light" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{b.name}</p>
                      <p className="text-sm text-white/80">{b.addr}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-orange-light" /> Hotline tư vấn
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-brand-orange flex items-center justify-center text-white font-bold">
                  KL
                </div>
                <div>
                  <p className="font-semibold">Ms. Kiều Liên</p>
                  <a href="tel:0975996986" className="text-xl font-bold text-brand-orange-light hover:underline">0975.996.986</a>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> contact@meducation.vn</span>
                <span className="flex items-center gap-1.5"><Facebook className="w-4 h-4" /> /meducation.hn</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="bg-white rounded-xl p-6 text-slate-900 border border-slate-200">
            <h3 className="font-semibold text-lg mb-4 text-brand-green flex items-center gap-2">
              <Send className="w-5 h-5" /> Gửi thông tin đăng ký
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Họ tên phụ huynh *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Nguyễn Thu Hà" className="mt-1 border-slate-200" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Số điện thoại *</label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="VD: 0912 345 678" type="tel" className="mt-1 border-slate-200" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Khoá học quan tâm</label>
                <select value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm">
                  <option value="">-- Chọn khoá --</option>
                  {COURSES.map(c => <option key={c.id} value={c.id}>{c.name} — {c.track}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ghi chú thêm</label>
                <Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Độ tuổi con, trình độ hiện tại..." rows={3} className="mt-1 border-slate-200 resize-none" />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold gap-2 h-11">
                {loading ? "Đang gửi..." : <><Send className="w-4 h-4" /> Gửi đăng ký</>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

/* ────────── Footer ────────── */

const Footer: React.FC = () => (
  <footer className="bg-slate-900 text-white pt-12 pb-6 border-t-4 border-brand-orange">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-white p-1">
              <img src="/logo_me.png" alt="MEducation" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-brand-green-light">MEducation</p>
              <p className="text-[10px] text-brand-orange-light">We change · We lead</p>
            </div>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">Trung tâm Anh ngữ tại Ba Đình, Hà Nội — đào tạo trẻ em theo chuẩn Cambridge.</p>
        </div>
        <div>
          <p className="font-semibold text-sm uppercase tracking-wider mb-3 text-brand-orange-light">Khoá học</p>
          <ul className="space-y-2 text-sm text-white/70">
            {COURSES.slice(0, 5).map(c => <li key={c.id} className="hover:text-white cursor-pointer">{c.name} — {c.track}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sm uppercase tracking-wider mb-3 text-brand-orange-light">Liên kết</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="hover:text-white cursor-pointer">Về chúng tôi</li>
            <li className="hover:text-white cursor-pointer">Đội ngũ giảng viên</li>
            <li className="hover:text-white cursor-pointer">Tuyển dụng</li>
            <li className="hover:text-white cursor-pointer">Chính sách bảo mật</li>
            <li className="hover:text-white cursor-pointer">Điều khoản sử dụng</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sm uppercase tracking-wider mb-3 text-brand-orange-light">Liên hệ</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> 3 cơ sở tại Ba Đình, Hà Nội</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 0975.996.986</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@meducation.vn</li>
            <li className="flex items-center gap-2"><Facebook className="w-4 h-4" /> /meducation.hn</li>
          </ul>
        </div>
      </div>
      <div className="pt-6 border-t border-white/10 text-center text-xs text-white/50">
        © 2026 MEducation. All rights reserved. · We change · We lead
      </div>
    </div>
  </footer>
);

/* ────────── Main ────────── */

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />
      <Hero />
      <About />
      <Courses />
      <WhyUs />
      <Testimonials />
      <News />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;
