// src/app/features/leads/sales-add-lead/sales-add-lead.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface LeadDraft {
  basicInfo: {
    name: string;
    company: string;
    designation: string;
    source: string;
    priority: string;
  };
  contactDetails: {
    email: string;
    phone: string;
    alternatePhone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  requirements: {
    productInterest: string;
    budget: string;
    timeline: string;
    quantity: string;
    specifications: string;
  };
  notes: {
    description: string;
    tags: string[];
    attachments: File[];
  };
}

@Component({
  selector: 'app-sales-add-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-add-leads.component.html',  // ✅ CORRECT (with 's')
  styleUrls: ['./sales-add-leads.component.css']    // ✅ CORRECT (with 's')
})

export class SalesAddLeadComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 4;
  isEditMode: boolean = false;
  leadId: string | null = null;
  isSaving: boolean = false;
  lastSaved: Date | null = null;
  
  leadDraft: LeadDraft = {
    basicInfo: {
      name: '',
      company: '',
      designation: '',
      source: '',
      priority: 'medium'
    },
    contactDetails: {
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    requirements: {
      productInterest: '',
      budget: '',
      timeline: '',
      quantity: '',
      specifications: ''
    },
    notes: {
      description: '',
      tags: [],
      attachments: []
    }
  };

  // Validation errors
  errors: any = {
    basicInfo: {},
    contactDetails: {},
    requirements: {},
    notes: {}
  };

  // Dropdown options
  sourceOptions = ['Website', 'Walk-in', 'Reference', 'Phone Call', 'Email', 'Social Media', 'Exhibition'];
  priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];
  stateOptions = ['Kerala', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Gujarat', 'Other'];
  timelineOptions = ['Immediate', 'Within 1 Month', '1-3 Months', '3-6 Months', '6+ Months'];
  
  currentTag: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if edit mode
    this.leadId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.leadId;

    if (this.isEditMode) {
      this.loadLeadData(this.leadId!);
    } else {
      this.loadDraft();
    }

    // Auto-save every 30 seconds
    setInterval(() => {
      this.autoSaveDraft();
    }, 30000);
  }

  loadLeadData(id: string): void {
    // TODO: Replace with actual API call
    console.log('Loading lead data for ID:', id);
    // Mock data for edit mode
    this.leadDraft = {
      basicInfo: {
        name: 'John Smith',
        company: 'ABC Corporation',
        designation: 'Purchase Manager',
        source: 'Website',
        priority: 'high'
      },
      contactDetails: {
        email: 'john@example.com',
        phone: '+91 9876543210',
        alternatePhone: '+91 9876543211',
        address: '123 Business Street',
        city: 'Kochi',
        state: 'Kerala',
        pincode: '682001'
      },
      requirements: {
        productInterest: 'Industrial Equipment',
        budget: '500000',
        timeline: 'Within 1 Month',
        quantity: '10',
        specifications: 'Heavy duty equipment required'
      },
      notes: {
        description: 'Very interested customer, follow up weekly',
        tags: ['hot-lead', 'industrial'],
        attachments: []
      }
    };
  }

  loadDraft(): void {
    const draft = localStorage.getItem('lead_draft');
    if (draft) {
      this.leadDraft = JSON.parse(draft);
      const savedTime = localStorage.getItem('lead_draft_time');
      if (savedTime) {
        this.lastSaved = new Date(savedTime);
      }
    }
  }

  autoSaveDraft(): void {
    if (!this.isEditMode && this.hasAnyData()) {
      localStorage.setItem('lead_draft', JSON.stringify(this.leadDraft));
      localStorage.setItem('lead_draft_time', new Date().toISOString());
      this.lastSaved = new Date();
      console.log('Draft auto-saved');
    }
  }

  hasAnyData(): boolean {
    return this.leadDraft.basicInfo.name !== '' || 
           this.leadDraft.basicInfo.company !== '' ||
           this.leadDraft.contactDetails.email !== '' ||
           this.leadDraft.contactDetails.phone !== '';
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.autoSaveDraft();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || this.validateSteps(step - 1)) {
      this.currentStep = step;
    }
  }

  validateCurrentStep(): boolean {
    this.errors = { basicInfo: {}, contactDetails: {}, requirements: {}, notes: {} };
    
    switch (this.currentStep) {
      case 1:
        return this.validateBasicInfo();
      case 2:
        return this.validateContactDetails();
      case 3:
        return this.validateRequirements();
      case 4:
        return true; // Notes are optional
      default:
        return true;
    }
  }

  validateSteps(upToStep: number): boolean {
    for (let i = 1; i <= upToStep; i++) {
      this.currentStep = i;
      if (!this.validateCurrentStep()) {
        return false;
      }
    }
    return true;
  }

  validateBasicInfo(): boolean {
    let isValid = true;

    if (!this.leadDraft.basicInfo.name.trim()) {
      this.errors.basicInfo.name = 'Name is required';
      isValid = false;
    }

    if (!this.leadDraft.basicInfo.company.trim()) {
      this.errors.basicInfo.company = 'Company name is required';
      isValid = false;
    }

    if (!this.leadDraft.basicInfo.source) {
      this.errors.basicInfo.source = 'Lead source is required';
      isValid = false;
    }

    return isValid;
  }

  validateContactDetails(): boolean {
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.leadDraft.contactDetails.email.trim()) {
      this.errors.contactDetails.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(this.leadDraft.contactDetails.email)) {
      this.errors.contactDetails.email = 'Invalid email format';
      isValid = false;
    }

    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!this.leadDraft.contactDetails.phone.trim()) {
      this.errors.contactDetails.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(this.leadDraft.contactDetails.phone)) {
      this.errors.contactDetails.phone = 'Invalid phone number';
      isValid = false;
    }

    return isValid;
  }

  validateRequirements(): boolean {
    let isValid = true;

    if (!this.leadDraft.requirements.productInterest.trim()) {
      this.errors.requirements.productInterest = 'Product interest is required';
      isValid = false;
    }

    if (!this.leadDraft.requirements.timeline) {
      this.errors.requirements.timeline = 'Timeline is required';
      isValid = false;
    }

    return isValid;
  }

  addTag(): void {
    if (this.currentTag.trim() && !this.leadDraft.notes.tags.includes(this.currentTag.trim())) {
      this.leadDraft.notes.tags.push(this.currentTag.trim());
      this.currentTag = '';
    }
  }

  removeTag(tag: string): void {
    this.leadDraft.notes.tags = this.leadDraft.notes.tags.filter(t => t !== tag);
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.leadDraft.notes.attachments.push(files[i]);
      }
    }
  }

  removeAttachment(index: number): void {
    this.leadDraft.notes.attachments.splice(index, 1);
  }

  saveLead(): void {
    if (this.validateCurrentStep()) {
      this.isSaving = true;
      
      // TODO: Replace with actual API call
      setTimeout(() => {
        console.log('Saving lead:', this.leadDraft);
        
        // Clear draft from localStorage
        localStorage.removeItem('lead_draft');
        localStorage.removeItem('lead_draft_time');
        
        this.isSaving = false;
        
        // Show success message
        alert(this.isEditMode ? 'Lead updated successfully!' : 'Lead created successfully!');
        
        // Navigate back to leads list
        this.router.navigate(['/leads']);
      }, 1000);
    }
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      localStorage.removeItem('lead_draft');
      localStorage.removeItem('lead_draft_time');
      this.router.navigate(['/leads']);
    }
  }

  clearDraft(): void {
    if (confirm('Are you sure you want to clear the draft?')) {
      localStorage.removeItem('lead_draft');
      localStorage.removeItem('lead_draft_time');
      this.lastSaved = null;
      
      // Reset form
      this.leadDraft = {
        basicInfo: { name: '', company: '', designation: '', source: '', priority: 'medium' },
        contactDetails: { email: '', phone: '', alternatePhone: '', address: '', city: '', state: '', pincode: '' },
        requirements: { productInterest: '', budget: '', timeline: '', quantity: '', specifications: '' },
        notes: { description: '', tags: [], attachments: [] }
      };
      
      this.currentStep = 1;
    }
  }

  getStepClass(step: number): string {
    if (step === this.currentStep) return 'active';
    if (step < this.currentStep) return 'completed';
    return '';
  }
}