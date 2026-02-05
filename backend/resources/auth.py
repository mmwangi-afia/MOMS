from flask_restful import Resource, reqparse
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from models import User
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import datetime
from sqlalchemy import or_

# In-memory token store for demo (use DB in production)
reset_tokens = {}

class SignupResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', required=True)
        parser.add_argument('email', required=True)
        parser.add_argument('password', required=True)
        parser.add_argument('role', required=True)
        args = parser.parse_args()
        if User.query.filter_by(email=args['email']).first():
            return {'message': 'Email already registered'}, 400
        user = User(name=args['name'], email=args['email'], role=args['role'])
        user.set_password(args['password'])
        db.session.add(user)
        db.session.commit()
        return {'message': 'User registered successfully'}, 201

class LoginResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('identifier', required=True)
        parser.add_argument('password', required=True)
        args = parser.parse_args()
        user = User.query.filter(
            or_(User.name == args['identifier'], User.email == args['identifier'])
        ).first()
        if user and user.check_password(args['password']):
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    'role': user.role,
                    'name': user.name,
                    'email': user.email
                }
            )
            return {'access_token': access_token, 'role': user.role}, 200
        return {'message': 'Invalid credentials'}, 401

class ForgotPasswordResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('email', required=True)
        args = parser.parse_args()
        user = User.query.filter_by(email=args['email']).first()
        if not user:
            return {'message': 'Email not found'}, 404
        token = secrets.token_urlsafe(32)
        reset_tokens[token] = {'user_id': user.id, 'expires': datetime.datetime.utcnow() + datetime.timedelta(hours=1)}
        print(f"Password reset link: http://localhost:8080/reset-password?token={token}")
        return {'message': 'Password reset link sent to email (simulated)', 'token': token}, 200

class ResetPasswordResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('token', required=True)
        parser.add_argument('password', required=True)
        args = parser.parse_args()
        data = reset_tokens.get(args['token'])
        if not data or data['expires'] < datetime.datetime.utcnow():
            return {'message': 'Invalid or expired token'}, 400
        user = User.query.get(data['user_id'])
        if not user:
            return {'message': 'User not found'}, 404
        user.set_password(args['password'])
        db.session.commit()
        reset_tokens.pop(args['token'])
        return {'message': 'Password reset successful'}, 200

class LogoutResource(Resource):
    @jwt_required()
    def post(self):
        return {'message': 'Logged out'}, 200

def role_required(roles):
    def wrapper(fn):
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get('role') not in roles:
                return {'message': 'Access denied'}, 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper
