// src/app/features/leads/sales-import-leads/sales-import-leads.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ParsedData {
  [key: string]: string;
}

interface ImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
}

@Component({
  selector: 'app-sales-import-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-import-leads.component.html',
  styleUrls: ['./sales-import-leads.component.css']
})
export class SalesImportLeadsComponent {
  selectedFile: File | null = null;
  isProcessing: boolean = false;
  isImporting: boolean = false;
  previewData: ParsedData[] = [];
  fullData: ParsedData[] = [];
  fileColumns: string[] = [];
  importResult: ImportResult | null = null;
  showImportResult: boolean = false;

  allowedFileTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];

  constructor(private router: Router) {}

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      // Validate file type
      if (!this.allowedFileTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        alert('Please upload a valid Excel (.xlsx, .xls) or CSV file');
        event.target.value = '';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        event.target.value = '';
        return;
      }

      this.selectedFile = file;
      this.parseFile(file);
    }
  }

  parseFile(file: File): void {
    this.isProcessing = true;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const content = e.target.result;
      
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        this.parseCSV(content);
      } else {
        alert('Excel parsing requires xlsx library. Please use CSV for now.');
        this.isProcessing = false;
        this.selectedFile = null;
      }
    };

    reader.onerror = () => {
      alert('Error reading file');
      this.isProcessing = false;
      this.selectedFile = null;
    };

    reader.readAsText(file);
  }

  parseCSV(content: string): void {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      alert('File is empty');
      this.isProcessing = false;
      this.selectedFile = null;
      return;
    }

    if (lines.length < 2) {
      alert('File must contain at least header row and one data row');
      this.isProcessing = false;
      this.selectedFile = null;
      return;
    }

    // Extract headers (first row)
    this.fileColumns = this.parseCSVLine(lines[0]);

    // Parse all data
    this.fullData = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      
      if (values.length === 0 || values.every(v => v === '')) {
        continue; // Skip empty rows
      }
      
      const row: ParsedData = {};
      this.fileColumns.forEach((col, index) => {
        row[col] = values[index] || '';
      });
      
      this.fullData.push(row);
    }

    // Get preview data (first 10 rows)
    this.previewData = this.fullData.slice(0, 10);

    if (this.fullData.length === 0) {
      alert('No data rows found in file');
      this.isProcessing = false;
      this.selectedFile = null;
      return;
    }

    this.isProcessing = false;
  }

  parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  importLeads(): void {
    if (!this.selectedFile || this.fullData.length === 0) {
      alert('No data to import');
      return;
    }

    this.isImporting = true;

    // Simulate import process
    setTimeout(() => {
      const totalRows = this.fullData.length;
      const errors: string[] = [];
      
      // Basic validation
      this.fullData.forEach((row, index) => {
        const rowNum = index + 2; // +2 for 0-index and header
        
        // Check if row has any data
        const hasData = Object.values(row).some(val => val && val.trim() !== '');
        if (!hasData) {
          errors.push(`Row ${rowNum}: Empty row`);
        }
      });

      const failedImports = errors.length;
      const successfulImports = totalRows - failedImports;

      this.importResult = {
        totalRows,
        successfulImports,
        failedImports,
        errors
      };

      this.showImportResult = true;
      this.isImporting = false;

      // Show success message
      if (successfulImports > 0) {
        alert(`Successfully imported ${successfulImports} lead(s)`);
      }
    }, 2000);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileColumns = [];
    this.previewData = [];
    this.fullData = [];
    this.importResult = null;
    this.showImportResult = false;
  }

  startNewImport(): void {
    this.removeFile();
  }

  goToLeads(): void {
    this.router.navigate(['/leads']);
  }

  downloadTemplate(): void {
    const headers = [
      'Name', 'Email', 'Phone', 'Company', 'Designation', 
      'Source', 'Priority', 'Address', 'City', 'State', 
      'Pincode', 'Product Interest', 'Budget', 'Notes'
    ];
    
    const sampleData = [
      [
        'John Doe', 
        'john@example.com', 
        '+91 9876543210', 
        'ABC Corp', 
        'Manager',
        'Website', 
        'High', 
        '123 Street', 
        'Mumbai', 
        'Maharashtra',
        '400001', 
        'Industrial Equipment', 
        '500000', 
        'Interested in bulk order'
      ],
      [
        'Jane Smith',
        'jane@company.com',
        '+91 9876543211',
        'XYZ Ltd',
        'Director',
        'Referral',
        'Medium',
        '456 Avenue',
        'Delhi',
        'Delhi',
        '110001',
        'Office Supplies',
        '250000',
        'Looking for regular supply'
      ]
    ];

    const csvContent = headers.join(',') + '\n' + 
      sampleData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lead_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}