
class TotalScope:

    def create_user(ip):
        user_data = database.get_user(ip)
        if user_data == None:
            user_obj = User(ip)
            database.insert_user(user_obj)
            user_data = user_obj.__dict__
        return user_data
        # TODO assert user_data is not None

    def create_discussion():
        discussion_obj = Discussion()
        database.insert_discussion(discussion_obj)
        discussion_data = discussion_obj.__dict__
        return discussion_data

    def discussion_add_tag(discussion_id, tag):
        database.discussion_add_tag(discussion_id, tag)
        discussion_data = database.get_discussion(discussion_id)
        return discussion_data

    def discussion_remove_tag(block_id, tag):
        database.discussion_remove_tag(discussion_id, tag)
        discussion_data = database.get_discussion(discussion_id)
        return discussion_data
