export type WorkOrderStatus = "Open" | "In Progress" | "Done";
export type WorkOrderPriority = "Low" | "Medium" | "High";

export type WorkOrder = {
  id: string;
  title: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  dueDate?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export function uid() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isoNow() {
  return new Date().toISOString();
}
export type WorkOrderStatus = "Open" | "In Progress" | "Done";
export type Priority = "Low" | "Medium" | "High";

export type WorkOrder = {
  id: string;

  // App fields
  title: string;
  status: WorkOrderStatus;
  priority: Priority;
  notes?: string;

  // Spreadsheet fields
  wtId?: string;
  createdDate?: string | null;     // YYYY-MM-DD
  laborStartDate?: string | null;  // YYYY-MM-DD
  wtPriorityRaw?: string | null;

  facilityNumber?: string | null;
  taskName?: string | null;
  description?: string | null;
  resolutionDescription?: string | null;

  trackingStatus?: string | null;
  wtStatus?: string | null;
  customerName?: string | null;
  respOrg?: string | null;
  responsiblePerson?: string | null;

  createdAt: string;
  updatedAt: string;
};
