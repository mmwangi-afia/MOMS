from flask_restful import Resource, reqparse
from models import Invoice, Order
from app import db
from resources.auth import role_required
from utils.pdf import generate_invoice_pdf

class InvoiceResource(Resource):
    @role_required(['Admin', 'Sales'])
    def get(self, id=None):
        if id:
            invoice = Invoice.query.get(id)
            if not invoice:
                return {'message': 'Not found'}, 404
            return {'id': invoice.id, 'order_id': invoice.order_id, 'total_amount': invoice.total_amount, 'pdf_path': invoice.pdf_path}
        invoices = Invoice.query.all()
        return [{'id': i.id, 'order_id': i.order_id, 'total_amount': i.total_amount, 'pdf_path': i.pdf_path} for i in invoices]

    @role_required(['Admin', 'Sales'])
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('order_id', type=int, required=True)
        parser.add_argument('total_amount', type=float, required=True)
        args = parser.parse_args()
        invoice = Invoice(order_id=args['order_id'], total_amount=args['total_amount'])
        db.session.add(invoice)
        db.session.commit()
        # Generate PDF
        pdf_path = generate_invoice_pdf(invoice)
        invoice.pdf_path = pdf_path
        db.session.commit()
        return {'message': 'Invoice created', 'id': invoice.id, 'pdf_path': pdf_path}, 201

    @role_required(['Admin'])
    def delete(self, id):
        invoice = Invoice.query.get(id)
        if not invoice:
            return {'message': 'Not found'}, 404
        db.session.delete(invoice)
        db.session.commit()
        return {'message': 'Invoice deleted'}
