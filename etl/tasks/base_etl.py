from abc import ABC
from abc import abstractmethod


class ETL(ABC):
    @abstractmethod
    def extract(self, source_data):
        """
        Extracts data from the source.
        """

    @abstractmethod
    def transform(self, extracted_data):
        """
        Transforms the extracted data into a format that can be loaded into a destination.
        """

    @abstractmethod
    def load(self, transformed_data):
        """
        Loads the transformed data into a destination.
        """
