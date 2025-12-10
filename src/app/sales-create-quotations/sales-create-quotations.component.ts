// src/app/sales-create-quotation/sales-create-quotation.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
}

interface QuotationItem {
  product: Product | null;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

@Component({
  selector: 'app-sales-create-quotation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-create-quotations.component.html',
  styleUrls: ['./sales-create-quotations.component.css']
})
export class SalesCreateQuotationComponent implements OnInit {
  // Customer Information
  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  customerAddress: string = '';

  // Quotation Details
  quoteNumber: string = '';
  quoteDate: Date = new Date();
  validUntil: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  // Products and Items
  availableProducts: Product[] = [
    { id: '1', name: '8-Floor Passenger Elevator', category: 'Passenger', price: 1500000, unit: 'Unit' },
    { id: '2', name: '5-Floor Home Lift', category: 'Home', price: 750000, unit: 'Unit' },
    { id: '3', name: '12-Floor Goods Elevator', category: 'Goods', price: 2200000, unit: 'Unit' },
    { id: '4', name: '6-Floor Hospital Elevator', category: 'Hospital', price: 1800000, unit: 'Unit' },
    { id: '5', name: 'Installation Service', category: 'Service', price: 150000, unit: 'Service' },
    { id: '6', name: 'Annual Maintenance Contract', category: 'Service', price: 50000, unit: 'Year' },
    { id: '7', name: 'Emergency Repair', category: 'Service', price: 25000, unit: 'Service' }
  ];

  quotationItems: QuotationItem[] = [
    {
      product: null,
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 18,
      total: 0
    }
  ];

  // Terms and Conditions
  termsAndConditions: string = `1. Payment Terms: 50% advance, 30% on installation, 20% on completion
2. Delivery Time: 60-90 days from order confirmation
3. Warranty: 12 months comprehensive warranty
4. Installation charges included
5. Annual maintenance contract optional`;

  notes: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.generateQuoteNumber();
  }

  generateQuoteNumber(): void {
    const timestamp = Date.now();
    this.quoteNumber = `QT-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}`;
  }

  addItem(): void {
    this.quotationItems.push({
      product: null,
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 18,
      total: 0
    });
  }

  removeItem(index: number): void {
    if (this.quotationItems.length > 1) {
      this.quotationItems.splice(index, 1);
    }
  }

  onProductChange(index: number): void {
    const item = this.quotationItems[index];
    if (item.product) {
      item.price = item.product.price;
      this.calculateItemTotal(index);
    }
  }

  calculateItemTotal(index: number): void {
    const item = this.quotationItems[index];
    const subtotal = item.quantity * item.price;
    const discountAmount = subtotal * (item.discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (item.tax / 100);
    item.total = taxableAmount + taxAmount;
  }

  get subtotal(): number {
    return this.quotationItems.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
  }

  get totalDiscount(): number {
    return this.quotationItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      return sum + (itemSubtotal * (item.discount / 100));
    }, 0);
  }

  get totalTax(): number {
    return this.quotationItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      const discountAmount = itemSubtotal * (item.discount / 100);
      const taxableAmount = itemSubtotal - discountAmount;
      return sum + (taxableAmount * (item.tax / 100));
    }, 0);
  }

  get grandTotal(): number {
    return this.quotationItems.reduce((sum, item) => sum + item.total, 0);
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  validateForm(): boolean {
    if (!this.customerName.trim()) {
      alert('Please enter customer name');
      return false;
    }
    if (!this.customerEmail.trim()) {
      alert('Please enter customer email');
      return false;
    }
    if (!this.customerPhone.trim()) {
      alert('Please enter customer phone');
      return false;
    }
    
    const hasValidItems = this.quotationItems.some(item => item.product !== null);
    if (!hasValidItems) {
      alert('Please add at least one product');
      return false;
    }

    return true;
  }

  preview(): void {
    if (this.validateForm()) {
      console.log('Preview Quotation:', this.getQuotationData());
      alert('Opening preview...');
      // Navigate to preview page with data
      this.router.navigate(['/quotations/preview'], { 
        state: { quotationData: this.getQuotationData() } 
      });
    }
  }

  saveAsDraft(): void {
    console.log('Saving as draft:', this.getQuotationData());
    alert('Quotation saved as draft successfully!');
    this.router.navigate(['/quotations']);
  }

  sendToClient(): void {
    if (this.validateForm()) {
      console.log('Sending to client:', this.getQuotationData());
      alert(`Quotation ${this.quoteNumber} sent to ${this.customerEmail} successfully!`);
      this.router.navigate(['/quotations']);
    }
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/quotations']);
    }
  }

  getQuotationData(): any {
    return {
      quoteNumber: this.quoteNumber,
      customer: {
        name: this.customerName,
        email: this.customerEmail,
        phone: this.customerPhone,
        address: this.customerAddress
      },
      quoteDate: this.quoteDate,
      validUntil: this.validUntil,
      items: this.quotationItems.filter(item => item.product !== null),
      subtotal: this.subtotal,
      totalDiscount: this.totalDiscount,
      totalTax: this.totalTax,
      grandTotal: this.grandTotal,
      termsAndConditions: this.termsAndConditions,
      notes: this.notes
    };
  }
}