// src/app/features/quotations/quotation-preview/quotation-preview.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface QuotationItem {
  product: {
    name: string;
    category: string;
  };
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

interface Customer {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

interface QuotationData {
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  customer: Customer;
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  termsAndConditions: string;
  notes: string;
}

@Component({
  selector: 'app-quotation-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quotation-preview.component.html',
  styleUrls: ['./quotation-preview.component.css']
})
export class QuotationPreviewComponent implements OnInit {
  quotationData: QuotationData | null = null;

  companyInfo = {
    name: 'Capricorn Elevators',
    address: '11th floor, Jomer Symphony, Unit 03, Ponnurunni East, Vyttila, Ernakulam, Kerala 682019',
    phone: '075930 00222',
    website: 'capricornelevators.com',
    gst: 'GST123456789'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadQuotationData();
  }

  loadQuotationData(): void {
    // First try to get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const data = navigation.extras.state['quotationData'];
      if (data) {
        this.quotationData = data;
        return;
      }
    }

    // If no navigation state, try localStorage
    const savedData = localStorage.getItem('quotationPreview');
    if (savedData) {
      try {
        this.quotationData = JSON.parse(savedData);
      } catch (error) {
        console.error('Error loading quotation data:', error);
        alert('Error loading quotation data');
        this.router.navigate(['/quotations']);
      }
    } else {
      // No data found, redirect back
      alert('No quotation data found');
      this.router.navigate(['/quotations']);
    }
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  printQuotation(): void {
    window.print();
  }

  close(): void {
    this.router.navigate(['/quotations']);
  }

  calculateItemSubtotal(item: QuotationItem): number {
    return item.quantity * item.price;
  }

  calculateItemDiscount(item: QuotationItem): number {
    const subtotal = item.quantity * item.price;
    return subtotal * (item.discount / 100);
  }

  calculateItemTaxableAmount(item: QuotationItem): number {
    const subtotal = item.quantity * item.price;
    const discount = subtotal * (item.discount / 100);
    return subtotal - discount;
  }

  calculateItemTax(item: QuotationItem): number {
    const taxableAmount = this.calculateItemTaxableAmount(item);
    return taxableAmount * (item.tax / 100);
  }

  // NEW METHOD: Generate PDF from the preview page
  async generatePDF(): Promise<Blob> {
    const element = document.querySelector('.quotation-document') as HTMLElement;
    
    if (!element) {
      throw new Error('Quotation document element not found');
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF (handle multiple pages if needed)
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Return PDF as Blob
    return pdf.output('blob');
  }
}