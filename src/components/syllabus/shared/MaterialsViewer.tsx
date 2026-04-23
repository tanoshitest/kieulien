import { useState, useRef } from "react";
import { Link2, Maximize2, ShieldCheck, FileVideo, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PptxViewer from "@/components/syllabus/shared/PptxViewer";

interface Props {
  url?: string;
  title?: string;
  watermark?: string; // tên người đang xem (giáo viên/TA) — in chìm lên video
  compact?: boolean; // chế độ rút gọn: chỉ hiện nút "Xem tài liệu" mở dialog
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i;
const PPTX_EXT = /\.(pptx|ppt|pps|ppsx)(\?.*)?$/i;
const GSLIDES = /docs\.google\.com\/presentation/i;

function detectKind(url: string): "video" | "gslides" | "pptx" | "link" {
  if (VIDEO_EXT.test(url)) return "video";
  if (GSLIDES.test(url)) return "gslides";
  if (PPTX_EXT.test(url)) return "pptx";
  return "link";
}

function VideoPlayer({ url, title, watermark }: { url: string; title?: string; watermark?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [fs, setFs] = useState(false);

  const handleFullscreen = () => {
    const el = ref.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
    setFs(!fs);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden bg-black ring-1 ring-border">
      <video
        ref={ref}
        src={url}
        controls
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="w-full aspect-video select-none"
      >
        Trình duyệt không hỗ trợ video.
      </video>
      {/* Watermark — chỉ chìm, click xuyên qua */}
      {watermark && (
        <div className="absolute inset-0 pointer-events-none flex items-end justify-end p-3">
          <div className="bg-black/40 text-white/90 text-[10px] px-2 py-0.5 rounded">
            {watermark} • MEducation
          </div>
        </div>
      )}
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-2 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 text-white text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium">{title ?? "Tài liệu giảng dạy"}</span>
          <span className="text-white/60">• Bảo vệ bản quyền — không tải</span>
        </div>
        <button
          onClick={handleFullscreen}
          className="text-white/90 hover:text-white p-1 rounded hover:bg-white/10"
          title="Toàn màn hình"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function GSlidesPlayer({ url, title }: { url: string; title?: string }) {
  // Đảm bảo dùng /embed thay vì /edit
  const embedUrl = url.replace(/\/edit.*$/i, "/embed?start=false&loop=false&delayms=3000&rm=minimal");
  return (
    <div className="relative rounded-lg overflow-hidden ring-1 ring-border bg-black">
      <iframe
        src={embedUrl}
        title={title ?? "Slides"}
        className="w-full aspect-video"
        allowFullScreen
      />
    </div>
  );
}

function ExternalLinkBlock({ url, title }: { url: string; title?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-sm text-primary"
    >
      <Link2 className="w-4 h-4" />
      <span className="truncate max-w-[420px]">{title ?? url}</span>
      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
    </a>
  );
}

function PptxNotice({ url }: { url: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1.5">
      <div className="font-semibold flex items-center gap-1.5">
        <FileVideo className="w-4 h-4" /> File PowerPoint chưa convert
      </div>
      <p className="leading-relaxed">
        Browser không trình chiếu trực tiếp <code className="px-1 bg-amber-100 rounded">.pptx</code>. Hãy convert sang MP4 (PowerPoint → File → Export → Create a Video → 1080p), upload thay thế để bật chế độ xem có animation.
      </p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-700 hover:underline">
        <Link2 className="w-3 h-3" /> Tải file gốc (chỉ admin)
      </a>
    </div>
  );
}

export default function MaterialsViewer({ url, title, watermark, compact }: Props) {
  const [open, setOpen] = useState(false);
  if (!url) return null;
  const kind = detectKind(url);

  const inner = (() => {
    if (kind === "video") return <VideoPlayer url={url} title={title} watermark={watermark} />;
    if (kind === "gslides") return <GSlidesPlayer url={url} title={title} />;
    if (kind === "pptx") return <PptxViewer url={url} title={title} />;
    return <ExternalLinkBlock url={url} title={title} />;
  })();

  if (!compact) return inner;

  // Compact: nút mở dialog
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <FileVideo className="w-3.5 h-3.5" />
        Xem tài liệu
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-primary" />
              {title ?? "Tài liệu giảng dạy"}
              <button onClick={() => setOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          {inner}
        </DialogContent>
      </Dialog>
    </>
  );
}
