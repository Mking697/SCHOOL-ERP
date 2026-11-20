import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { PartyPopper } from "lucide-react";

export const instant = false;

export default async function PortalHolidaysPage() {
  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <PageHeader title="Holidays" description="School holiday calendar" />
      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Date</Th>
              <Th>Occasion</Th>
            </tr>
          </Thead>
          <tbody>
            {holidays.map((h) => {
              const isPast = new Date(h.date) < today;
              return (
                <Tr key={h.id} className={isPast ? "opacity-50" : ""}>
                  <Td>
                    <span className="flex items-center gap-1.5">
                      <PartyPopper className="w-3.5 h-3.5 text-amber-500" />
                      {new Date(h.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </Td>
                  <Td>
                    {h.title}
                    {h.description && <span className="block text-xs text-slate-400">{h.description}</span>}
                  </Td>
                </Tr>
              );
            })}
            {holidays.length === 0 && <EmptyRow colSpan={2}>Koi holiday abhi set nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
