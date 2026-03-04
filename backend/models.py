from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # Admin, Sales, Warehouse
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Product table
class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    unit_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationships
    inventory = db.relationship('Inventory', backref='product', uselist=False, cascade='all, delete-orphan')
    stock_movements = db.relationship('StockMovement', backref='product', cascade='all, delete-orphan')
    order_items = db.relationship('OrderItem', backref='product', cascade='all, delete-orphan')
    invoice_items = db.relationship('InvoiceItem', backref='product', cascade='all, delete-orphan')
    delivery_items = db.relationship('DeliveryItem', backref='product', cascade='all, delete-orphan')

# Inventory table
class Inventory(db.Model):
    __tablename__ = 'inventory'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, unique=True)
    quantity_available = db.Column(db.Integer, nullable=False, default=0)
    reorder_level = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

# StockMovement table
class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    change_quantity = db.Column(db.Integer, nullable=False)  # Positive or negative
    reason = db.Column(db.String(50), nullable=False)  # order, adjustment, return
    reference_id = db.Column(db.String(100))  # Optional reference to order/invoice/etc
    created_at = db.Column(db.DateTime, server_default=db.func.now())

# Updated Order table
class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(120))
    status = db.Column(db.String(20), default='pending')  # pending, approved, invoiced, delivered
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationships
    creator = db.relationship('User', backref='orders')
    order_items = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan')
    invoices = db.relationship('Invoice', backref='order', cascade='all, delete-orphan')
    delivery_notes = db.relationship('DeliveryNote', backref='order', cascade='all, delete-orphan')

# New OrderItem table
class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)

# Updated Invoice table
class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='unpaid')  # unpaid, partially_paid, paid
    pdf_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationships
    invoice_items = db.relationship('InvoiceItem', backref='invoice', cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='invoice', cascade='all, delete-orphan')

# New InvoiceItem table
class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)

# Updated Payment table
class Payment(db.Model):
    __tablename__ = 'payment'
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    amount_paid = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # cash, mpesa, bank
    receipt_number = db.Column(db.String(100), unique=True, nullable=False)
    received_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationships
    receipts = db.relationship('Receipt', backref='payment', cascade='all, delete-orphan')

# Receipt table
class Receipt(db.Model):
    __tablename__ = 'receipts'
    id = db.Column(db.Integer, primary_key=True)
    payment_id = db.Column(db.Integer, db.ForeignKey('payment.id'), nullable=False)
    pdf_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

# Updated DeliveryNote table
class DeliveryNote(db.Model):
    __tablename__ = 'delivery_notes'
    id = db.Column(db.Integer, primary_key=True)
    delivery_note_number = db.Column(db.String(50), unique=True, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    delivered_by = db.Column(db.String(100))
    delivery_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='pending')  # pending, delivered
    pdf_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationships
    delivery_items = db.relationship('DeliveryItem', backref='delivery_note', cascade='all, delete-orphan')

# New DeliveryItem table
class DeliveryItem(db.Model):
    __tablename__ = 'delivery_items'
    id = db.Column(db.Integer, primary_key=True)
    delivery_note_id = db.Column(db.Integer, db.ForeignKey('delivery_notes.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity_delivered = db.Column(db.Integer, nullable=False)
