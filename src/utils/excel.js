import * as XLSX from 'xlsx';

const COMMON_HEADERS = [
  'name', 'names', 'full name', 'first name', 'student', 'students',
  'student name', 'student names', 'participant', 'participants',
  'entry', 'entries', 'item', 'items', 'list', 'member', 'members'
];

/**
 * Parses an Excel file (.xlsx, .xls) and extracts valid entries.
 * @param {File} file
 * @returns {Promise<string[]>}
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          return resolve([]);
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

        if (!rows || rows.length === 0) return resolve([]);

        // Determine if row 0 is a header row
        let startIndex = 0;
        if (rows.length > 1) {
          const firstRow = rows[0];
          if (Array.isArray(firstRow) && firstRow.length > 0) {
            const firstCell = String(firstRow[0] || '').toLowerCase().trim();
            const isHeaderMatch = COMMON_HEADERS.includes(firstCell) || 
              (firstRow.length > 1 && COMMON_HEADERS.some(h => firstCell === h || firstCell.startsWith(h + ' ')));
            if (isHeaderMatch) {
              startIndex = 1;
            }
          }
        }

        const entries = [];
        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i];
          if (!Array.isArray(row)) continue;

          // Filter out null, undefined, empty cells
          const validCells = row
            .filter(cell => cell !== null && cell !== undefined)
            .map(cell => String(cell).trim())
            .filter(str => str.length > 0);

          if (validCells.length === 1) {
            entries.push(validCells[0]);
          } else if (validCells.length > 1) {
            // If only 1 cell is non-numeric (e.g. Name + Score), extract that
            const nonNumeric = validCells.filter(c => isNaN(Number(c)));
            if (nonNumeric.length === 1) {
              entries.push(nonNumeric[0]);
            } else if (nonNumeric.length > 1) {
              // Join multiple text columns (e.g. First Name + Last Name)
              entries.push(nonNumeric.join(' '));
            } else {
              entries.push(validCells.join(' '));
            }
          }
        }

        resolve(entries);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
