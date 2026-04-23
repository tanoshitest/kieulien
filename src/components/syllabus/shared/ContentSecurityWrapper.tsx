import React, { useEffect, useRef, useState } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
  /** Watermark text (thường là tên GV / role) */
  watermarkText?: string;
  /** Tắt hoàn toàn lớp bảo vệ (vd. khi admin debug) */
  disabled?: boolean;
}

/**
 * Bao bọc khu vực hiển thị nội dung syllabus với các lớp bảo vệ:
 * - user-select: none + chống chuột phải + chặn Ctrl+C/P/S/Shift+I + F12
 * - Watermark mờ xếp lưới (tên GV + ngày + MENGLISH)
 * - Blur khi tab mất focus (chống screenshot khi user chuyển sang app khác)
 * - Toast cảnh báo khi user cố copy/print
 */
const ContentSecurityWrapper: React.FC<Props> = ({ children, watermarkText = "MENGLISH", disabled = false }) => {
  const [blurred, setBlurred] = useState(false);
  const warnRef = useRef<number>(0);

  useEffect(() => {
    if (disabled) return;

    const warn = (msg: string) => {
      const now = Date.now();
      if (now - warnRef.current < 1500) return;
      warnRef.current = now;
      toast.warning(msg, { duration: 2500 });
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      // Chặn Ctrl+C / Ctrl+X / Ctrl+P / Ctrl+S / Ctrl+A
      if (ctrl && ["c", "x", "p", "s", "a"].includes(k)) {
        e.preventDefault();
        warn("Nội dung có bản quyền — không được copy/in/lưu");
        return;
      }
      // Chặn Ctrl+Shift+I / Ctrl+Shift+C / F12 (devtools)
      if ((ctrl && e.shiftKey && ["i", "c", "j"].includes(k)) || k === "f12") {
        e.preventDefault();
        warn("Truy cập DevTools không được phép trên trang này");
        return;
      }
      // PrintScreen
      if (k === "printscreen") {
        warn("Chụp màn hình không được phép — sự kiện đã ghi nhận");
        // Cố gắng xoá clipboard
        navigator.clipboard?.writeText("").catch(() => {});
      }
    };

    const onCtx = (e: MouseEvent) => {
      e.preventDefault();
      warn("Menu chuột phải đã bị tắt");
    };

    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "© MENGLISH — Nội dung có bản quyền");
      warn("Nội dung đã được bảo vệ — không thể copy");
    };

    const onVisibility = () => {
      // Khi user chuyển tab → blur nội dung để khó screenshot
      setBlurred(document.visibilityState !== "visible");
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [disabled]);

  if (disabled) return <>{children}</>;

  const today = new Date().toLocaleDateString("vi-VN");

  return (
    <div
      className="relative"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        // @ts-expect-error vendor prefix
        WebkitTouchCallout: "none",
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Watermark grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
        aria-hidden="true"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -30deg,
            transparent 0,
            transparent 220px,
            rgba(120,120,140,0.02) 220px,
            rgba(120,120,140,0.02) 280px
          )`,
        }}
      >
        <div
          className="absolute inset-0 grid grid-cols-3 gap-0"
          style={{ gridAutoRows: "180px" }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-[10px] font-semibold text-slate-400/30 select-none"
              style={{ transform: "rotate(-25deg)" }}
            >
              <div className="text-center leading-tight">
                <div>© MENGLISH</div>
                <div className="text-[9px]">{watermarkText}</div>
                <div className="text-[9px]">{today}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blur overlay khi tab mất focus */}
      {blurred && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center text-white px-6">
            <Shield className="w-14 h-14 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-bold mb-1">Nội dung tạm ẩn để bảo mật</p>
            <p className="text-sm text-slate-300">Quay lại tab này để tiếp tục xem</p>
          </div>
        </div>
      )}

      {/* Banner nhỏ */}
      <div className="mb-3 flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Nội dung có bản quyền MENGLISH. Không sao chép, chụp màn hình hay chia sẻ ra ngoài.</span>
      </div>

      {children}
    </div>
  );
};

export default ContentSecurityWrapper;
