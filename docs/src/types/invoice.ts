export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerName: string;
  dateIssued: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  amount: number;
  lineItems?: LineItem[];
}

export interface CreateInvoiceData {
  customerName: string;
  dateIssued: string;
  dueDate: string;
  lineItems: LineItem[];
  status: 'paid' | 'pending' | 'overdue';
}