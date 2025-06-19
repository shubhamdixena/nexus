const ExcelJS = require('exceljs');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration. Please check your .env.local file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to clean HTML tags and entities
function cleanHtmlTags(text) {
    if (!text) return null;
    
    return text
        .replace(/&lt;br&gt;|&lt;br\s*\/&gt;|<br>|<br\s*\/>/gi, '\n')
        .replace(/&lt;[^&gt;]*&gt;|<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Function to extract country from location field
function extractCountry(location) {
    if (!location) return null;
    
    // Common patterns for country extraction
    const countryPatterns = [
        /,\s*([A-Za-z\s]+)$/,  // "City, Country"
        /^([A-Za-z\s]+)$/      // Just "Country"
    ];
    
    for (const pattern of countryPatterns) {
        const match = location.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    return location; // Return as is if no pattern matches
}

// Function to parse deadline text into a proper date format
function parseDeadlineDate(deadlineText) {
    if (!deadlineText) return null;
    
    // Extract date patterns like "January 15, 2026"
    const datePatterns = [
        /(\w+)\s+(\d{1,2}),\s+(\d{4})/i,  // "January 15, 2026"
        /(\d{1,2})\s+(\w+)\s+(\d{4})/i,   // "15 January 2026"
        /(\d{4})-(\d{1,2})-(\d{1,2})/,    // "2026-01-15"
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/   // "01/15/2026"
    ];
    
    for (const pattern of datePatterns) {
        const match = deadlineText.match(pattern);
        if (match) {
            try {
                if (pattern === datePatterns[0]) {
                    // "January 15, 2026" format
                    const dateStr = `${match[1]} ${match[2]}, ${match[3]}`;
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
                    }
                }
                // Add more parsing logic for other patterns if needed
            } catch (e) {
                console.warn(`Failed to parse date: ${match[0]}`);
            }
        }
    }
    
    // If no pattern matches, return null
    return null;
}

// Function to convert Excel data to scholarship format
function convertExcelDataToScholarship(excelData) {
    const rawDeadline = cleanHtmlTags(excelData['Latest Deadline (Approx.)'] || excelData['Deadline']);
    const parsedDeadline = parseDeadlineDate(rawDeadline);
    
    return {
        name: cleanHtmlTags(excelData['Scholarship Name'] || excelData['Title']),
        provider: cleanHtmlTags(excelData['Host Organization'] || excelData['Organization']),
        description: cleanHtmlTags(excelData['Description'] || excelData['Details']) || 
                    `${cleanHtmlTags(excelData['Scholarship Name'])} offered by ${cleanHtmlTags(excelData['Host Organization'])}`,
        amount: cleanHtmlTags(excelData['Amount'] || excelData['Value']),
        eligibility: cleanHtmlTags(excelData['Eligibility Criteria (Key Points)'] || excelData['Eligibility']),
        deadline: parsedDeadline, // Use parsed date or null
        application_url: cleanHtmlTags(excelData['Official URL'] || excelData['Website']),
        degree_level: excelData['Level of Study'] ? [cleanHtmlTags(excelData['Level of Study'])] : null,
        countries: excelData['Host Country'] ? [cleanHtmlTags(excelData['Host Country'])] : null,
        benefits: cleanHtmlTags(excelData['Benefits (Key Points)'] || excelData['Benefits']),
        status: 'active',
        
        // Also populate legacy fields for backwards compatibility
        title: cleanHtmlTags(excelData['Scholarship Name'] || excelData['Title']),
        organization: cleanHtmlTags(excelData['Host Organization'] || excelData['Organization']),
        country: extractCountry(cleanHtmlTags(excelData['Host Country'] || excelData['Location'])),
        degree: cleanHtmlTags(excelData['Level of Study'] || excelData['Degree Level']),
        field: cleanHtmlTags(excelData['Field of Study'] || excelData['Subject Area']),
        eligibility_criteria: cleanHtmlTags(excelData['Eligibility Criteria (Key Points)'] || excelData['Eligibility'])
    };
}

// Main function to process Excel file
async function processExcelFile(filePath) {
    try {
        console.log(`Processing Excel file: ${filePath}`);
        
        // Read the Excel file using ExcelJS
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        
        // Get the first worksheet
        const worksheet = workbook.worksheets[0];
        
        // Convert worksheet to JSON format
        const jsonData = [];
        const headers = [];
        
        // Get headers from first row
        worksheet.getRow(1).eachCell((cell, colNumber) => {
            headers[colNumber] = cell.value;
        });
        
        // Process data rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row
            
            const rowData = {};
            row.eachCell((cell, colNumber) => {
                if (headers[colNumber]) {
                    rowData[headers[colNumber]] = cell.value;
                }
            });
            
            jsonData.push(rowData);
        });
        
        console.log(`Found ${jsonData.length} rows in Excel file`);
        
        // Convert and validate data
        const scholarships = [];
        const errors = [];
        
        jsonData.forEach((row, index) => {
            try {
                const scholarship = convertExcelDataToScholarship(row);
                
                // Basic validation
                if (!scholarship.title) {
                    errors.push(`Row ${index + 2}: Missing scholarship title`);
                    return;
                }
                
                if (!scholarship.organization) {
                    errors.push(`Row ${index + 2}: Missing organization`);
                    return;
                }
                
                scholarships.push(scholarship);
            } catch (error) {
                errors.push(`Row ${index + 2}: ${error.message}`);
            }
        });
        
        if (errors.length > 0) {
            console.error('Validation errors:');
            errors.forEach(error => console.error(error));
            
            if (errors.length === jsonData.length) {
                throw new Error('All rows failed validation');
            }
        }
        
        console.log(`${scholarships.length} scholarships ready for import`);
        
        // Batch insert to Supabase
        console.log('Uploading to Supabase...');
        
        const batchSize = 100;
        let successCount = 0;
        let failureCount = 0;
        
        for (let i = 0; i < scholarships.length; i += batchSize) {
            const batch = scholarships.slice(i, i + batchSize);
            
            try {
                const { data, error } = await supabase
                    .from('scholarships')
                    .insert(batch);
                
                if (error) {
                    console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
                    failureCount += batch.length;
                } else {
                    console.log(`Batch ${Math.floor(i / batchSize) + 1} uploaded successfully`);
                    successCount += batch.length;
                }
            } catch (error) {
                console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
                failureCount += batch.length;
            }
        }
        
        console.log('\n=== Upload Summary ===');
        console.log(`Total rows processed: ${jsonData.length}`);
        console.log(`Validation errors: ${errors.length}`);
        console.log(`Successful uploads: ${successCount}`);
        console.log(`Failed uploads: ${failureCount}`);
        
        return {
            totalRows: jsonData.length,
            validationErrors: errors.length,
            successCount,
            failureCount
        };
        
    } catch (error) {
        console.error('Error processing Excel file:', error);
        throw error;
    }
}

// Check if file path is provided
if (process.argv.length < 3) {
    console.error('Usage: node bulk-upload-scholarships.js <excel-file-path>');
    process.exit(1);
}

const filePath = process.argv[2];

// Run the import
processExcelFile(filePath)
    .then(result => {
        console.log('Import completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Import failed:', error);
        process.exit(1);
    });