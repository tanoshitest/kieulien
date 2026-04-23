import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  AlertTriangle,
  Maximize2,
  RefreshCw,
  Monitor,
  FileText,
  ShieldAlert,
} from "lucide-react";

interface Props {
  url: string;
  title?: string;
}

// Viewer engines — thứ tự ưu tiên
type Engine = "office" | "google" | "pptxjs";

function buildOfficeUrl(fileUrl: string) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}

function buildGoogleUrl(fileUrl: string) {
  return `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
}

const ENGINE_LABELS: Record<Engine, string> = {
  office: "Office Online",
  google: "Google Docs Viewer",
  pptxjs: "PptxJS (local)",
};

// ─── pptxjs local fallback (giữ nguyên logic cũ) ──────────────────────────────
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
// ──────────────────────────────────────────────────────────────────────────────

export default function PptxViewer({ url, title }: Props) {
  // Mặc định "pptxjs" (Local) vì Office/Google iframe cross-origin
  // không chặn được save ảnh. Local thì control DOM được hoàn toàn.
  const [engine, setEngine] = useState<Engine>("pptxjs");
  const [iframeStatus, setIframeStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pptxStatus, setPptxStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [slideCount, setSlideCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [iframeKey, setIframeKey] = useState(0);
  const pptxContainerRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval>>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const iframeUrl =
    engine === "office" ? buildOfficeUrl(url) : buildGoogleUrl(url);

  const switchEngine = (e: Engine) => {
    setEngine(e);
    setIframeStatus("loading");
    setIframeKey(k => k + 1);
    if (e === "pptxjs") startPptxjs();
  };

  const reloadIframe = () => {
    setIframeStatus("loading");
    setIframeKey(k => k + 1);
  };

  // ── pptxjs fallback ──────────────────────────────────────────────────────
  const startPptxjs = () => {
    clearInterval(tickRef.current);
    clearTimeout(timeoutRef.current);
    setPptxStatus("loading");
    setSlideCount(0);
    setCurrentSlide(1);

    (async () => {
      try {
        await ensurePptxjs();
        const win = window as any;
        const $ = win.jQuery;
        if (!$ || !$.fn.pptxToHtml) throw new Error("pptxjs chưa nạp xong");

        const el = pptxContainerRef.current;
        if (!el) return;
        el.innerHTML = "";

        // pptxjs cần ID string
        const id = el.id;
        $(`#${id}`).pptxToHtml({
          pptxFileUrl: url,
          slidesScale: "100%",
          slideMode: false,
          keyBoardShortCut: false,
          mediaProcess: false,
          themeProcess: true,
        });

        tickRef.current = setInterval(() => {
          const slides = el.querySelectorAll(".slide");
          if (slides.length > 0) {
            clearInterval(tickRef.current);
            clearTimeout(timeoutRef.current);
            setSlideCount(slides.length);
            setPptxStatus("ready");
          }
        }, 500);

        timeoutRef.current = setTimeout(() => {
          clearInterval(tickRef.current);
          setPptxStatus("error");
        }, 60000);
      } catch {
        setPptxStatus("error");
      }
    })();
  };

  const goSlide = (n: number) => {
    const el = pptxContainerRef.current;
    if (!el) return;
    const slides = el.querySelectorAll<HTMLElement>(".slide");
    if (!slides.length) return;
    const idx = Math.max(1, Math.min(slides.length, n));
    slides[idx - 1].scrollIntoView({ behavior: "smooth", block: "nearest" });
    setCurrentSlide(idx);
  };

  const handleFullscreen = () => {
    const wrap = document.getElementById("pptx-viewer-wrap");
    if (!wrap) return;
    document.fullscreenElement ? document.exitFullscreen() : wrap.requestFullscreen?.();
  };

  // Auto-start pptxjs khi mount/đổi url (mặc định engine = pptxjs)
  useEffect(() => {
    if (engine === "pptxjs" && pptxStatus === "idle") {
      startPptxjs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, url]);

  // Sau khi pptxjs render xong, hardening: chặn drag/right-click trên img + overlay chống lưu
  useEffect(() => {
    if (pptxStatus !== "ready") return;
    const host = pptxContainerRef.current;
    if (!host) return;

    // Disable drag/select/right-click trên TẤT CẢ img + svg trong slides
    const harden = () => {
      host.querySelectorAll<HTMLElement>("img, svg, image").forEach(el => {
        el.setAttribute("draggable", "false");
        el.style.userSelect = "none";
        el.style.webkitUserSelect = "none";
        (el.style as any).webkitUserDrag = "none";
        (el.style as any).webkitTouchCallout = "none";
        el.style.pointerEvents = "none"; // CHẶN HOÀN TOÀN click vào ảnh
        el.addEventListener("dragstart", e => e.preventDefault());
        el.addEventListener("contextmenu", e => e.preventDefault());
      });
      // Slide container vẫn có pointer-events để scroll
      host.querySelectorAll<HTMLElement>(".slide").forEach(s => {
        s.style.userSelect = "none";
        s.addEventListener("dragstart", e => e.preventDefault());
      });
    };
    harden();

    // Quan sát DOM nếu pptxjs render bất đồng bộ
    const observer = new MutationObserver(harden);
    observer.observe(host, { childList: true, subtree: true });

    // Bắt key tắt: Ctrl/Cmd+S, Ctrl/Cmd+Shift+S, PrintScreen
    const blockKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
      }
      if (e.key === "PrintScreen") {
        // Không chặn được PrintScreen 100% nhưng có thể warn
        navigator.clipboard?.writeText?.("").catch(() => {});
      }
    };
    document.addEventListener("keydown", blockKey);

    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", blockKey);
    };
  }, [pptxStatus, slideCount]);

  const isPptx = engine === "pptxjs";

  return (
    <div id="pptx-viewer-wrap" className="rounded-lg ring-1 ring-border bg-white overflow-hidden flex flex-col">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200 text-sm select-none gap-2">
        {/* Left: title + loading badge */}
        <div className="flex items-center gap-2 text-slate-700 min-w-0">
          <Monitor className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="font-medium truncate max-w-[200px]">{title ?? "Slides"}</span>
          {iframeStatus === "loading" && !isPptx && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
            </span>
          )}
          {isPptx && pptxStatus === "loading" && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Đang render...
            </span>
          )}
          {isPptx && slideCount > 0 && (
            <span className="text-xs text-slate-500">Slide {currentSlide}/{slideCount}</span>
          )}
        </div>

        {/* Right: engine switcher + actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Engine tabs */}
          {(["office", "google", "pptxjs"] as Engine[]).map(e => (
            <button
              key={e}
              onClick={() => switchEngine(e)}
              title={ENGINE_LABELS[e]}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                engine === e
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              {e === "office" ? "Office" : e === "google" ? "Google" : "Local"}
            </button>
          ))}

          {/* Reload */}
          {!isPptx && (
            <button
              onClick={reloadIframe}
              className="p-1.5 rounded hover:bg-slate-200 transition-colors"
              title="Tải lại"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded hover:bg-slate-200 transition-colors"
            title="Toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Content area ────────────────────────────────────────── */}

      {/* Office Online / Google Docs iframe */}
      {!isPptx && (
        <div className="relative" style={{ height: "70vh" }}>
          {/* Cảnh báo bảo mật */}
          <div className="absolute top-2 right-2 z-20 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded text-[11px] flex items-center gap-1.5 shadow-sm">
            <ShieldAlert className="w-3 h-3" />
            Viewer ngoài — không kiểm soát save ảnh. Khuyên dùng "Local".
          </div>
          {iframeStatus === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-slate-500">
                Đang kết nối {ENGINE_LABELS[engine]}...
              </p>
              <p className="text-xs text-slate-400 max-w-xs text-center">
                File cần được host công khai (public URL). Nếu mãi không hiện hãy thử đổi viewer khác.
              </p>
            </div>
          )}

          {iframeStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-rose-50 z-10 p-6">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
              <p className="text-sm font-semibold text-rose-700">Không tải được từ {ENGINE_LABELS[engine]}</p>
              <p className="text-xs text-rose-600 text-center max-w-xs">
                File có thể không public hoặc viewer bị chặn. Thử đổi sang viewer khác.
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={reloadIframe}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-rose-200 text-rose-700 text-xs hover:bg-rose-50"
                >
                  <RefreshCw className="w-3 h-3" /> Thử lại
                </button>
                <button
                  onClick={() => switchEngine(engine === "office" ? "google" : "office")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600 text-white text-xs hover:bg-rose-700"
                >
                  <Monitor className="w-3 h-3" /> Đổi viewer
                </button>
              </div>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={iframeUrl}
            title={title ?? "Slides"}
            className="w-full h-full border-0"
            allowFullScreen
            onLoad={() => setIframeStatus("ready")}
            onError={() => setIframeStatus("error")}
          />
        </div>
      )}

      {/* PptxJS local renderer */}
      {isPptx && (
        <>
          {pptxStatus === "loading" && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 bg-slate-50">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-slate-500">Đang render slide cục bộ...</p>
              <p className="text-xs text-slate-400">Lần đầu nạp thư viện ~3s, các lần sau nhanh hơn.</p>
            </div>
          )}
          {pptxStatus === "error" && (
            <div className="flex items-start gap-2 m-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-0.5">Không render được (Local)</p>
                <p>File quá lớn hoặc định dạng phức tạp. Hãy thử viewer Office hoặc Google ở trên (lưu ý: viewer ngoài không chặn được save ảnh).</p>
                <button onClick={startPptxjs} className="mt-2 px-2 py-1 rounded bg-rose-600 text-white text-[11px] hover:bg-rose-700">
                  Thử lại
                </button>
              </div>
            </div>
          )}
          <div className="relative">
            {/* Watermark chìm chống screenshot */}
            {pptxStatus === "ready" && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-slate-400/10 text-6xl font-bold rotate-[-30deg] whitespace-nowrap">
                    MEducation • Bản quyền
                  </div>
                </div>
              </div>
            )}
            <div
              ref={pptxContainerRef}
              id="pptx-local-host"
              className="max-h-[70vh] overflow-y-auto bg-slate-50 select-none"
              onContextMenu={e => e.preventDefault()}
              onDragStart={e => e.preventDefault()}
              onCopy={e => e.preventDefault()}
              onScroll={e => {
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
        </>
      )}
    </div>
  );
}
