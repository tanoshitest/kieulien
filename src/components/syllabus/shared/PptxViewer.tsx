import { useEffect, useRef, useState, useId } from "react";
import { Loader2, AlertTriangle, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface Props {
  url: string;
  title?: string;
}

// Local libs — download vào /public/libs/ tránh CDN bị chặn
const LIBS = [
  "/libs/jquery.min.js",
  "/libs/jszip.min.js",
  "/libs/jszip-utils.min.js",
  "/libs/filereader.js",
  "/libs/d3.min.js",
  "/libs/nv.d3.min.js",
  "/libs/divs2slides.min.js",
  "/libs/pptxjs.min.js",
];
const STYLES = ["/libs/pptxjs.css", "/libs/nv.d3.min.css"];

const loadedScripts = new Set<string>();
const loadedStyles = new Set<string>();

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loadedScripts.has(src)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => { loadedScripts.add(src); resolve(); };
    s.onerror = () => reject(new Error(`Không tải được: ${src}`));
    document.head.appendChild(s);
  });
}

async function ensurePptxjs() {
  STYLES.forEach(href => {
    if (loadedStyles.has(href)) return;
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = href;
    document.head.appendChild(l);
    loadedStyles.add(href);
  });
  for (const src of LIBS) await loadScript(src);
}

let pptxjsReady = false;

export default function PptxViewer({ url, title }: Props) {
  // pptxjs dùng ID string để inject slides — phải là unique DOM id
  const uid = useId().replace(/:/g, "");
  const containerId = `pptx-host-${uid}`;
  const statusRef = useRef<"loading" | "ready" | "error">("loading");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");
  const [slideCount, setSlideCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(1);
  const tickRef = useRef<ReturnType<typeof setInterval>>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  function setStatusBoth(s: "loading" | "ready" | "error") {
    statusRef.current = s;
    setStatus(s);
  }

  useEffect(() => {
    let cancelled = false;
    setStatusBoth("loading");
    setErrMsg("");
    setSlideCount(0);
    setCurrentSlide(1);

    // clear timers from previous run
    clearInterval(tickRef.current);
    clearTimeout(timeoutRef.current);

    (async () => {
      try {
        await ensurePptxjs();
        if (cancelled) return;

        const win = window as any;
        const $ = win.jQuery;
        if (!$ || !$.fn.pptxToHtml) throw new Error("pptxjs chưa nạp xong — thử reload trang");

        // Xoá nội dung cũ
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = "";

        // pptxjs cần selector dạng "#id" — KHÔNG truyền element trực tiếp
        $(`#${containerId}`).pptxToHtml({
          pptxFileUrl: url,
          slidesScale: "100%",
          slideMode: false,
          keyBoardShortCut: false,
          mediaProcess: false,
          themeProcess: true,
        });

        // Poll cho đến khi slides xuất hiện (class "slide" trong pptxjs)
        tickRef.current = setInterval(() => {
          if (cancelled) return clearInterval(tickRef.current);
          const host = document.getElementById(containerId);
          if (!host) return;
          const slides = host.querySelectorAll(".slide");
          if (slides.length > 0) {
            clearInterval(tickRef.current);
            clearTimeout(timeoutRef.current);
            setSlideCount(slides.length);
            setStatusBoth("ready");
          }
        }, 500);

        // Timeout 45s — pptx lớn cần thêm thời gian
        timeoutRef.current = setTimeout(() => {
          clearInterval(tickRef.current);
          if (!cancelled && statusRef.current === "loading") {
            setErrMsg("File quá lớn hoặc định dạng không hỗ trợ. Thử export sang MP4 từ PowerPoint.");
            setStatusBoth("error");
          }
        }, 45000);

      } catch (e: any) {
        if (!cancelled) {
          setErrMsg(e?.message ?? "Lỗi không xác định");
          setStatusBoth("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(tickRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [url, containerId]);

  const goSlide = (n: number) => {
    const host = document.getElementById(containerId);
    if (!host) return;
    const slides = host.querySelectorAll<HTMLElement>(".slide");
    if (!slides.length) return;
    const idx = Math.max(1, Math.min(slides.length, n));
    slides[idx - 1].scrollIntoView({ behavior: "smooth", block: "nearest" });
    setCurrentSlide(idx);
  };

  const handleFullscreen = () => {
    const el = document.getElementById(containerId)?.parentElement;
    if (!el) return;
    document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen?.();
  };

  return (
    <div className="rounded-lg ring-1 ring-border bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200 text-sm select-none">
        <div className="flex items-center gap-2 text-slate-700 min-w-0">
          <span className="font-medium truncate max-w-[260px]">{title ?? "Slides"}</span>
          {status === "loading" && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
            </span>
          )}
          {slideCount > 0 && (
            <span className="text-xs text-slate-500">Slide {currentSlide}/{slideCount}</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button disabled={status !== "ready" || currentSlide <= 1}
            onClick={() => goSlide(currentSlide - 1)}
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors" title="Slide trước">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button disabled={status !== "ready" || currentSlide >= slideCount}
            onClick={() => goSlide(currentSlide + 1)}
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors" title="Slide sau">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={handleFullscreen}
            className="p-1.5 rounded hover:bg-slate-200 transition-colors" title="Toàn màn hình">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="flex items-start gap-2 m-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Không trình chiếu được</p>
            <p>{errMsg}</p>
          </div>
        </div>
      )}

      {/* Slides container — pptxjs inject trực tiếp vào đây qua ID */}
      <div
        id={containerId}
        className="max-h-[70vh] overflow-y-auto bg-slate-50"
        onContextMenu={(e) => e.preventDefault()}
        onScroll={(e) => {
          const host = e.currentTarget;
          const slides = host.querySelectorAll<HTMLElement>(".slide");
          if (!slides.length) return;
          const top = host.getBoundingClientRect().top;
          let nearest = 1, minDist = Infinity;
          slides.forEach((s, i) => {
            const d = Math.abs(s.getBoundingClientRect().top - top);
            if (d < minDist) { minDist = d; nearest = i + 1; }
          });
          setCurrentSlide(nearest);
        }}
      />
    </div>
  );
}
