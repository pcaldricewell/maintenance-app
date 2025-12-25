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
