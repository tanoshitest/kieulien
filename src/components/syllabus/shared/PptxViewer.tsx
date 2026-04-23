import { useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface Props {
  url: string;
  title?: string;
}

// Local libs — đã download vào /public/libs/ để tránh CDN bị chặn
const CDN = {
  jquery: "/libs/jquery.min.js",
  jszip: "/libs/jszip.min.js",
  jszipUtils: "/libs/jszip-utils.min.js",
  filereader: "/libs/filereader.js",
  divs2slides: "/libs/divs2slides.min.js",
  pptxjsCss: "/libs/pptxjs.css",
  nvCss: "/libs/nv.d3.min.css",
  d3: "/libs/d3.min.js",
  nvd3: "/libs/nv.d3.min.js",
  pptxjs: "/libs/pptxjs.min.js",
};

const loadedScripts = new Set<string>();
const loadedStyles = new Set<string>();

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loadedScripts.has(src)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = false; // giữ thứ tự
    s.onload = () => { loadedScripts.add(src); resolve(); };
    s.onerror = () => reject(new Error(`Không tải được ${src}`));
    document.head.appendChild(s);
  });
}

function loadStyle(href: string) {
  if (loadedStyles.has(href)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
  loadedStyles.add(href);
}

async function ensurePptxjs() {
  loadStyle(CDN.pptxjsCss);
  loadStyle(CDN.nvCss);
  // tuần tự vì pptxjs phụ thuộc các thằng kia
  await loadScript(CDN.jquery);
  await loadScript(CDN.jszip);
  await loadScript(CDN.jszipUtils);
  await loadScript(CDN.filereader);
  await loadScript(CDN.d3);
  await loadScript(CDN.nvd3);
  await loadScript(CDN.divs2slides);
  await loadScript(CDN.pptxjs);
}

export default function PptxViewer({ url, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState<string>("");
  const [slideCount, setSlideCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrMsg("");

    (async () => {
      try {
        await ensurePptxjs();
        if (cancelled || !containerRef.current) return;
        // Reset
        containerRef.current.innerHTML = "";
        // @ts-ignore — jQuery + plugin pptxjs
        const $ = (window as any).jQuery;
        if (!$ || !$.fn.pptxToHtml) {
          throw new Error("pptxjs chưa nạp xong");
        }
        $(containerRef.current).pptxToHtml({
          pptxFileUrl: url,
          slidesScale: "75%",
          slideMode: false,
          keyBoardShortCut: true,
        });

        // Sau khi render, đếm slide (pptxjs render từng div .slide)
        const tick = setInterval(() => {
          if (cancelled || !containerRef.current) return clearInterval(tick);
          const slides = containerRef.current.querySelectorAll(".slide");
          if (slides.length > 0) {
            setSlideCount(slides.length);
            setStatus("ready");
            clearInterval(tick);
          }
        }, 400);
        // timeout sau 15s
        setTimeout(() => {
          clearInterval(tick);
          if (!cancelled && status === "loading") {
            setStatus("error");
            setErrMsg("Render quá lâu — file có thể quá lớn hoặc format không hỗ trợ");
          }
        }, 15000);
      } catch (e: any) {
        if (!cancelled) {
          setStatus("error");
          setErrMsg(e?.message ?? "Không tải được pptxjs");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const goSlide = (n: number) => {
    if (!containerRef.current) return;
    const slides = containerRef.current.querySelectorAll<HTMLElement>(".slide");
    if (slides.length === 0) return;
    const idx = Math.max(1, Math.min(slides.length, n));
    const el = slides[idx - 1];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setCurrentSlide(idx);
  };

  const handleFullscreen = () => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  return (
    <div className="rounded-lg ring-1 ring-border bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-border text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="font-medium truncate max-w-[260px]">{title ?? "Slides"}</span>
          {slideCount > 0 && (
            <span className="text-xs text-slate-500">
              Slide {currentSlide}/{slideCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={status !== "ready" || currentSlide <= 1}
            onClick={() => goSlide(currentSlide - 1)}
            className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
            title="Slide trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={status !== "ready" || currentSlide >= slideCount}
            onClick={() => goSlide(currentSlide + 1)}
            className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
            title="Slide sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-1 rounded hover:bg-slate-200"
            title="Toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative bg-slate-50">
        {status === "loading" && (
          <div className="flex items-center justify-center py-16 text-sm text-slate-500 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang nạp PPTXjs và parse file pptx...
          </div>
        )}
        {status === "error" && (
          <div className="flex items-start gap-2 m-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Không trình chiếu được</p>
              <p className="mt-0.5">{errMsg}</p>
              <p className="mt-1 text-rose-700">
                Gợi ý: dùng phương án MP4 (Export → Create a Video) cho an toàn nhất.
              </p>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="max-h-[70vh] overflow-y-auto p-4 pptx-host"
          onContextMenu={(e) => e.preventDefault()}
          onScroll={(e) => {
            // Update currentSlide khi scroll
            const slides = (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(".slide");
            if (!slides.length) return;
            const containerTop = (e.currentTarget as HTMLElement).getBoundingClientRect().top;
            let nearest = 1;
            let minDist = Infinity;
            slides.forEach((s, i) => {
              const d = Math.abs(s.getBoundingClientRect().top - containerTop);
              if (d < minDist) { minDist = d; nearest = i + 1; }
            });
            setCurrentSlide(nearest);
          }}
        />
      </div>
    </div>
  );
}
