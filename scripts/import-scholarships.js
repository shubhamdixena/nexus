const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Function to parse CSV and convert to our scholarship format
async function importScholarships(csvPath, outputPath) {
  const scholarships = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Extract amount from benefits text using regex
        const extractAmount = (benefitsText) => {
          const patterns = [
            /€([\d,]+)/,     // Euro
            /\$([\d,]+)/,    // Dollar
            /£([\d,]+)/,     // Pound
            /([\d,]+)\s*EUR/i, // EUR
            /([\d,]+)\s*USD/i, // USD
            /([\d,]+)\s*GBP/i  // GBP
          ];
          
          for (const pattern of patterns) {
            const match = benefitsText.match(pattern);
            if (match) {
              const amount = parseInt(match[1].replace(/,/g, ''));
              if (!isNaN(amount)) {
                return amount;
              }
            }
          }
          return null;
        };

        // Convert CSV row to our format
        const scholarship = {
          id: parseInt(row['No.']) || scholarships.length + 1,
          name: row['Scholarship Name'],
          host_country: row['Host Country'],
          host_organization: row['Host Organization'],
          level_of_study: row['Level of Study'],
          deadline: row['Latest Deadline (Approx.)'],
          eligibility_criteria: row['Eligibility Criteria (Key Points)'],
          benefits: row['Benefits (Key Points)'],
          fully_funded: row['Fully Funded?'],
          official_url: row['Official URL'],
          amount: extractAmount(row['Benefits (Key Points)']),
          description: `Scholarship offered by ${row['Host Organization']} for students pursuing ${row['Level of Study']} studies.`,
          applyUrl: row['Official URL'] // Use official URL as apply URL for now
        };

        scholarships.push(scholarship);
      })
      .on('end', () => {
        // Write to output file
        const outputData = {
          scholarships,
          metadata: {
            imported_at: new Date().toISOString(),
            total_count: scholarships.length,
            source: csvPath
          }
        };

        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
        console.log(`Successfully imported ${scholarships.length} scholarships to ${outputPath}`);
        resolve(scholarships);
      })
      .on('error', reject);
  });
}

// Main execution
async function main() {
  try {
    const csvPath = path.join(__dirname, '..', 'data for scholarship - Sheet1.csv');
    const outputPath = path.join(__dirname, '..', 'data', 'scholarships.json');
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    await importScholarships(csvPath, outputPath);
    
    console.log('Import completed successfully!');
    console.log('You can now use the scholarship data in your application.');
    
  } catch (error) {
    console.error('Error importing scholarships:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { importScholarships }; 