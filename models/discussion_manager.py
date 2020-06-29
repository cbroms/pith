from models.discussion import Discussion


class DiscussionManager:

    def __init__(self, db):
        self.discussions = db["discussions"]

    def get_discussions():
        discussion_cursor = self.discussions.find()
        discussion_list = []
        for u in discussion_cursor:
            discussion_list.append(u)
        return discussion_list

    def get_discussion(discussion_id):
        discussion_data = self.discussions.find_one({ "_id" : discussion_id })
        return discussion_data

    def insert_discussion(self, discussion_obj):
        discussion_data = discussion_obj.__dict__
        self.discussions.insert_one(discussion_data)

    def create_discussion():
        discussion_obj = Discussion()
        self.insert_discussion(discussion_obj)
        discussion_data = discussion_obj.__dict__
        return discussion_data

    # TODO consider rights to adding tags
    def discussion_add_tag(discussion_id, tag):
        self.discussions.update_one({"_id" : discussion_id}, {"$push": {"tags" : tag}})
        discussion_data = self.get_discussion(discussion_id)
        return discussion_data

    # TODO consider rights to removing tags
    def discussion_remove_tag(block_id, tag):
        self.discussions.update_one({"_id" : discussion_id}, {"$pull": {"tags" : tag}})
        discussion_data = self.get_discussion(discussion_id)
        return discussion_data
