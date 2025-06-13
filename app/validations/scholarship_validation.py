from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class ScholarshipValidation(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    amount: Decimal = Field(..., gt=0)
    deadline: datetime
    eligibility_criteria: str = Field(..., min_length=1)
    application_process: str = Field(..., min_length=1)
    status: str = Field(..., regex='^(active|inactive)$')
    organization_id: int = Field(..., gt=0)
    category_id: int = Field(..., gt=0)
    country_id: int = Field(..., gt=0)
    education_level_id: int = Field(..., gt=0)
    gender_id: int = Field(..., gt=0)
    age_min: Optional[int] = Field(None, ge=0)
    age_max: Optional[int] = Field(None, ge=0)
    gpa_min: Optional[Decimal] = Field(None, ge=0, le=4.0)
    gpa_max: Optional[Decimal] = Field(None, ge=0, le=4.0)
    income_min: Optional[Decimal] = Field(None, ge=0)
    income_max: Optional[Decimal] = Field(None, ge=0)
    is_merit_based: bool = Field(default=False)
    is_need_based: bool = Field(default=False)
    is_athletic: bool = Field(default=False)
    is_artistic: bool = Field(default=False)
    is_academic: bool = Field(default=False)
    is_minority: bool = Field(default=False)
    is_international: bool = Field(default=False)
    is_undergraduate: bool = Field(default=False)
    is_graduate: bool = Field(default=False)
    is_phd: bool = Field(default=False)
    is_postdoc: bool = Field(default=False)
    is_full_ride: bool = Field(default=False)
    is_partial: bool = Field(default=False)
    is_renewable: bool = Field(default=False)
    renewal_criteria: Optional[str] = None
    application_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None
    notes: Optional[str] = None

    @validator('age_max')
    def validate_age_range(cls, v, values):
        if 'age_min' in values and v is not None and values['age_min'] is not None:
            if v < values['age_min']:
                raise ValueError('age_max must be greater than or equal to age_min')
        return v

    @validator('gpa_max')
    def validate_gpa_range(cls, v, values):
        if 'gpa_min' in values and v is not None and values['gpa_min'] is not None:
            if v < values['gpa_min']:
                raise ValueError('gpa_max must be greater than or equal to gpa_min')
        return v

    @validator('income_max')
    def validate_income_range(cls, v, values):
        if 'income_min' in values and v is not None and values['income_min'] is not None:
            if v < values['income_min']:
                raise ValueError('income_max must be greater than or equal to income_min')
        return v

    @validator('deadline')
    def validate_deadline(cls, v):
        if v < datetime.now():
            raise ValueError('deadline must be in the future')
        return v

    @validator('application_url')
    def validate_url(cls, v):
        if v is not None:
            if not v.startswith(('http://', 'https://')):
                raise ValueError('application_url must be a valid URL')
        return v

    @validator('contact_email')
    def validate_email(cls, v):
        if v is not None:
            if '@' not in v or '.' not in v:
                raise ValueError('contact_email must be a valid email address')
        return v 