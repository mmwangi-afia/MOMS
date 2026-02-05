from flask_restful import Resource, reqparse
from models import Receipt, Payment
from app import db
from resources.auth import role_required
from utils.pdf import generate_receipt_pdf

class ReceiptResource(Resource):
    @role_required(['Admin', 'Sales'])
    def get(self, id=None):
        if id:
            receipt = Receipt.query.get(id)
            if not receipt:
                return {'message': 'Not found'}, 404
            return {'id': receipt.id, 'payment_id': receipt.payment_id, 'pdf_path': receipt.pdf_path}
        receipts = Receipt.query.all()
        return [{'id': r.id, 'payment_id': r.payment_id, 'pdf_path': r.pdf_path} for r in receipts]

    @role_required(['Admin', 'Sales'])
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('payment_id', type=int, required=True)
        args = parser.parse_args()
        receipt = Receipt(payment_id=args['payment_id'])
        db.session.add(receipt)
        db.session.commit()
        pdf_path = generate_receipt_pdf(receipt)
        receipt.pdf_path = pdf_path
        db.session.commit()
        return {'message': 'Receipt generated', 'id': receipt.id, 'pdf_path': pdf_path}, 201

    @role_required(['Admin'])
    def delete(self, id):
        receipt = Receipt.query.get(id)
        if not receipt:
            return {'message': 'Not found'}, 404
        db.session.delete(receipt)
        db.session.commit()
        return {'message': 'Receipt deleted'}
