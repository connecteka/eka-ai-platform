/**
 * EKA-AI MongoDB Schema
 * Converted from PostgreSQL (previous repo) to MongoDB collections
 * 
 * This file defines MongoDB collections with validation schemas
 * and indexes for the EKA-AI Platform
 */

// ============================================================
// USERS & AUTHENTICATION
// ============================================================

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "workshop_id", "role", "created_at"],
      properties: {
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        password_hash: { bsonType: "string" },
        name: { bsonType: "string" },
        phone: { bsonType: "string" },
        workshop_id: { bsonType: "objectId" },
        role: { enum: ["OWNER", "MANAGER", "TECHNICIAN", "FLEET_MANAGER", "ACCOUNTANT", "CUSTOMER"] },
        is_active: { bsonType: "bool" },
        last_login: { bsonType: "date" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "workshop_id": 1 });

// ============================================================
// WORKSHOPS
// ============================================================

db.createCollection("workshops", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "created_at"],
      properties: {
        name: { bsonType: "string" },
        legal_name: { bsonType: "string" },
        gstin: { bsonType: "string" },
        address: {
          bsonType: "object",
          properties: {
            street: { bsonType: "string" },
            city: { bsonType: "string" },
            state: { bsonType: "string" },
            pincode: { bsonType: "string" },
            country: { bsonType: "string" }
          }
        },
        phone: { bsonType: "string" },
        email: { bsonType: "string" },
        subscription_tier: { enum: ["FREE", "STARTER", "GROWTH", "ELITE"] },
        subscription_expires: { bsonType: "date" },
        settings: { bsonType: "object" },
        is_active: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.workshops.createIndex({ "gstin": 1 }, { unique: true, sparse: true });

// ============================================================
// JOB CARDS (Core Workshop Operations)
// ============================================================

db.createCollection("job_cards", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["job_card_number", "workshop_id", "status", "created_at"],
      properties: {
        job_card_number: { bsonType: "string" },
        workshop_id: { bsonType: "objectId" },
        vehicle_id: { bsonType: "objectId" },
        customer_id: { bsonType: "objectId" },
        
        // Status FSM: CREATED → CONTEXT_VERIFIED → DIAGNOSED → ESTIMATED → CUSTOMER_APPROVAL → IN_PROGRESS → PDI → INVOICED → CLOSED
        status: { 
          enum: ["CREATED", "CONTEXT_VERIFIED", "DIAGNOSED", "ESTIMATED", "CUSTOMER_APPROVAL", 
                 "IN_PROGRESS", "PDI", "PDI_COMPLETED", "INVOICED", "CLOSED", "CANCELLED", "CONCERN_RAISED"]
        },
        priority: { enum: ["LOW", "NORMAL", "HIGH", "CRITICAL"] },
        
        // Vehicle info (denormalized for quick access)
        vehicle_registration: { bsonType: "string" },
        vehicle_make: { bsonType: "string" },
        vehicle_model: { bsonType: "string" },
        vehicle_year: { bsonType: "int" },
        
        // Customer info (denormalized)
        customer_name: { bsonType: "string" },
        customer_phone: { bsonType: "string" },
        customer_email: { bsonType: "string" },
        
        // Job details
        symptoms: { bsonType: "array", items: { bsonType: "string" } },
        diagnosis: { bsonType: "object" },
        estimate: { bsonType: "object" },
        
        // Approval
        approval_status: { enum: ["pending", "approved", "rejected"] },
        approval_token: { bsonType: "string" },
        approval_expires_at: { bsonType: "date" },
        
        // Assignment
        technician_id: { bsonType: "objectId" },
        bay_number: { bsonType: "string" },
        promised_delivery: { bsonType: "date" },
        
        // Financial
        estimated_cost: { bsonType: "decimal" },
        final_cost: { bsonType: "decimal" },
        amount_paid: { bsonType: "decimal" },
        payment_status: { enum: ["pending", "partial", "paid"] },
        
        // Metadata
        created_by: { bsonType: "objectId" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
        closed_at: { bsonType: "date" }
      }
    }
  }
});

db.job_cards.createIndex({ "job_card_number": 1 }, { unique: true });
db.job_cards.createIndex({ "workshop_id": 1, "created_at": -1 });
db.job_cards.createIndex({ "status": 1 });
db.job_cards.createIndex({ "vehicle_registration": 1 });
db.job_cards.createIndex({ "customer_phone": 1 });

// ============================================================
// VEHICLES
// ============================================================

db.createCollection("vehicles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["registration_number", "created_at"],
      properties: {
        workshop_id: { bsonType: "objectId" },
        customer_id: { bsonType: "objectId" },
        job_card_id: { bsonType: "objectId" },
        
        registration_number: { bsonType: "string" },
        make: { bsonType: "string" },
        model: { bsonType: "string" },
        variant: { bsonType: "string" },
        year: { bsonType: "int" },
        fuel_type: { enum: ["PETROL", "DIESEL", "CNG", "LPG", "ELECTRIC", "HYBRID"] },
        transmission: { enum: ["MANUAL", "AUTOMATIC", "AMT", "CVT", "DCT"] },
        
        vin: { bsonType: "string" },
        engine_number: { bsonType: "string" },
        color: { bsonType: "string" },
        
        odometer_reading: { bsonType: "int" },
        last_service_date: { bsonType: "date" },
        last_service_km: { bsonType: "int" },
        
        insurance_valid_till: { bsonType: "date" },
        puc_valid_till: { bsonType: "date" },
        
        tyre_condition: { bsonType: "object" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.vehicles.createIndex({ "registration_number": 1 });
db.vehicles.createIndex({ "workshop_id": 1, "customer_id": 1 });

// ============================================================
// CUSTOMERS
// ============================================================

db.createCollection("customers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "phone", "created_at"],
      properties: {
        workshop_id: { bsonType: "objectId" },
        job_card_id: { bsonType: "objectId" },
        
        name: { bsonType: "string" },
        phone: { bsonType: "string" },
        email: { bsonType: "string" },
        address: { bsonType: "string" },
        
        total_visits: { bsonType: "int" },
        lifetime_value: { bsonType: "decimal" },
        rating: { bsonType: "int" },
        member_since: { bsonType: "date" },
        preferences: { bsonType: "array" },
        
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.customers.createIndex({ "phone": 1 });
db.customers.createIndex({ "workshop_id": 1, "created_at": -1 });

// ============================================================
// INVOICES (GST Compliant)
// ============================================================

db.createCollection("invoices", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["invoice_number", "workshop_id", "job_card_id", "total_amount", "created_at"],
      properties: {
        invoice_number: { bsonType: "string" },
        workshop_id: { bsonType: "objectId" },
        job_card_id: { bsonType: "objectId" },
        customer_id: { bsonType: "objectId" },
        
        // Invoice status
        status: { enum: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"] },
        
        // Line items
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              description: { bsonType: "string" },
              hsn_sac_code: { bsonType: "string" },
              quantity: { bsonType: "decimal" },
              unit_price: { bsonType: "decimal" },
              discount_amount: { bsonType: "decimal" },
              taxable_value: { bsonType: "decimal" },
              gst_rate: { bsonType: "decimal" },
              cgst_amount: { bsonType: "decimal" },
              sgst_amount: { bsonType: "decimal" },
              igst_amount: { bsonType: "decimal" },
              total_amount: { bsonType: "decimal" }
            }
          }
        },
        
        // Tax breakdown
        subtotal: { bsonType: "decimal" },
        discount_total: { bsonType: "decimal" },
        taxable_amount: { bsonType: "decimal" },
        cgst_total: { bsonType: "decimal" },
        sgst_total: { bsonType: "decimal" },
        igst_total: { bsonType: "decimal" },
        total_amount: { bsonType: "decimal" },
        
        // Payment
        amount_paid: { bsonType: "decimal" },
        balance_due: { bsonType: "decimal" },
        payment_mode: { bsonType: "string" },
        transaction_id: { bsonType: "string" },
        paid_on: { bsonType: "date" },
        
        // Due date
        invoice_date: { bsonType: "date" },
        due_date: { bsonType: "date" },
        
        // Notes
        notes: { bsonType: "string" },
        terms_conditions: { bsonType: "string" },
        
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.invoices.createIndex({ "invoice_number": 1 }, { unique: true });
db.invoices.createIndex({ "workshop_id": 1, "created_at": -1 });
db.invoices.createIndex({ "job_card_id": 1 });
db.invoices.createIndex({ "status": 1 });

// ============================================================
// MG FLEET CONTRACTS (Minimum Guarantee)
// ============================================================

db.createCollection("mg_contracts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["contract_number", "workshop_id", "customer_id", "assured_km", "rate_per_km", "created_at"],
      properties: {
        contract_number: { bsonType: "string" },
        workshop_id: { bsonType: "objectId" },
        customer_id: { bsonType: "objectId" },
        
        // Contract terms
        contract_type: { enum: ["FIXED_KM", "VARIABLE_KM", "HYBRID"] },
        assured_km: { bsonType: "decimal" },
        rate_per_km: { bsonType: "decimal" },
        
        // Vehicles under contract
        vehicles: {
          bsonType: "array",
          items: { bsonType: "objectId" }
        },
        
        // Dates
        start_date: { bsonType: "date" },
        end_date: { bsonType: "date" },
        
        // Billing
        billing_frequency: { enum: ["MONTHLY", "QUARTERLY", "ANNUALLY"] },
        
        // Status
        status: { enum: ["ACTIVE", "EXPIRED", "TERMINATED", "PENDING"] },
        
        terms_conditions: { bsonType: "string" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.mg_contracts.createIndex({ "contract_number": 1 }, { unique: true });
db.mg_contracts.createIndex({ "workshop_id": 1, "status": 1 });

// ============================================================
// MG VEHICLE LOGS (KM Tracking)
// ============================================================

db.createCollection("mg_vehicle_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["contract_id", "vehicle_id", "log_date", "opening_km", "closing_km", "created_at"],
      properties: {
        contract_id: { bsonType: "objectId" },
        vehicle_id: { bsonType: "objectId" },
        
        log_date: { bsonType: "date" },
        opening_km: { bsonType: "decimal" },
        closing_km: { bsonType: "decimal" },
        total_km: { bsonType: "decimal" },
        
        // Verification
        odometer_photo_url: { bsonType: "string" },
        gps_coordinates: { bsonType: "object" },
        verified_by: { bsonType: "objectId" },
        
        notes: { bsonType: "string" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.mg_vehicle_logs.createIndex({ "contract_id": 1, "log_date": -1 });
db.mg_vehicle_logs.createIndex({ "vehicle_id": 1, "log_date": -1 });

// ============================================================
// MG CALCULATION LOGS (Audit Trail)
// ============================================================

db.createCollection("mg_calculation_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["contract_id", "billing_period", "assured_km", "actual_km", "billable_km", "created_at"],
      properties: {
        contract_id: { bsonType: "objectId" },
        invoice_id: { bsonType: "objectId" },
        
        billing_period: { bsonType: "string" },  // "YYYY-MM"
        
        // Calculation inputs
        assured_km: { bsonType: "decimal" },
        actual_km: { bsonType: "decimal" },
        
        // Formula: MAX(assured_km, actual_km)
        billable_km: { bsonType: "decimal" },
        rate_per_km: { bsonType: "decimal" },
        base_amount: { bsonType: "decimal" },
        
        // Adjustments
        extra_km: { bsonType: "decimal" },
        extra_km_charges: { bsonType: "decimal" },
        discount_amount: { bsonType: "decimal" },
        
        // Final
        total_amount: { bsonType: "decimal" },
        
        // Audit
        calculation_formula: { bsonType: "string" },
        metadata: { bsonType: "object" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.mg_calculation_logs.createIndex({ "contract_id": 1, "billing_period": -1 });

// ============================================================
// JOB CARD TIMELINE (Audit Trail)
// ============================================================

db.createCollection("job_card_timeline", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["job_card_id", "timestamp", "description", "actor"],
      properties: {
        job_card_id: { bsonType: "string" },
        timestamp: { bsonType: "date" },
        description: { bsonType: "string" },
        actor: { bsonType: "string" },
        status: { bsonType: "string" },
        metadata: { bsonType: "object" }
      }
    }
  }
});

db.job_card_timeline.createIndex({ "job_card_id": 1, "timestamp": -1 });

// ============================================================
// AI GOVERNANCE LOGS
// ============================================================

db.createCollection("ai_governance_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["query_id", "timestamp"],
      properties: {
        query_id: { bsonType: "string" },
        user_id: { bsonType: "objectId" },
        workshop_id: { bsonType: "objectId" },
        
        query_text: { bsonType: "string" },
        
        // Governance results
        overall_result: { bsonType: "string" },
        overall_score: { bsonType: "double" },
        gates: { bsonType: "array" },
        final_action: { bsonType: "string" },
        
        timestamp: { bsonType: "date" }
      }
    }
  }
});

db.ai_governance_logs.createIndex({ "query_id": 1 });
db.ai_governance_logs.createIndex({ "workshop_id": 1, "timestamp": -1 });

// ============================================================
// SIGNATURES
// ============================================================

db.createCollection("signatures", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["job_card_id", "signature_image", "signed_at"],
      properties: {
        job_card_id: { bsonType: "string" },
        signature_image: { bsonType: "string" },  // Base64
        customer_name: { bsonType: "string" },
        verified_via: { enum: ["OTP", "AADHAAR", "MANUAL"] },
        otp_verified: { bsonType: "bool" },
        ip_address: { bsonType: "string" },
        signed_at: { bsonType: "date" }
      }
    }
  }
});

db.signatures.createIndex({ "job_card_id": 1 }, { unique: true });

// ============================================================
// FILES & DOCUMENTS
// ============================================================

db.createCollection("files", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["job_card_id", "filename", "url", "category", "uploaded_at"],
      properties: {
        job_card_id: { bsonType: "string" },
        filename: { bsonType: "string" },
        url: { bsonType: "string" },
        mime_type: { bsonType: "string" },
        size_bytes: { bsonType: "int" },
        category: { enum: ["vehicle_photo", "document", "signature", "invoice_pdf", "estimate_pdf"] },
        uploaded_by: { bsonType: "objectId" },
        uploaded_at: { bsonType: "date" }
      }
    }
  }
});

db.files.createIndex({ "job_card_id": 1, "category": 1 });

// ============================================================
// SERVICES (Job Card Line Items)
// ============================================================

db.createCollection("services", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["job_card_id", "service_type", "created_at"],
      properties: {
        job_card_id: { bsonType: "string" },
        service_type: { bsonType: "string" },
        description: { bsonType: "string" },
        technician: { bsonType: "string" },
        priority: { enum: ["low", "normal", "high", "urgent"] },
        status: { enum: ["queued", "in_progress", "completed", "on_hold"] },
        estimated_time: { bsonType: "string" },
        actual_time: { bsonType: "string" },
        cost: { bsonType: "decimal" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.services.createIndex({ "job_card_id": 1 });

// ============================================================
// PARTS (Job Card Line Items)
// ============================================================

db.createCollection("parts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["job_card_id", "name", "created_at"],
      properties: {
        job_card_id: { bsonType: "string" },
        name: { bsonType: "string" },
        part_number: { bsonType: "string" },
        category: { bsonType: "string" },
        quantity: { bsonType: "string" },
        unit_price: { bsonType: "decimal" },
        total: { bsonType: "decimal" },
        warranty: { bsonType: "string" },
        availability: { enum: ["in-stock", "out-of-stock", "ordered"] },
        availability_note: { bsonType: "string" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.parts.createIndex({ "job_card_id": 1 });

// ============================================================
// SUBSCRIPTIONS & BILLING
// ============================================================

db.createCollection("subscriptions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["workshop_id", "tier", "status", "created_at"],
      properties: {
        workshop_id: { bsonType: "objectId" },
        tier: { enum: ["FREE", "STARTER", "GROWTH", "ELITE"] },
        status: { enum: ["ACTIVE", "CANCELLED", "EXPIRED", "PENDING"] },
        
        // Billing period
        current_period_start: { bsonType: "date" },
        current_period_end: { bsonType: "date" },
        
        // Usage limits
        ai_chat_queries_limit: { bsonType: "int" },
        ai_chat_queries_used: { bsonType: "int" },
        
        // Payment
        stripe_subscription_id: { bsonType: "string" },
        stripe_customer_id: { bsonType: "string" },
        
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.subscriptions.createIndex({ "workshop_id": 1 }, { unique: true });

// ============================================================
// AUDIT LOGS
// ============================================================

db.createCollection("audit_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["timestamp", "action", "entity_type", "entity_id"],
      properties: {
        timestamp: { bsonType: "date" },
        user_id: { bsonType: "objectId" },
        workshop_id: { bsonType: "objectId" },
        action: { bsonType: "string" },  // CREATE, UPDATE, DELETE, VIEW
        entity_type: { bsonType: "string" },  // job_card, invoice, etc.
        entity_id: { bsonType: "string" },
        old_values: { bsonType: "object" },
        new_values: { bsonType: "object" },
        ip_address: { bsonType: "string" },
        user_agent: { bsonType: "string" }
      }
    }
  }
});

db.audit_logs.createIndex({ "workshop_id": 1, "timestamp": -1 });
db.audit_logs.createIndex({ "entity_type": 1, "entity_id": 1 });

// Print summary
print("MongoDB Schema Created Successfully!");
print("Collections:");
print("- users, workshops");
print("- job_cards, vehicles, customers");
print("- invoices, services, parts");
print("- mg_contracts, mg_vehicle_logs, mg_calculation_logs");
print("- signatures, files, job_card_timeline");
print("- ai_governance_logs, subscriptions, audit_logs");
