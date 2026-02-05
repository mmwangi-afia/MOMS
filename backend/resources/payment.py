from flask_restful import Resource, reqparse
from flask import request
import os
from werkzeug.utils import secure_filename
from models import Payment, Invoice
from app import db
from resources.auth import role_required
from datetime import datetime

class PaymentResource(Resource):
    @role_required(['Admin', 'Sales'])
    def get(self, id=None):
        if id:
            payment = Payment.query.get(id)
            if not payment:
                return {'message': 'Payment not found'}, 404
            
            return {
                'id': payment.id,
                'invoice_id': payment.invoice_id,
                'amount_paid': payment.amount_paid,
                'payment_method': payment.payment_method,
                'receipt_number': payment.receipt_number,
                'received_at': payment.received_at.isoformat() if payment.received_at else None,
                'customer_name': payment.invoice.order.customer_name if payment.invoice and payment.invoice.order else None
            }
        
        payments = Payment.query.all()
        payment_list = []
        
        for p in payments:
            payment_data = {
                'id': p.id,
                'invoice_id': p.invoice_id,
                'amount_paid': p.amount_paid,
                'payment_method': p.payment_method,
                'receipt_number': p.receipt_number,
                'received_at': p.received_at.isoformat() if p.received_at else None,
                'customer_name': p.invoice.order.customer_name if p.invoice and p.invoice.order else None
            }
            payment_list.append(payment_data)
            
        return payment_list

    @role_required(['Admin', 'Sales'])
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('invoice_id', type=int, required=True)
        parser.add_argument('amount_paid', type=float, required=True)
        parser.add_argument('payment_method', type=str, required=True)
        parser.add_argument('receipt_number', type=str, required=True)
        
        args = parser.parse_args()
        
        # Validate invoice exists
        invoice = Invoice.query.get(args['invoice_id'])
        if not invoice:
            return {'message': 'Invoice not found'}, 404
        
        # Check if receipt number already exists
        existing_payment = Payment.query.filter_by(receipt_number=args['receipt_number']).first()
        if existing_payment:
            return {'message': 'Receipt number already exists'}, 400
        
        payment = Payment(
            invoice_id=args['invoice_id'],
            amount_paid=args['amount_paid'],
            payment_method=args['payment_method'],
            receipt_number=args['receipt_number']
        )
            
        db.session.add(payment)
        db.session.commit()
        
        return {
            'message': 'Payment recorded successfully',
            'id': payment.id,
            'invoice_id': payment.invoice_id,
            'amount_paid': payment.amount_paid,
            'receipt_number': payment.receipt_number
        }, 201

    @role_required(['Admin', 'Sales'])
    def put(self, id):
        payment = Payment.query.get(id)
        if not payment:
            return {'message': 'Payment not found'}, 404
            
        parser = reqparse.RequestParser()
        parser.add_argument('amount_paid', type=float)
        parser.add_argument('payment_method', type=str)
        parser.add_argument('receipt_number', type=str)
        
        args = parser.parse_args()
        
        # Update fields
        if args['amount_paid'] is not None:
            payment.amount_paid = args['amount_paid']
        if args['payment_method']:
            payment.payment_method = args['payment_method']
        if args['receipt_number']:
            # Check if new receipt number already exists for another payment
            existing_payment = Payment.query.filter_by(receipt_number=args['receipt_number']).first()
            if existing_payment and existing_payment.id != id:
                return {'message': 'Receipt number already exists'}, 400
            payment.receipt_number = args['receipt_number']
            
        db.session.commit()
        
        return {'message': 'Payment updated successfully'}

    @role_required(['Admin'])
    def delete(self, id):
        payment = Payment.query.get(id)
        if not payment:
            return {'message': 'Payment not found'}, 404
        db.session.delete(payment)
        db.session.commit()
        return {'message': 'Payment deleted successfully'}


class PaymentUploadResource(Resource):
    @role_required(['Admin', 'Sales'])
    def post(self):
        if 'file' not in request.files:
            return {'message': 'No file provided'}, 400
            
        file = request.files['file']
        payment_id = request.form.get('payment_id')
        
        if not payment_id:
            return {'message': 'Payment ID is required'}, 400
            
        if file.filename == '':
            return {'message': 'No file selected'}, 400
            
        # Validate payment exists
        payment = Payment.query.get(payment_id)
        if not payment:
            return {'message': 'Payment not found'}, 404
            
        # Save file
        filename = secure_filename(file.filename)
        upload_folder = 'uploads/payment_receipts'
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, f"payment_{payment_id}_{filename}")
        file.save(file_path)
        
        return {
            'message': 'File uploaded successfully',
            'file_path': file_path
        }, 201
