// src/app/services/quotation.service.ts (FRONTEND)
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface QuotationItem {
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

export interface CreateQuotationPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  address?: string;
  elevationType: string;
  numberOfFloors: number;
  doorConfiguration: string;
  numberOfElevators: number;
  speed: string;
  capacity: string;
  driveType: string;
  controlSystem: string;
  includeInstallation?: boolean;
  includeAMC?: boolean;
  amcYears?: number;
  specialRequirements?: string;
  internalNotes?: string;
  baseCost: number;
  installationCost?: number;
  amcCost?: number;
  cgst?: number;
  sgst?: number;
  totalCost: number;
  items?: QuotationItem[];
  termsAndConditions?: string;
  notes?: string;
  status?: string;
}

export interface Quotation {
  _id?: string;
  id?: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  companyName?: string;
  quoteDate: string;
  validUntil: string;
  elevationType: string;
  numberOfFloors: number;
  speed: string;
  capacity: string;
  baseCost: number;
  installationCost: number;
  amcCost: number;
  totalCost: number;
  totalAmount: number;
  status: string;
  createdAt?: Date;
  createdDate?: Date;
  createdBy?: string;
  items?: QuotationItem[];
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  specialRequirements?: string;
}

export interface QuotationResponse {
  statusCode: number;
  message: string;
  data: Quotation | Quotation[];
}

export interface QuotationStats {
  draft: { count: number; totalValue: number };
  sent: { count: number; totalValue: number };
  approved: { count: number; totalValue: number };
  rejected: { count: number; totalValue: number };
  overallTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private apiUrl = 'http://localhost:3000/api/quotation';

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  private getHeadersWithUser(): HttpHeaders {
    const currentUser = this.authService.currentUserValue;
    const userId = currentUser?.userId || '';
    const userRole = currentUser?.role || '';

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-role': userRole
    });
  }

  createQuotation(quotationData: CreateQuotationPayload): Observable<QuotationResponse> {
    const headers = this.getHeadersWithUser();
    return this.http.post<QuotationResponse>(this.apiUrl, quotationData, { headers });
  }

  getAllQuotations(status?: string, search?: string): Observable<QuotationResponse> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }
    
    const headers = this.getHeadersWithUser();
    return this.http.get<QuotationResponse>(this.apiUrl, { params, headers });
  }

  getQuotationById(id: string): Observable<QuotationResponse> {
    return this.http.get<QuotationResponse>(`${this.apiUrl}/${id}`);
  }

  updateQuotation(id: string, quotationData: Partial<CreateQuotationPayload>): Observable<QuotationResponse> {
    return this.http.put<QuotationResponse>(`${this.apiUrl}/${id}`, quotationData);
  }

  updateQuotationStatus(id: string, status: string): Observable<QuotationResponse> {
    return this.http.patch<QuotationResponse>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteQuotation(id: string): Observable<QuotationResponse> {
    return this.http.delete<QuotationResponse>(`${this.apiUrl}/${id}`);
  }

  getStatsSummary(): Observable<{ statusCode: number; message: string; data: QuotationStats }> {
    return this.http.get<{ statusCode: number; message: string; data: QuotationStats }>(
      `${this.apiUrl}/stats/summary`
    );
  }

  // NEW METHOD: Send quotation with PDF generation
  sendQuotationWithPDF(quotationId: string, email: string, quotationData: any): Observable<any> {
    const headers = this.getHeadersWithUser();
    const payload = {
      email: email,
      quotationData: quotationData
    };
    return this.http.post(`${this.apiUrl}/${quotationId}/send-pdf`, payload, { headers });
  }

  convertToDeal(quotationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${quotationId}/convert-to-deal`, {});
  }

  formatQuotationForBackend(formData: any): CreateQuotationPayload {
    const items = formData.items || [];
    
    const baseCost = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.price);
    }, 0);

    const totalDiscount = items.reduce((sum: number, item: any) => {
      const itemSubtotal = item.quantity * item.price;
      return sum + (itemSubtotal * (item.discount / 100));
    }, 0);

    const taxableAmount = baseCost - totalDiscount;
    
    const totalTax = items.reduce((sum: number, item: any) => {
      const itemSubtotal = item.quantity * item.price;
      const discountAmount = itemSubtotal * (item.discount / 100);
      const itemTaxable = itemSubtotal - discountAmount;
      return sum + (itemTaxable * (item.tax / 100));
    }, 0);

    const totalCost = taxableAmount + totalTax;

    return {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      companyName: formData.customerCompany || '',
      address: formData.customerAddress || '',
      elevationType: items[0]?.product?.category?.toLowerCase() || 'commercial elevator',
      numberOfFloors: formData.floors || 1,
      doorConfiguration: '1 door',
      numberOfElevators: 1,
      speed: formData.speed || '1.0 m/s',
      capacity: formData.capacity || '8',
      driveType: 'variable frequency drive',
      controlSystem: 'microprocessor based',
      includeInstallation: formData.includeInstallation || false,
      includeAMC: formData.includeAMC || false,
      amcYears: formData.amcYears || 1,
      specialRequirements: formData.notes || '',
      internalNotes: formData.termsAndConditions || '',
      baseCost: baseCost,
      installationCost: formData.installationCost || 0,
      amcCost: formData.amcCost || 0,
      cgst: totalTax / 2,
      sgst: totalTax / 2,
      totalCost: totalCost,
      items: items,
      termsAndConditions: formData.termsAndConditions,
      notes: formData.notes
    };
  }

  formatQuotationForFrontend(backendData: any): Quotation {
    return {
      id: backendData._id || backendData.id,
      _id: backendData._id,
      quoteNumber: backendData.quoteNumber,
      customerName: backendData.customerName,
      customerEmail: backendData.customerEmail,
      customerPhone: backendData.customerPhone,
      customerCompany: backendData.companyName,
      companyName: backendData.companyName,
      quoteDate: backendData.createdAt || new Date().toISOString(),
      validUntil: backendData.validUntil,
      elevationType: backendData.elevationType,
      numberOfFloors: backendData.numberOfFloors,
      speed: backendData.speed,
      capacity: backendData.capacity,
      baseCost: backendData.baseCost,
      installationCost: backendData.installationCost || 0,
      amcCost: backendData.amcCost || 0,
      totalCost: backendData.totalCost,
      totalAmount: backendData.totalCost,
      status: backendData.status,
      createdDate: backendData.createdAt ? new Date(backendData.createdAt) : new Date(),
      createdBy: backendData.createdBy,
      items: backendData.items,
      termsAndConditions: backendData.internalNotes,
      notes: backendData.specialRequirements
    };
  }
}