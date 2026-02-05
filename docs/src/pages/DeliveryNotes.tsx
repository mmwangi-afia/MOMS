import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Eye, Pencil, Printer, Trash2 } from "lucide-react";

type DeliveryStatus = "Delivered" | "In Transit" | "Pending" | "Returned";

interface LineItem {
  id: string;
  product: string;
  quantity: number;
  uom: string;
}

interface DeliveryNote {
  id: string;
  customerName: string;
  salesOrderId: string;
  deliveryDate: string;
  status: DeliveryStatus;
  driver: string;
  address: string;
  lineItems: LineItem[];
  notes?: string;
}

const DeliveryNotes = () => {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([
    {
      id: "DN-001",
      customerName: "ABC Manufacturing Ltd",
      salesOrderId: "SO-2024-001",
      deliveryDate: "2024-10-20",
      status: "Delivered",
      driver: "John Doe",
      address: "123 Industrial Ave, City",
      lineItems: [{ id: "1", product: "Steel Rods", quantity: 100, uom: "pcs" }],
    },
    {
      id: "DN-002",
      customerName: "XYZ Enterprises",
      salesOrderId: "SO-2024-002",
      deliveryDate: "2024-10-22",
      status: "In Transit",
      driver: "Jane Smith",
      address: "456 Factory Road, Town",
      lineItems: [{ id: "1", product: "Aluminum Sheets", quantity: 50, uom: "sheets" }],
    },
    {
      id: "DN-003",
      customerName: "Tech Solutions Inc",
      salesOrderId: "SO-2024-003",
      deliveryDate: "2024-10-25",
      status: "Pending",
      driver: "Mike Johnson",
      address: "789 Business Park, Metro",
      lineItems: [{ id: "1", product: "Circuit Boards", quantity: 200, uom: "pcs" }],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [newNote, setNewNote] = useState<Partial<DeliveryNote>>({
    customerName: "",
    salesOrderId: "",
    deliveryDate: "",
    address: "",
    driver: "",
    notes: "",
    lineItems: [{ id: "1", product: "", quantity: 0, uom: "pcs" }],
  });

  const getStatusBadgeVariant = (status: DeliveryStatus) => {
    const variants: Record<DeliveryStatus, "default" | "secondary" | "destructive" | "outline"> = {
      "Delivered": "default",
      "In Transit": "secondary",
      "Pending": "outline",
      "Returned": "destructive",
    };
    return variants[status];
  };

  const stats = {
    total: deliveryNotes.length,
    delivered: deliveryNotes.filter((n) => n.status === "Delivered").length,
    pending: deliveryNotes.filter((n) => n.status === "Pending").length,
    returned: deliveryNotes.filter((n) => n.status === "Returned").length,
  };

  const filteredNotes = deliveryNotes.filter((note) => {
    const matchesSearch =
      note.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.salesOrderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || note.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateNote = () => {
    const note: DeliveryNote = {
      id: `DN-${String(deliveryNotes.length + 1).padStart(3, "0")}`,
      customerName: newNote.customerName || "",
      salesOrderId: newNote.salesOrderId || "",
      deliveryDate: newNote.deliveryDate || "",
      status: "Pending",
      driver: newNote.driver || "",
      address: newNote.address || "",
      lineItems: newNote.lineItems || [],
      notes: newNote.notes,
    };
    setDeliveryNotes([...deliveryNotes, note]);
    setIsModalOpen(false);
    setNewNote({
      customerName: "",
      salesOrderId: "",
      deliveryDate: "",
      address: "",
      driver: "",
      notes: "",
      lineItems: [{ id: "1", product: "", quantity: 0, uom: "pcs" }],
    });
  };

  const handleDeleteNote = (id: string) => {
    setDeliveryNotes(deliveryNotes.filter((note) => note.id !== id));
  };

  const addLineItem = () => {
    setNewNote({
      ...newNote,
      lineItems: [
        ...(newNote.lineItems || []),
        { id: String((newNote.lineItems?.length || 0) + 1), product: "", quantity: 0, uom: "pcs" },
      ],
    });
  };

  const removeLineItem = (id: string) => {
    setNewNote({
      ...newNote,
      lineItems: (newNote.lineItems || []).filter((item) => item.id !== id),
    });
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setNewNote({
      ...newNote,
      lineItems: (newNote.lineItems || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Delivery Notes Management</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage all delivery notes, shipments, and order fulfillment
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Delivery Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Returned/Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.returned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by ID, Customer, or Order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Delivery Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delivery Note ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Sales/Order ID</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Driver/Dispatch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No delivery notes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">{note.id}</TableCell>
                      <TableCell>{note.customerName}</TableCell>
                      <TableCell>
                        <span className="text-primary hover:underline cursor-pointer">{note.salesOrderId}</span>
                      </TableCell>
                      <TableCell>{new Date(note.deliveryDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(note.status)}>{note.status}</Badge>
                      </TableCell>
                      <TableCell>{note.driver}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNote(note.id)}
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
        </CardContent>
      </Card>

      {/* Create Delivery Note Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Delivery Note</DialogTitle>
            <DialogDescription>
              Enter the delivery details and line items for the new delivery note
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={newNote.customerName}
                  onChange={(e) => setNewNote({ ...newNote, customerName: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesOrderId">Sales Order ID</Label>
                <Input
                  id="salesOrderId"
                  value={newNote.salesOrderId}
                  onChange={(e) => setNewNote({ ...newNote, salesOrderId: e.target.value })}
                  placeholder="SO-2024-XXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={newNote.deliveryDate}
                  onChange={(e) => setNewNote({ ...newNote, deliveryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver">Driver Name</Label>
                <Input
                  id="driver"
                  value={newNote.driver}
                  onChange={(e) => setNewNote({ ...newNote, driver: e.target.value })}
                  placeholder="Enter driver name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea
                id="address"
                value={newNote.address}
                onChange={(e) => setNewNote({ ...newNote, address: e.target.value })}
                placeholder="Enter complete delivery address"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="border rounded-lg p-3 space-y-3">
                {(newNote.lineItems || []).map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5 space-y-1">
                      <Label className="text-xs">Product</Label>
                      <Input
                        value={item.product}
                        onChange={(e) => updateLineItem(item.id, "product", e.target.value)}
                        placeholder="Product name"
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value))}
                        placeholder="0"
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">UOM</Label>
                      <Select
                        value={item.uom}
                        onValueChange={(value) => updateLineItem(item.id, "uom", value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">Pieces</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="m">Meters</SelectItem>
                          <SelectItem value="sheets">Sheets</SelectItem>
                          <SelectItem value="boxes">Boxes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      {(newNote.lineItems?.length || 0) > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                          className="h-9 w-9"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Optional Notes</Label>
              <Textarea
                id="notes"
                value={newNote.notes}
                onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                placeholder="Add any special instructions or notes"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save & Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryNotes;
