from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))


with open(path + "/board/responses/created.json") as file:
  created = load(file)
