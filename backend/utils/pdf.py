from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def generate_invoice_pdf(invoice):
    filename = f'invoice_{invoice.id}.pdf'
    filepath = os.path.join('pdfs', filename)
    c = canvas.Canvas(filepath, pagesize=letter)
    c.drawString(100, 750, f"Invoice ID: {invoice.id}")
    c.drawString(100, 730, f"Order ID: {invoice.order_id}")
    c.drawString(100, 710, f"Total Amount: {invoice.total_amount}")
    c.save()
    return filepath

def generate_receipt_pdf(receipt):
    filename = f'receipt_{receipt.id}.pdf'
    filepath = os.path.join('pdfs', filename)
    c = canvas.Canvas(filepath, pagesize=letter)
    c.drawString(100, 750, f"Receipt ID: {receipt.id}")
    c.drawString(100, 730, f"Payment ID: {receipt.payment_id}")
    c.save()
    return filepath

def generate_delivery_note_pdf(note):
    filename = f'delivery_note_{note.id}.pdf'
    filepath = os.path.join('pdfs', filename)
    c = canvas.Canvas(filepath, pagesize=letter)
    c.drawString(100, 750, f"Delivery Note ID: {note.id}")
    c.drawString(100, 730, f"Order ID: {note.order_id}")
    c.save()
    return filepath
