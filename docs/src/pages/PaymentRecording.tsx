import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Upload,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Helper utilities
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Types
type PaymentStatus = 'Received' | 'Pending' | 'Failed';
type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Card';

interface Payment {
  id: string;
  invoiceId: string;
  customerName: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  reference?: string;
  notes?: string;
  receiptUrl?: string;
}

// Mock data
const initialPayments: Payment[] = [
  {
    id: 'PAY-001',
    invoiceId: 'INV-1001',
    customerName: 'Acme Manufacturing',
    paymentDate: '2025-10-05',
    paymentMethod: 'Bank Transfer',
    status: 'Received',
    amount: 15000,
    reference: 'TXN-87234',
  },
  {
    id: 'PAY-002',
    invoiceId: 'INV-1002',
    customerName: 'Global Industries',
    paymentDate: '2025-10-06',
    paymentMethod: 'Card',
    status: 'Received',
    amount: 8500,
    reference: 'TXN-87235',
  },
  {
    id: 'PAY-003',
    invoiceId: 'INV-1003',
    customerName: 'Tech Solutions Inc',
    paymentDate: '2025-10-07',
    paymentMethod: 'Mobile Money',
    status: 'Pending',
    amount: 12000,
    reference: 'TXN-87236',
  },
  {
    id: 'PAY-004',
    invoiceId: 'INV-1004',
    customerName: 'Metro Parts Co',
    paymentDate: '2025-10-08',
    paymentMethod: 'Cash',
    status: 'Received',
    amount: 5200,
  },
  {
    id: 'PAY-005',
    invoiceId: 'INV-1005',
    customerName: 'Industrial Supplies Ltd',
    paymentDate: '2025-10-08',
    paymentMethod: 'Bank Transfer',
    status: 'Failed',
    amount: 22000,
    reference: 'TXN-87237',
  },
];

const PaymentRecording = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Payment>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate summaries
  const totalPayments = payments.length;
  const paymentsToday = payments.filter(
    p => p.paymentDate === new Date().toISOString().split('T')[0]
  ).length;
  const totalAmountReceived = payments
    .filter(p => p.status === 'Received')
    .reduce((sum, p) => sum + p.amount, 0);
  const outstandingAmount = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  // Replace the filter and search logic useEffect with API data loading
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPayments(data);
          setFilteredPayments(data);
        } else {
          toast.error('Failed to load payments');
        }
      } catch (error) {
        toast.error('Failed to fetch payments');
      }
    };

    fetchPayments();
  }, []);

  // Keep the existing filter and search logic in a separate useEffect
  useEffect(() => {
    let result = payments;

    // Apply search
    if (searchTerm) {
      result = result.filter(p =>
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Apply method filter
    if (methodFilter !== 'all') {
      result = result.filter(p => p.paymentMethod === methodFilter);
    }

    setFilteredPayments(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, methodFilter, payments]);

  // Debounced search handler
  const handleSearchChange = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // CRUD operations
const handleCreatePayment = async () => {
  if (!formData.invoiceId || !formData.customerName || !formData.amount || !formData.paymentDate || !formData.paymentMethod) {
    toast.error('Please fill in all required fields');
    return;
  }

  try {
    // Prepare payload for payment creation
    const paymentPayload = {
      invoice_id: formData.invoiceId.replace('INV-', ''), // backend expects integer
      amount: formData.amount,
      payment_method: formData.paymentMethod,
      status: formData.status || 'Pending',
      reference: formData.reference,
      notes: formData.notes,
      // Add other fields as needed
    };

    // Create payment first
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(paymentPayload),
    });

    if (response.ok) {
      const newPayment = await response.json();

      // If receipt file exists, upload it
      if (receiptFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', receiptFile);
        formDataToSend.append('payment_id', newPayment.id);

        await fetch('/api/payments/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataToSend,
        });
      }

      // Refresh payments list
      const paymentsRes = await fetch('/api/payments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (paymentsRes.ok) {
        const updatedPayments = await paymentsRes.json();
        setPayments(updatedPayments);
      }

      setIsCreateModalOpen(false);
      setFormData({});
      setReceiptFile(null);
      toast.success('Payment recorded successfully');
    } else {
      toast.error('Failed to create payment');
    }
  } catch (error) {
    toast.error('Network error occurred');
  }
};

  const handleEditPayment = () => {
    if (!currentPayment) return;

    const updatedPayments = payments.map(p =>
      p.id === currentPayment.id
        ? {
            ...p,
            ...formData,
            receiptUrl: receiptFile ? URL.createObjectURL(receiptFile) : p.receiptUrl,
          }
        : p
    );

    setPayments(updatedPayments);
    setIsEditModalOpen(false);
    setCurrentPayment(null);
    setFormData({});
    setReceiptFile(null);
    toast.success('Payment updated successfully');
  };

  const handleDeletePayment = () => {
    if (!currentPayment) return;
    
    setPayments(payments.filter(p => p.id !== currentPayment.id));
    setIsDeleteDialogOpen(false);
    setCurrentPayment(null);
    toast.success('Payment deleted successfully');
  };

  const handleViewPayment = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (payment: Payment) => {
    setCurrentPayment(payment);
    setFormData(payment);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Payment ID', 'Invoice ID', 'Customer', 'Date', 'Method', 'Status', 'Amount'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.invoiceId,
      p.customerName,
      p.paymentDate,
      p.paymentMethod,
      p.status,
      p.amount,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('CSV exported successfully');
  };

  const handleBulkReconcile = () => {
    if (selectedPayments.length === 0) {
      toast.error('No payments selected');
      return;
    }

    const updatedPayments = payments.map(p =>
      selectedPayments.includes(p.id) ? { ...p, status: 'Received' as PaymentStatus } : p
    );

    setPayments(updatedPayments);
    setSelectedPayments([]);
    toast.success(`${selectedPayments.length} payments reconciled`);
  };

  const getStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'Received':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'Received':
        return 'bg-success text-success-foreground';
      case 'Pending':
        return 'bg-warning text-warning-foreground';
      case 'Failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Payment Recording</h1>
        <p className="text-muted-foreground">Log received payments and reconcile invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payments Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paymentsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Recorded today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{formatCurrency(totalAmountReceived)}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{formatCurrency(outstandingAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Payment ID, Invoice ID, or Customer..."
                  className="pl-10"
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>

              <Button
                variant="secondary"
                onClick={handleBulkReconcile}
                disabled={selectedPayments.length === 0}
                className="gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Bulk Reconcile
              </Button>

              <Button
                onClick={() => {
                  setFormData({});
                  setReceiptFile(null);
                  setIsCreateModalOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Record Payment
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Table */}
          <div className="rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selectedPayments.length === currentItems.length && currentItems.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayments(currentItems.map(p => p.id));
                        } else {
                          setSelectedPayments([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPayments([...selectedPayments, payment.id]);
                            } else {
                              setSelectedPayments(selectedPayments.filter(id => id !== payment.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>
                        <button className="text-primary hover:underline">
                          {payment.invoiceId}
                        </button>
                      </TableCell>
                      <TableCell>{payment.customerName}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {payment.receiptUrl && (
                          <button className="text-primary hover:text-primary/80">
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPayment(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(payment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(payment)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPayments.length)} of {filteredPayments.length} payments
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Payment Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
            <DialogDescription>
              Enter payment details to record a new transaction
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceId">Invoice ID *</Label>
                <Input
                  id="invoiceId"
                  placeholder="INV-1001"
                  value={formData.invoiceId || ''}
                  onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Company Name"
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate || ''}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as PaymentStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference/Transaction ID</Label>
              <Input
                id="reference"
                placeholder="TXN-12345"
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full min-h-[80px] rounded-2xl border border-input bg-background px-3 py-2 text-sm"
                placeholder="Additional notes..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Upload Receipt (Max 5MB)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 5 * 1024 * 1024) {
                      setReceiptFile(file);
                    } else {
                      toast.error('File size must be less than 5MB');
                    }
                  }}
                  className="cursor-pointer"
                />
                {receiptFile && (
                  <span className="text-sm text-muted-foreground">{receiptFile.name}</span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePayment}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Payment Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          
          {currentPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Payment ID</Label>
                  <p className="font-semibold">{currentPayment.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Invoice ID</Label>
                  <p className="font-semibold">{currentPayment.invoiceId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <p className="font-semibold">{currentPayment.customerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Date</Label>
                  <p className="font-semibold">{formatDate(currentPayment.paymentDate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="font-semibold">{currentPayment.paymentMethod}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(currentPayment.status)}>
                    {currentPayment.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(currentPayment.amount)}</p>
                </div>
                {currentPayment.reference && (
                  <div>
                    <Label className="text-muted-foreground">Reference</Label>
                    <p className="font-semibold">{currentPayment.reference}</p>
                  </div>
                )}
              </div>
              
              {currentPayment.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1">{currentPayment.notes}</p>
                </div>
              )}

              {currentPayment.receiptUrl && (
                <div>
                  <Label className="text-muted-foreground">Receipt</Label>
                  <div className="mt-2 border rounded-2xl p-4">
                    <img 
                      src={currentPayment.receiptUrl} 
                      alt="Receipt" 
                      className="max-h-64 mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Update payment information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-invoiceId">Invoice ID *</Label>
                <Input
                  id="edit-invoiceId"
                  value={formData.invoiceId || ''}
                  onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-customerName">Customer Name *</Label>
                <Input
                  id="edit-customerName"
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-paymentDate">Payment Date *</Label>
                <Input
                  id="edit-paymentDate"
                  type="date"
                  value={formData.paymentDate || ''}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as PaymentStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-reference">Reference/Transaction ID</Label>
              <Input
                id="edit-reference"
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <textarea
                id="edit-notes"
                className="w-full min-h-[80px] rounded-2xl border border-input bg-background px-3 py-2 text-sm"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-receipt">Update Receipt (Max 5MB)</Label>
              <Input
                id="edit-receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size <= 5 * 1024 * 1024) {
                    setReceiptFile(file);
                  } else {
                    toast.error('File size must be less than 5MB');
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPayment}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentPayment && (
            <div className="bg-muted p-4 rounded-2xl">
              <p className="font-semibold">{currentPayment.id}</p>
              <p className="text-sm text-muted-foreground">{currentPayment.customerName}</p>
              <p className="text-sm font-bold text-primary mt-2">{formatCurrency(currentPayment.amount)}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePayment}>
              Delete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentRecording;

/*
INTEGRATION INSTRUCTIONS:

To swap mock data for real API calls, replace these areas:

1. Initial data load (useEffect on component mount):
   useEffect(() => {
     fetch('/api/payments')
       .then(res => res.json())
       .then(data => setPayments(data));
   }, []);

2. Create payment (handleCreatePayment function):
   fetch('/api/payments', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(newPayment)
   }).then(res => res.json()).then(data => {
     setPayments([data, ...payments]);
   });

3. Update payment (handleEditPayment function):
   fetch(`/api/payments/${currentPayment.id}`, {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(formData)
   }).then(res => res.json()).then(data => {
     // Update local state
   });

4. Delete payment (handleDeletePayment function):
   fetch(`/api/payments/${currentPayment.id}`, {
     method: 'DELETE'
   }).then(() => {
     setPayments(payments.filter(p => p.id !== currentPayment.id));
   });

5. File uploads: Use FormData to send files to your backend endpoint.
*/
