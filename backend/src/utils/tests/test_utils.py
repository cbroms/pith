import logging
import unittest

from utils import utils


class TestUtils(unittest.TestCase):
    def setUp(self) -> None:
        pass

    def test_text_tokens1(self) -> None:
        text = "Make believe and play hard!"
        tokens = utils.text_tokens(text)
        self.assertEqual(len(tokens), 5)

    def test_text_tokens2(self) -> None:
        text = "Make believe and play hard!\n"
        tokens = utils.text_tokens(text)
        self.assertEqual(len(tokens), 5)

    def test_text_tokens3(self) -> None:
        text = "Make believe--and play hard!\n"
        tokens = utils.text_tokens(text)
        print(tokens)
        self.assertEqual(len(tokens), 5)

    def test_make_freq_dict(self) -> None:
        text = "You and me will be greater than just you."
        freq_dict = utils.make_freq_dict(text)
        self.assertEqual(freq_dict["you"], 2)

    def test_sum_dicts(self) -> None:
        sum_dict = utils.sum_dicts([
            {"A": 1, "B": 2},
            {"C": 4, "A": 3},
            {"B": 5, "E": 8}
        ])
        self.assertEqual(sum_dict, {"A": 4, "B": 7, "C": 4, "E": 8})


if __name__ == "__main__":
    logging.info("Running util tests...")
    unittest.main()
