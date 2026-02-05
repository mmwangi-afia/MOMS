from flask_restful import Resource, reqparse
from models import Order
from app import db
from resources.auth import role_required

class OrderResource(Resource):
    @role_required(['Admin', 'Sales'])
    def get(self, id=None):
        if id:
            order = Order.query.get(id)
            if not order:
                return {'message': 'Not found'}, 404
            return {'id': order.id, 'customer_name': order.customer_name, 'status': order.status}
        orders = Order.query.all()
        return [{'id': o.id, 'customer_name': o.customer_name, 'status': o.status} for o in orders]

    @role_required(['Admin', 'Sales'])
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('customer_name', required=True)
        args = parser.parse_args()
        order = Order(customer_name=args['customer_name'])
        db.session.add(order)
        db.session.commit()
        return {'message': 'Order created', 'id': order.id}, 201

    @role_required(['Admin', 'Sales'])
    def put(self, id):
        order = Order.query.get(id)
        if not order:
            return {'message': 'Not found'}, 404
        parser = reqparse.RequestParser()
        parser.add_argument('status')
        args = parser.parse_args()
        if args['status']:
            order.status = args['status']
        db.session.commit()
        return {'message': 'Order updated'}

    @role_required(['Admin'])
    def delete(self, id):
        order = Order.query.get(id)
        if not order:
            return {'message': 'Not found'}, 404
        db.session.delete(order)
        db.session.commit()
        return {'message': 'Order deleted'}
