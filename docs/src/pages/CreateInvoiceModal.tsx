import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineItem, Invoice } from '@/types/invoice';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Omit<Invoice, 'id'>) => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [customerName, setCustomerName] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const resetForm = () => {
    setCustomerName('');
    setDateIssued('');
    setDueDate('');
    setLineItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: String(lineItems.length + 1),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSave = () => {
    if (!customerName || !dateIssued || !dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const invoice: Omit<Invoice, 'id'> = {
      customerName,
      dateIssued,
      dueDate,
      status: 'pending',
      amount: calculateTotal(),
      lineItems
    };

    onSave(invoice);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
          <CardTitle className="text-xl font-semibold text-foreground">Create New Invoice</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-foreground font-medium">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateIssued" className="text-foreground font-medium">Invoice Date *</Label>
              <Input
                id="dateIssued"
                type="date"
                value={dateIssued}
                onChange={(e) => setDateIssued(e.target.value)}
                className="border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-foreground font-medium">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-border max-w-md"
            />
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium text-foreground">Line Items</Label>
              <Button onClick={addLineItem} variant="outline" size="sm" className="border-border">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item) => (
                <Card key={item.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-5 space-y-2">
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                          className="border-border"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-sm text-muted-foreground">Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="1"
                          className="border-border"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-sm text-muted-foreground">Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="border-border"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-sm text-muted-foreground">Total</Label>
                        <div className="h-10 px-3 py-2 bg-muted text-foreground rounded-md border border-border flex items-center">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                      <div className="md:col-span-1 flex justify-center">
                        {lineItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                            className="h-8 w-8 p-0 text-danger hover:bg-danger-light"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Total */}
            <Card className="border-border bg-muted/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-foreground">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={handleClose} variant="outline" className="flex-1 border-border">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground">
              Save Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateInvoiceModal;