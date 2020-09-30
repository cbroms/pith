from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))


with open(path + "/board/responses/create.json") as file:
  create = load(file)
