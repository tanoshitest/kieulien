import { tickets, type Ticket } from "@/data/mockData";

type Stage = Ticket["stage"];

const stageConfig: Record<Stage, { label: string; color: string }> = {
  new: { label: "Mới tạo", color: "bg-kanban-new" },
  processing: { label: "Đang xử lý", color: "bg-kanban-progress" },
  closed: { label: "Đã đóng", color: "bg-kanban-closed" },
};

const priorityBadge = (p: Ticket["priority"]) => {
  const map = { low: "bg-muted text-muted-foreground", medium: "bg-warning/10 text-warning", high: "bg-destructive/10 text-destructive" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[p]}`}>{p}</span>;
};

const stages: Stage[] = ["new", "processing", "closed"];

const TicketsPage = () => (
  <div className="p-4 md:p-6 space-y-4">
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold">Chăm sóc Khách hàng</h1>
      <button className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded-md font-medium hover:opacity-90 transition">
        + Tạo ticket
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stages.map((stage) => {
        const items = tickets.filter((t) => t.stage === stage);
        const cfg = stageConfig[stage];
        return (
          <div key={stage} className="rounded-lg border">
            <div className={`px-3 py-2 rounded-t-lg ${cfg.color} flex items-center justify-between`}>
              <span className="font-medium text-sm">{cfg.label}</span>
              <span className="text-xs bg-card rounded-full px-2 py-0.5 font-medium">{items.length}</span>
            </div>
            <div className="p-2 space-y-2">
              {items.map((t) => (
                <div key={t.id} className="kanban-card">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">{t.title}</p>
                    {priorityBadge(t.priority)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.from}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{t.category}</span>
                    <span>{t.createdDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default TicketsPage;
