from models.user import User


class UserManager:

    def __init__(self, db):
        self.users = db["users"]

    def get_users(self):
        user_cursor = self.users.find()
        user_list = []
        for u in user_cursor:
            user_list.append(u)
        return user_list

    def get_user(self, user_id):
        user_data = self.users.find_one({ "_id" : user_id })
        return user_data

    def insert_user(self, user_obj):
        user_data = user_obj.__dict__
        self.users.insert_one(user_data)

    def create_user(ip):
        user_data = self.get_user(ip)
        if user_data == None:
            user_obj = User(ip)
            self.insert_user(user_obj)
            user_data = user_obj.__dict__
        return user_data
