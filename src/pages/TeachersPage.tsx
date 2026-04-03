import { useState } from "react";
import { teachers } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, BookOpen, MoreVertical, Mail, Phone } from "lucide-react";

const TeachersPage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = teachers.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || 
           t.specialty.toLowerCase().includes(search.toLowerCase()) ||
           t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý Giáo viên</h1>
        <button className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded-md font-medium hover:opacity-90 transition">
          + Thêm giáo viên
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã hoặc chuyên môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm text-muted-foreground hover:bg-secondary transition">
          <Filter className="w-4 h-4" /> Lọc
        </button>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b bg-secondary/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Giảng viên</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Chuyên môn</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Giờ dạy (Tháng)</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Số lớp</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Đánh giá</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y relative">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-secondary/20 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/teachers/${t.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-primary/5">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{t.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" /> {t.email}</span>
                          <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> {t.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="px-2 py-0.5 bg-secondary rounded text-[10px] font-medium border">{t.specialty}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-primary">{t.hoursThisMonth}h</span>
                      <div className="w-20 h-1 bg-secondary rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.min((t.hoursThisMonth / 60) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/5 text-primary rounded-full text-xs font-bold">
                      <BookOpen className="w-3 h-3" />
                      {t.totalClasses}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{t.avgRating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="p-1.5 hover:bg-secondary rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Search className="w-8 h-8 opacity-20 mb-2" />
                      <p className="italic text-sm">Không tìm thấy giáo viên tương ứng.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeachersPage;
