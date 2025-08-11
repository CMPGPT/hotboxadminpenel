import Badge from "@/components/Badge";
import { Eye, MessageSquare, Check, X } from "lucide-react";

type ReportRow = {
  id: string;
  reporter: string;
  reportedUser: string;
  type: "Lounge" | "Inbox";
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Pending" | "Under Review" | "Resolved" | "Dismissed";
  date: string; // YYYY-MM-DD
};

export default function ReportsTable({ rows }: { rows: ReportRow[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-black dark:text-white">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Report ID</th>
              <th className="px-4 py-3 font-medium">Reporter</th>
              <th className="px-4 py-3 font-medium">Reported User</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-top border-black/5 dark:border-white/10 border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.id}</div>
                </td>
                <td className="px-4 py-3">{r.reporter}</td>
                <td className="px-4 py-3">{r.reportedUser}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.type === "Lounge" ? "orange" : "gray"}>{r.type}</Badge>
                </td>
                <td className="px-4 py-3">{r.category}</td>
                <td className="px-4 py-3">
                  {r.priority === "High" && <Badge variant="orange">High</Badge>}
                  {r.priority === "Medium" && <Badge variant="blue">Medium</Badge>}
                  {r.priority === "Low" && <Badge variant="gray">Low</Badge>}
                  {r.priority === "Critical" && <Badge variant="red">Critical</Badge>}
                </td>
                <td className="px-4 py-3">
                  {r.status === "Pending" && <Badge variant="orange">Pending</Badge>}
                  {r.status === "Under Review" && <Badge variant="blue">Under Review</Badge>}
                  {r.status === "Resolved" && <Badge variant="green">Resolved</Badge>}
                  {r.status === "Dismissed" && <Badge variant="gray">Dismissed</Badge>}
                </td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-black/70 dark:text-white/70">
                    <button aria-label="View" title="View" className="hover:text-[var(--primary)]">
                      <Eye size={18} />
                    </button>
                    <button aria-label="Comment" title="Comment" className="hover:text-[var(--primary)]">
                      <MessageSquare size={18} />
                    </button>
                    <button aria-label="Approve" title="Approve" className="hover:text-green-600">
                      <Check size={18} />
                    </button>
                    <button aria-label="Reject" title="Reject" className="hover:text-red-600">
                      <X size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


