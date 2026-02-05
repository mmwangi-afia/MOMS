from flask_restful import Resource, reqparse
from models import DeliveryNote, Order
from app import db
from resources.auth import role_required
from utils.pdf import generate_delivery_note_pdf

class DeliveryNoteResource(Resource):
    @role_required(['Admin', 'Warehouse'])
    def get(self, id=None):
        if id:
            note = DeliveryNote.query.get(id)
            if not note:
                return {'message': 'Not found'}, 404
            return {'id': note.id, 'order_id': note.order_id, 'pdf_path': note.pdf_path}
        notes = DeliveryNote.query.all()
        return [{'id': n.id, 'order_id': n.order_id, 'pdf_path': n.pdf_path} for n in notes]

    @role_required(['Admin', 'Warehouse'])
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('order_id', type=int, required=True)
        args = parser.parse_args()
        note = DeliveryNote(order_id=args['order_id'])
        db.session.add(note)
        db.session.commit()
        pdf_path = generate_delivery_note_pdf(note)
        note.pdf_path = pdf_path
        db.session.commit()
        return {'message': 'Delivery note generated', 'id': note.id, 'pdf_path': pdf_path}, 201

    @role_required(['Admin'])
    def delete(self, id):
        note = DeliveryNote.query.get(id)
        if not note:
            return {'message': 'Not found'}, 404
        db.session.delete(note)
        db.session.commit()
        return {'message': 'Delivery note deleted'}
