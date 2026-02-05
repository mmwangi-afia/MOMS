from flask_restful import Resource, reqparse
from flask import request
from models import Product, Inventory, StockMovement
from app import db
from resources.auth import role_required

class StockResource(Resource):
    @role_required(['Admin','Sales', 'Warehouse'])
    def get(self, id=None):
        if id:
            product = Product.query.get(id)
            if not product:
                return {'message': 'Not found'}, 404
            return {
                'id': product.id,
                'sku': product.sku,
                'name': product.name,
                'description': product.description,
                'unit_price': product.unit_price,
                'quantity_available': product.inventory.quantity_available if product.inventory else 0,
                'reorder_level': product.inventory.reorder_level if product.inventory else 0,
                'created_at': product.created_at.isoformat() if product.created_at else None,
                'last_updated': product.inventory.last_updated.isoformat() if product.inventory and product.inventory.last_updated else None
            }
        
        products = Product.query.all()
        return [
            {
                'id': p.id,
                'sku': p.sku,
                'name': p.name,
                'description': p.description,
                'unit_price': p.unit_price,
                'quantity_available': p.inventory.quantity_available if p.inventory else 0,
                'reorder_level': p.inventory.reorder_level if p.inventory else 0,
                'created_at': p.created_at.isoformat() if p.created_at else None,
                'last_updated': p.inventory.last_updated.isoformat() if p.inventory and p.inventory.last_updated else None
            }
            for p in products
        ]

    @role_required(['Admin', 'Warehouse'])
    def post(self):
        # Support both single and batch creation
        data = request.get_json(force=True)
        items = data if isinstance(data, list) else [data]
        created = []
        
        for item in items:
            sku = item.get('sku')
            name = item.get('name')
            unit_price = item.get('unit_price')
            quantity = item.get('quantity', 0)
            description = item.get('description', '')
            reorder_level = item.get('reorder_level', 0)
            
            if not all([sku, name, unit_price is not None]):
                continue  # skip invalid
            
            # Create product
            product = Product(
                sku=sku,
                name=name,
                description=description,
                unit_price=unit_price
            )
            db.session.add(product)
            db.session.flush()  # get id before commit
            
            # Create inventory
            inventory = Inventory(
                product_id=product.id,
                quantity_available=quantity,
                reorder_level=reorder_level
            )
            db.session.add(inventory)
            db.session.flush()
            
            # Create initial stock movement if quantity > 0
            if quantity > 0:
                movement = StockMovement(
                    product_id=product.id,
                    change_quantity=quantity,
                    reason='adjustment',
                    reference_id='Initial stock'
                )
                db.session.add(movement)
            
            created.append({
                "id": product.id,
                "sku": product.sku,
                "name": product.name,
                "description": product.description,
                "unit_price": product.unit_price,
                "quantity_available": inventory.quantity_available,
                "reorder_level": inventory.reorder_level,
                "created_at": product.created_at.isoformat() if product.created_at else None
            })
        
        db.session.commit()
        return created, 201

    @role_required(['Admin', 'Warehouse'])
    def put(self, id):
        product = Product.query.get(id)
        if not product:
            return {'message': 'Not found'}, 404
        
        data = request.get_json(force=True)
        
        # Update product fields
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'unit_price' in data:
            product.unit_price = data['unit_price']
        if 'sku' in data:
            product.sku = data['sku']
        
        # Update inventory quantity with stock movement
        if 'quantity' in data:
            new_quantity = data['quantity']
            current_quantity = product.inventory.quantity_available if product.inventory else 0
            change = new_quantity - current_quantity
            
            if change != 0:
                # Update inventory
                if not product.inventory:
                    inventory = Inventory(
                        product_id=product.id,
                        quantity_available=new_quantity,
                        reorder_level=data.get('reorder_level', 0)
                    )
                    db.session.add(inventory)
                else:
                    product.inventory.quantity_available = new_quantity
                
                # Record stock movement
                movement = StockMovement(
                    product_id=product.id,
                    change_quantity=change,
                    reason=data.get('reason', 'adjustment'),
                    reference_id=data.get('reference_id', 'Manual adjustment')
                )
                db.session.add(movement)
        
        # Update reorder level
        if 'reorder_level' in data and product.inventory:
            product.inventory.reorder_level = data['reorder_level']
        
        db.session.commit()
        return {'message': 'Product updated'}

    @role_required(['Admin'])
    def delete(self, id):
        product = Product.query.get(id)
        if not product:
            return {'message': 'Not found'}, 404
        db.session.delete(product)
        db.session.commit()
        return {'message': 'Product deleted'}
