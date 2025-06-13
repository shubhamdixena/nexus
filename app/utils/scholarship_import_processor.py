import pandas as pd
from typing import List, Dict, Any, Tuple
from datetime import datetime
from decimal import Decimal
from app.validations.scholarship_validation import ScholarshipValidation
from app.utils.import_error_handler import ImportErrorHandler
from app.models.scholarship import Scholarship
from app.models.organization import Organization
from app.models.category import Category
from app.models.country import Country
from app.models.education_level import EducationLevel
from app.models.gender import Gender
from sqlalchemy.orm import Session

class ScholarshipImportProcessor:
    def __init__(self, db: Session):
        self.db = db
        self.error_handler = ImportErrorHandler()
        self.required_fields = [
            'name', 'description', 'amount', 'deadline', 'eligibility_criteria',
            'application_process', 'status', 'organization_id', 'category_id',
            'country_id', 'education_level_id', 'gender_id'
        ]

    def process_file(self, file_path: str) -> Tuple[bool, ImportErrorHandler]:
        """
        Process a scholarship import file and return success status and error handler
        """
        try:
            df = pd.read_excel(file_path)
            self._validate_headers(df)
            
            for index, row in df.iterrows():
                row_number = index + 2  # Excel is 1-based and has header row
                self._process_row(row, row_number)

            return not self.error_handler.has_errors(), self.error_handler

        except Exception as e:
            self.error_handler.add_error(1, 'file', f'Error processing file: {str(e)}')
            return False, self.error_handler

    def _validate_headers(self, df: pd.DataFrame):
        """Validate that all required headers are present"""
        missing_headers = [field for field in self.required_fields if field not in df.columns]
        if missing_headers:
            for header in missing_headers:
                self.error_handler.add_missing_required(header)

    def _process_row(self, row: pd.Series, row_number: int):
        """Process a single row of data"""
        try:
            # Convert row to dict and clean data
            data = self._clean_row_data(row)
            
            # Check for duplicates
            if self._is_duplicate(data):
                self.error_handler.add_duplicate(data)
                return

            # Validate data using Pydantic model
            try:
                validated_data = ScholarshipValidation(**data)
            except Exception as e:
                self.error_handler.handle_validation_error(row_number, e)
                return

            # Check for corrupt data
            if self._is_corrupt_data(data):
                self.error_handler.add_corrupt_data(data)
                return

            # Check for incomplete data
            if self._is_incomplete_data(data):
                self.error_handler.add_incomplete_data(data)
                return

            # Create scholarship record
            self._create_scholarship(validated_data)

        except Exception as e:
            self.error_handler.add_error(row_number, 'processing', f'Error processing row: {str(e)}')

    def _clean_row_data(self, row: pd.Series) -> Dict[str, Any]:
        """Clean and convert row data to appropriate types"""
        data = row.to_dict()
        
        # Convert amount to Decimal
        if 'amount' in data and pd.notna(data['amount']):
            data['amount'] = Decimal(str(data['amount']))

        # Convert deadline to datetime
        if 'deadline' in data and pd.notna(data['deadline']):
            if isinstance(data['deadline'], str):
                data['deadline'] = pd.to_datetime(data['deadline'])
            elif isinstance(data['deadline'], datetime):
                data['deadline'] = data['deadline']

        # Convert boolean fields
        boolean_fields = [
            'is_merit_based', 'is_need_based', 'is_athletic', 'is_artistic',
            'is_academic', 'is_minority', 'is_international', 'is_undergraduate',
            'is_graduate', 'is_phd', 'is_postdoc', 'is_full_ride', 'is_partial',
            'is_renewable'
        ]
        for field in boolean_fields:
            if field in data:
                data[field] = bool(data[field]) if pd.notna(data[field]) else False

        # Convert numeric fields
        numeric_fields = ['age_min', 'age_max', 'gpa_min', 'gpa_max', 'income_min', 'income_max']
        for field in numeric_fields:
            if field in data and pd.notna(data[field]):
                data[field] = Decimal(str(data[field]))

        return data

    def _is_duplicate(self, data: Dict[str, Any]) -> bool:
        """Check if scholarship is a duplicate"""
        return self.db.query(Scholarship).filter(
            Scholarship.name == data['name'],
            Scholarship.organization_id == data['organization_id']
        ).first() is not None

    def _is_corrupt_data(self, data: Dict[str, Any]) -> bool:
        """Check if data is corrupt"""
        # Check if required IDs exist in database
        if not self.db.query(Organization).get(data['organization_id']):
            return True
        if not self.db.query(Category).get(data['category_id']):
            return True
        if not self.db.query(Country).get(data['country_id']):
            return True
        if not self.db.query(EducationLevel).get(data['education_level_id']):
            return True
        if not self.db.query(Gender).get(data['gender_id']):
            return True
        return False

    def _is_incomplete_data(self, data: Dict[str, Any]) -> bool:
        """Check if data is incomplete"""
        # Check if any required field is empty
        for field in self.required_fields:
            if field not in data or pd.isna(data[field]):
                return True
        return False

    def _create_scholarship(self, validated_data: ScholarshipValidation):
        """Create a new scholarship record"""
        scholarship = Scholarship(**validated_data.dict())
        self.db.add(scholarship)
        self.db.commit() 