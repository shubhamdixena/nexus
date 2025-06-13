from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
from pydantic import ValidationError

class ImportError:
    def __init__(self, row_number: int, field: str, error_message: str, value: Any = None):
        self.row_number = row_number
        self.field = field
        self.error_message = error_message
        self.value = value
        self.timestamp = datetime.now()

class ImportErrorHandler:
    def __init__(self):
        self.errors: List[ImportError] = []
        self.warnings: List[ImportError] = []
        self.duplicates: List[Dict[str, Any]] = []
        self.missing_required: List[str] = []
        self.corrupt_data: List[Dict[str, Any]] = []
        self.incomplete_data: List[Dict[str, Any]] = []

    def add_error(self, row_number: int, field: str, error_message: str, value: Any = None):
        self.errors.append(ImportError(row_number, field, error_message, value))

    def add_warning(self, row_number: int, field: str, warning_message: str, value: Any = None):
        self.warnings.append(ImportError(row_number, field, warning_message, value))

    def add_duplicate(self, row_data: Dict[str, Any]):
        self.duplicates.append(row_data)

    def add_missing_required(self, field: str):
        if field not in self.missing_required:
            self.missing_required.append(field)

    def add_corrupt_data(self, row_data: Dict[str, Any]):
        self.corrupt_data.append(row_data)

    def add_incomplete_data(self, row_data: Dict[str, Any]):
        self.incomplete_data.append(row_data)

    def handle_validation_error(self, row_number: int, error: ValidationError):
        for err in error.errors():
            field = err['loc'][0] if err['loc'] else 'unknown'
            self.add_error(row_number, field, err['msg'])

    def get_error_summary(self) -> Dict[str, Any]:
        return {
            'total_errors': len(self.errors),
            'total_warnings': len(self.warnings),
            'duplicates_found': len(self.duplicates),
            'missing_required_fields': self.missing_required,
            'corrupt_data_count': len(self.corrupt_data),
            'incomplete_data_count': len(self.incomplete_data),
            'errors_by_field': self._group_errors_by_field(),
            'errors_by_row': self._group_errors_by_row()
        }

    def _group_errors_by_field(self) -> Dict[str, List[ImportError]]:
        field_errors = {}
        for error in self.errors:
            if error.field not in field_errors:
                field_errors[error.field] = []
            field_errors[error.field].append(error)
        return field_errors

    def _group_errors_by_row(self) -> Dict[int, List[ImportError]]:
        row_errors = {}
        for error in self.errors:
            if error.row_number not in row_errors:
                row_errors[error.row_number] = []
            row_errors[error.row_number].append(error)
        return row_errors

    def has_errors(self) -> bool:
        return len(self.errors) > 0

    def has_warnings(self) -> bool:
        return len(self.warnings) > 0

    def clear(self):
        self.errors = []
        self.warnings = []
        self.duplicates = []
        self.missing_required = []
        self.corrupt_data = []
        self.incomplete_data = []

    def export_errors_to_excel(self, filepath: str):
        """Export all errors to an Excel file with multiple sheets for different error types."""
        with pd.ExcelWriter(filepath) as writer:
            # Errors sheet
            if self.errors:
                errors_df = pd.DataFrame([
                    {
                        'Row Number': e.row_number,
                        'Field': e.field,
                        'Error Message': e.error_message,
                        'Value': e.value,
                        'Timestamp': e.timestamp
                    } for e in self.errors
                ])
                errors_df.to_excel(writer, sheet_name='Errors', index=False)

            # Warnings sheet
            if self.warnings:
                warnings_df = pd.DataFrame([
                    {
                        'Row Number': w.row_number,
                        'Field': w.field,
                        'Warning Message': w.error_message,
                        'Value': w.value,
                        'Timestamp': w.timestamp
                    } for w in self.warnings
                ])
                warnings_df.to_excel(writer, sheet_name='Warnings', index=False)

            # Duplicates sheet
            if self.duplicates:
                duplicates_df = pd.DataFrame(self.duplicates)
                duplicates_df.to_excel(writer, sheet_name='Duplicates', index=False)

            # Summary sheet
            summary_data = {
                'Metric': [
                    'Total Errors',
                    'Total Warnings',
                    'Duplicates Found',
                    'Missing Required Fields',
                    'Corrupt Data Count',
                    'Incomplete Data Count'
                ],
                'Count': [
                    len(self.errors),
                    len(self.warnings),
                    len(self.duplicates),
                    len(self.missing_required),
                    len(self.corrupt_data),
                    len(self.incomplete_data)
                ]
            }
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False) 