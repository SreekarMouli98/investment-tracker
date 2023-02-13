from abc import ABC, abstractmethod


class ETL(ABC):
    @abstractmethod
    def extract(self):
        """
        Extracts data from the source.
        """
        pass

    @abstractmethod
    def transform(self):
        """
        Transforms the extracted data into a format that can be loaded into a destination.
        """
        pass

    @abstractmethod
    def load(self):
        """
        Loads the transformed data into a destination.
        """
        pass
