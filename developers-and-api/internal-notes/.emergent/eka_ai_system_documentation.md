# 🤖 EKA-AI SYSTEM DOCUMENTATION
## Complete AI Architecture, Governance & Response Patterns

**Project:** EKA-AI Platform by Go4Garage Private Limited  
**Purpose:** Document AI behavior, governance rules, input/output processing  
**Version:** 1.0  
**Date:** February 2026

---

# 📚 TABLE OF CONTENTS

1. [AI Architecture Overview](#1-ai-architecture-overview)
2. [4-Layer Governance System](#2-4-layer-governance-system)
3. [Input Processing Pipeline](#3-input-processing-pipeline)
4. [Output Formatting & Response Patterns](#4-output-formatting--response-patterns)
5. [System Prompt & Rules](#5-system-prompt--rules)
6. [Intelligence Modes](#6-intelligence-modes)
7. [Domain-Specific Behaviors](#7-domain-specific-behaviors)
8. [Testing AI Responses](#8-testing-ai-responses)
9. [Error Handling & Fallbacks](#9-error-handling--fallbacks)
10. [Emergent Testing Commands](#10-emergent-testing-commands)

---

# 1. AI ARCHITECTURE OVERVIEW

## 1.1 System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER QUERY INPUT                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INPUT PROCESSING LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Vehicle    │  │   Query      │  │   Context    │               │
│  │  Extractor   │  │ Classifier   │  │   Builder    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   GOVERNANCE LAYER (4-Gate)                          │
│  ┌──────────┐ → ┌──────────┐ → ┌──────────┐ → ┌──────────┐         │
│  │  Domain  │ → │Confidence│ → │ Context  │ → │ Permission│         │
│  │   Gate   │ → │   Gate   │ → │   Gate   │ → │   Gate    │         │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     LLM PROCESSING LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │              Gemini Pro / Flash / RAG Agent               │       │
│  │         (Selected based on Intelligence Mode)             │       │
│  └──────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    OUTPUT FORMATTING LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Pricing    │  │   Table      │  │   Safety     │               │
│  │  Validator   │  │  Formatter   │  │   Filter     │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RESPONSE OUTPUT                               │
└─────────────────────────────────────────────────────────────────────┘
```

## 1.2 Data Flow

| Stage | Processing Time | Description |
|-------|-----------------|-------------|
| Input Parsing | < 100ms | Extract vehicle details, classify intent |
| Governance Check | < 50ms | 4-layer validation |
| LLM Call | 500ms - 3s | Based on mode (Flash/Pro/RAG) |
| Output Formatting | < 100ms | Apply safety filters, format tables |
| **Total** | **1s - 4s** | End-to-end response time |

---

# 2. 4-LAYER GOVERNANCE SYSTEM

## 2.1 Layer 1: Domain Gate

**Purpose:** Block non-automobile queries

### Implementation
```python
# /backend/services/ai_governance.py

def domain_gate_check(query: str) -> Tuple[bool, str]:
    """
    Validates if query is automobile-related.
    Returns: (is_valid, rejection_message)
    """
    automobile_keywords = [
        # Vehicle types
        'car', 'bike', 'scooter', 'truck', 'bus', 'suv', 'sedan', 
        'hatchback', 'motorcycle', 'van', 'tempo', 'auto', 'rickshaw',
        
        # Brands
        'maruti', 'suzuki', 'toyota', 'honda', 'hyundai', 'tata', 
        'mahindra', 'ford', 'volkswagen', 'skoda', 'bmw', 'mercedes',
        'audi', 'kia', 'mg', 'citroen', 'jeep', 'nissan', 'renault',
        
        # Parts
        'engine', 'brake', 'clutch', 'gearbox', 'transmission', 'battery',
        'tyre', 'tire', 'wheel', 'suspension', 'steering', 'ac', 'coolant',
        'oil', 'filter', 'spark plug', 'injector', 'pump', 'radiator',
        
        # Issues
        'noise', 'vibration', 'overheating', 'starting', 'pickup',
        'mileage', 'smoke', 'leak', 'warning light', 'check engine',
        'dtc', 'error code', 'diagnostic',
        
        # Services
        'service', 'repair', 'maintenance', 'washing', 'polishing',
        'denting', 'painting', 'tuning', 'alignment', 'balancing',
        
        # General
        'workshop', 'garage', 'mechanic', 'spare parts', 'accessories',
        'insurance', 'rc', 'registration', 'pollution', 'puc'
    ]
    
    query_lower = query.lower()
    
    # Check for automobile keywords
    has_auto_keyword = any(kw in query_lower for kw in automobile_keywords)
    
    # Allow general greetings and platform questions
    allowed_general = ['hello', 'hi', 'eka', 'help', 'what can you do']
    is_general = any(g in query_lower for g in allowed_general)
    
    if has_auto_keyword or is_general:
        return True, ""
    
    return False, """
⚠️ **Domain Restriction**

I'm EKA, your automobile repair assistant. I can only help with:
- 🚗 Vehicle repairs and diagnostics
- 🔧 Spare parts and maintenance
- 💰 Repair cost estimates
- 📋 Workshop management

**Please ask me about:**
- "Why is my car making noise?"
- "What does check engine light mean?"
- "Estimate for brake pad replacement"
- "Swift 2022 service schedule"
"""
```

### Test Cases
| Input | Expected Output |
|-------|-----------------|
| "My car is making noise" | ✅ Pass - Automobile query |
| "Brake pad replacement cost" | ✅ Pass - Auto parts query |
| "What's the weather today?" | ❌ Block - Non-auto query |
| "Hello EKA" | ✅ Pass - Greeting allowed |
| "Python programming help" | ❌ Block - Non-auto query |

---

## 2.2 Layer 2: Confidence Gate

**Purpose:** Ensure AI confidence >= 90% before giving definitive answers

### Implementation
```python
def confidence_gate_check(
    confidence_score: float,
    vehicle_info: dict,
    query_type: str
) -> Tuple[bool, str, str]:
    """
    Checks if confidence is sufficient or needs clarification.
    Returns: (proceed, response_type, message)
    """
    
    # Extracted vehicle info completeness
    has_make = vehicle_info.get('make') is not None
    has_model = vehicle_info.get('model') is not None
    has_year = vehicle_info.get('year') is not None
    has_variant = vehicle_info.get('variant') is not None
    
    completeness_score = sum([has_make, has_model, has_year, has_variant])
    
    # High confidence + complete info = Proceed
    if confidence_score >= 0.90 and completeness_score >= 3:
        return True, "direct", ""
    
    # Medium confidence = Provide with disclaimer
    if confidence_score >= 0.75:
        return True, "with_disclaimer", """
⚠️ **Medium Confidence Response**

Based on available information, here are possible causes:
[List causes with probability %]

**For accurate diagnosis, please provide:**
- Exact vehicle variant
- When does the issue occur? (cold start, acceleration, braking)
- Any recent repairs or modifications?
"""
    
    # Low confidence = Ask clarifying questions
    return False, "clarification", """
❓ **Need More Information**

To help you accurately, I need more details:

**Vehicle Information:**
{missing_vehicle_info}

**Issue Details:**
1. When did the problem start?
2. When does it occur? (e.g., morning start, highway driving)
3. Any warning lights on dashboard?
4. Recent service history?

**Or share:**
- Vehicle photo
- OBD scan report
- Service records
"""
```

### Confidence Matrix
| Confidence | Action | User Sees |
|------------|--------|-----------|
| >= 90% | Direct answer | Full response with recommendations |
| 75-89% | Answer + Disclaimer | Response with "may need inspection" warning |
| 50-74% | Partial answer + Questions | Possible causes list + clarification questions |
| < 50% | Questions only | "I need more information..." |

---

## 2.3 Layer 3: Context Gate

**Purpose:** Ensure sufficient vehicle context before diagnosis

### Implementation
```python
def context_gate_check(
    query: str,
    extracted_vehicle: dict,
    session_history: list
) -> Tuple[bool, str]:
    """
    Validates if enough context exists for the query type.
    """
    
    # Query types that need full vehicle info
    HEAVY_QUERIES = [
        'diagnosis', 'estimate', 'parts_recommendation',
        'service_schedule', 'compatibility'
    ]
    
    # Query types that work with partial info
    LIGHT_QUERIES = [
        'general_advice', 'explanation', 'process_query',
        'pricing_range', 'availability'
    ]
    
    query_classification = classify_query(query)
    
    # Check if we have minimum vehicle context
    minimum_context = extracted_vehicle.get('make') and extracted_vehicle.get('model')
    
    if query_classification in HEAVY_QUERIES and not minimum_context:
        return False, """
🚗 **Vehicle Information Required**

For accurate {query_type}, I need to know:

**Required:**
- Vehicle make (e.g., Maruti, Toyota, Honda)
- Vehicle model (e.g., Swift, Innova, City)

**Optional but helpful:**
- Year of manufacture
- Variant (e.g., VXI, ZX, Diesel)
- Current odometer reading

**Example queries:**
- "Maruti Swift 2020 brake issue"
- "Toyota Innova Crysta diesel service cost"
- "Honda City 2019 clutch replacement"
"""
    
    # Check session continuity
    if len(session_history) > 0:
        last_vehicle = session_history[-1].get('vehicle')
        current_vehicle = extracted_vehicle
        
        # Warn if switching vehicles mid-conversation
        if (last_vehicle and current_vehicle and 
            last_vehicle.get('make') != current_vehicle.get('make')):
            return True, """
⚠️ **Vehicle Context Switch Detected**

Previously discussing: {last_vehicle_name}
Now asking about: {current_vehicle_name}

Confirming: Are we now discussing the {current_vehicle_name}?
"""
    
    return True, ""
```

---

## 2.4 Layer 4: Permission Gate

**Purpose:** Enforce RBAC (Role-Based Access Control) for features

### Implementation
```python
def permission_gate_check(
    user_role: str,
    subscription_tier: str,
    requested_action: str
) -> Tuple[bool, str]:
    """
    Checks if user has permission for the requested action.
    """
    
    # Permission matrix
    PERMISSIONS = {
        'basic_chat': {
            'roles': ['OWNER', 'MANAGER', 'ADVISOR', 'MECHANIC'],
            'subscriptions': ['FREE', 'PRO', 'ENTERPRISE']
        },
        'create_job_card': {
            'roles': ['OWNER', 'MANAGER', 'ADVISOR'],
            'subscriptions': ['FREE', 'PRO', 'ENTERPRISE']
        },
        'view_estimates': {
            'roles': ['OWNER', 'MANAGER', 'ADVISOR'],
            'subscriptions': ['FREE', 'PRO', 'ENTERPRISE']
        },
        'mg_fleet_access': {
            'roles': ['OWNER', 'MANAGER'],
            'subscriptions': ['PRO', 'ENTERPRISE']  # PAID ONLY
        },
        'advanced_diagnostics': {
            'roles': ['OWNER', 'MANAGER', 'ADVISOR'],
            'subscriptions': ['PRO', 'ENTERPRISE']  # PAID ONLY
        },
        'bulk_operations': {
            'roles': ['OWNER', 'MANAGER'],
            'subscriptions': ['ENTERPRISE']  # ENTERPRISE ONLY
        },
        'api_access': {
            'roles': ['OWNER'],
            'subscriptions': ['ENTERPRISE']  # ENTERPRISE ONLY
        }
    }
    
    action_perms = PERMISSIONS.get(requested_action)
    
    if not action_perms:
        return False, "Unknown action requested"
    
    role_allowed = user_role in action_perms['roles']
    subscription_allowed = subscription_tier in action_perms['subscriptions']
    
    if not role_allowed:
        return False, """
⛔ **Access Denied**

Your role ({user_role}) does not have permission for this action.

**Required role:** {required_roles}

Contact your workshop owner for access.
"""
    
    if not subscription_allowed:
        return False, """
⭐ **Upgrade Required**

This feature requires a {required_tier} subscription.

**Your current plan:** {subscription_tier}

**Upgrade to access:**
- MG Fleet Management
- Advanced AI Diagnostics
- Bulk Operations
- Priority Support

[Upgrade Now] [View Plans]
"""
    
    return True, ""
```

---

# 3. INPUT PROCESSING PIPELINE

## 3.1 Vehicle Information Extractor

### Implementation
```python
class VehicleInfoExtractor:
    """Extracts vehicle details from natural language queries."""
    
    # Indian vehicle brands
    MAKES = [
        'maruti', 'suzuki', 'maruti suzuki', 'toyota', 'honda', 'hyundai',
        'tata', 'mahindra', 'ford', 'volkswagen', 'vw', 'skoda', 'bmw',
        'mercedes', 'mercedes-benz', 'audi', 'kia', 'mg', 'morris garages',
        'citroen', 'jeep', 'nissan', 'renault', 'mitsubishi', 'isuzu',
        'volvo', 'jaguar', 'land rover', 'porsche', 'ferrari', 'lamborghini'
    ]
    
    # Common models by make
    MODELS = {
        'maruti': ['swift', 'baleno', 'dzire', 'brezza', 'ertiga', 'wagon r', 
                   'alto', 'celerio', 'ciaz', 's-cross', 'jimny', 'fronx'],
        'toyota': ['innova', 'fortuner', 'glanza', 'urban cruiser', 'camry',
                   'corolla', 'etios', 'liva', 'yaris'],
        'honda': ['city', 'amaze', 'jazz', 'wr-v', 'elevate', 'civic'],
        'hyundai': ['creta', 'venue', 'i20', 'verna', 'alcazar', ' Tucson',
                    'grand i10', 'aura', 'exter'],
        'tata': ['nexon', 'punch', 'harrier', 'safari', 'altroz', 'tiago',
                 'tigor', 'curvv'],
        'mahindra': ['thar', 'xuv700', 'xuv300', 'xuv400', 'bolero', 'scorpio',
                     'scorpio-n', 'marazzo', 'kuv100']
    }
    
    # Fuel types
    FUEL_TYPES = ['petrol', 'diesel', 'cng', 'lpg', 'electric', 'ev', 'hybrid']
    
    # Transmission types
    TRANSMISSIONS = ['manual', 'automatic', 'amt', 'cvt', 'dct', 'tc', 'torque converter']
    
    def extract(self, query: str) -> dict:
        """Main extraction method."""
        query_lower = query.lower()
        
        vehicle_info = {
            'make': self._extract_make(query_lower),
            'model': self._extract_model(query_lower),
            'year': self._extract_year(query_lower),
            'variant': self._extract_variant(query_lower),
            'fuel_type': self._extract_fuel_type(query_lower),
            'transmission': self._extract_transmission(query_lower),
            'confidence': 0.0
        }
        
        # Calculate extraction confidence
        vehicle_info['confidence'] = self._calculate_confidence(vehicle_info)
        
        return vehicle_info
    
    def _extract_make(self, query: str) -> Optional[str]:
        for make in self.MAKES:
            if make in query:
                return make.title()
        return None
    
    def _extract_model(self, query: str) -> Optional[str]:
        # Try to find model based on extracted make first
        make = self._extract_make(query)
        if make and make.lower() in self.MODELS:
            for model in self.MODELS[make.lower()]:
                if model in query:
                    return model.title()
        
        # Try all models
        for make_models in self.MODELS.values():
            for model in make_models:
                if model in query:
                    return model.title()
        return None
    
    def _extract_year(self, query: str) -> Optional[int]:
        # Look for 4-digit year (1990-2030)
        import re
        year_match = re.search(r'\b(199\d|20\d{2})\b', query)
        if year_match:
            year = int(year_match.group(1))
            if 1990 <= year <= 2030:
                return year
        return None
    
    def _extract_variant(self, query: str) -> Optional[str]:
        # Common variant patterns
        variant_patterns = [
            r'\b(lxi|vxi|zxi|lxi+|vxi+|zxi+)\b',  # Maruti
            r'\b(e|s|sx|vx|zx|gx)\\b',  # Toyota/Honda
            r'\b(magna|sportz|asta)\b',  # Hyundai
            r'\b(xe|xm|xt|xz|xz+)\b',  # Tata
            r'\b(w4|w6|w8|w10)\b',  # Mahindra
        ]
        
        import re
        for pattern in variant_patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                return match.group(1).upper()
        return None
    
    def _extract_fuel_type(self, query: str) -> Optional[str]:
        for fuel in self.FUEL_TYPES:
            if fuel in query:
                return fuel.title()
        return None
    
    def _extract_transmission(self, query: str) -> Optional[str]:
        for trans in self.TRANSMISSIONS:
            if trans in query:
                return trans.title()
        return None
    
    def _calculate_confidence(self, info: dict) -> float:
        """Calculate confidence score based on extracted fields."""
        score = 0.0
        if info['make']: score += 0.3
        if info['model']: score += 0.3
        if info['year']: score += 0.2
        if info['variant']: score += 0.1
        if info['fuel_type']: score += 0.05
        if info['transmission']: score += 0.05
        return min(score, 1.0)
```

### Example Extractions
| Query | Extracted Info | Confidence |
|-------|----------------|------------|
| "Swift brake issue" | Make: Maruti, Model: Swift | 60% |
| "Maruti Swift 2020 VXI brake issue" | Make: Maruti, Model: Swift, Year: 2020, Variant: VXI | 90% |
| "My car makes noise" | None | 0% |
| "Fortuner diesel service" | Make: Toyota, Model: Fortuner, Fuel: Diesel | 65% |

---

## 3.2 Query Intent Classifier

### Implementation
```python
class QueryIntentClassifier:
    """Classifies user intent for routing to appropriate handler."""
    
    INTENTS = {
        'DIAGNOSIS': {
            'keywords': ['noise', 'sound', 'vibration', 'shaking', 'not working', 
                        'problem', 'issue', 'fault', 'error', 'warning', 'light'],
            'needs_vehicle': True,
            'needs_confidence': 0.85
        },
        'ESTIMATE': {
            'keywords': ['cost', 'price', 'estimate', 'kitna', 'rate', 'charge',
                        'kharcha', 'paisa', 'rupaye', 'expense'],
            'needs_vehicle': True,
            'needs_confidence': 0.80
        },
        'SERVICE_SCHEDULE': {
            'keywords': ['service', 'maintenance', 'schedule', 'interval', 
                        'when', 'kitne km', 'oil change', 'timing'],
            'needs_vehicle': True,
            'needs_confidence': 0.75
        },
        'PARTS_INFO': {
            'keywords': ['part', 'spare', 'component', 'kit', 'filter', 
                        'brake pad', 'clutch plate', 'price'],
            'needs_vehicle': True,
            'needs_confidence': 0.70
        },
        'EXPLANATION': {
            'keywords': ['what is', 'what does', 'how does', 'why', 'meaning',
                        'explain', 'samjhao', 'kya hai'],
            'needs_vehicle': False,
            'needs_confidence': 0.60
        },
        'PROCESS_QUERY': {
            'keywords': ['how to', 'process', 'steps', 'procedure', 'kaise'],
            'needs_vehicle': False,
            'needs_confidence': 0.60
        },
        'AVAILABILITY': {
            'keywords': ['available', 'stock', 'milega', 'hai kya', 'do you have'],
            'needs_vehicle': True,
            'needs_confidence': 0.65
        },
        'COMPARE': {
            'keywords': ['compare', 'vs', 'versus', 'difference', 'better'],
            'needs_vehicle': True,
            'needs_confidence': 0.75
        },
        'GENERAL_ADVICE': {
            'keywords': ['tips', 'advice', 'suggestion', 'recommend', 'should i'],
            'needs_vehicle': False,
            'needs_confidence': 0.60
        }
    }
    
    def classify(self, query: str) -> dict:
        query_lower = query.lower()
        
        scores = {}
        for intent, config in self.INTENTS.items():
            score = 0
            for keyword in config['keywords']:
                if keyword in query_lower:
                    score += 1
            scores[intent] = score / len(config['keywords'])
        
        # Get highest scoring intent
        best_intent = max(scores, key=scores.get)
        confidence = scores[best_intent]
        
        return {
            'intent': best_intent,
            'confidence': confidence,
            'needs_vehicle': self.INTENTS[best_intent]['needs_vehicle'],
            'needs_confidence': self.INTENTS[best_intent]['needs_confidence']
        }
```

---

# 4. OUTPUT FORMATTING & RESPONSE PATTERNS

## 4.1 Response Structure

### Standard Response Format
```typescript
interface EKAResponse {
  // Metadata
  query_id: string;
  timestamp: string;
  
  // Vehicle context
  vehicle: {
    make: string;
    model: string;
    year?: number;
    variant?: string;
    fuel_type?: string;
  };
  
  // Governance info
  governance: {
    domain_check: boolean;
    confidence_score: number;
    context_sufficient: boolean;
    permission_granted: boolean;
  };
  
  // Response content
  content: {
    type: 'diagnosis' | 'estimate' | 'explanation' | 'procedure' | 'general';
    summary: string;  // 1-2 line summary
    details: string;  // Main content
    formatted_data?: {
      tables?: TableData[];
      lists?: ListData[];
      warnings?: string[];
    };
  };
  
  // Actions user can take
  actions: {
    create_job_card?: boolean;
    book_service?: boolean;
    view_estimate?: boolean;
    contact_support?: boolean;
  };
  
  // Safety disclaimers
  disclaimers: string[];
}
```

## 4.2 Table Formatting Rules

### Parts & Pricing Table
```
┌─────────────────┬──────────────┬─────┬───────────────┬───────────────┐
│ Part Name       │ Type         │ Qty │ Price Range   │ Availability  │
├─────────────────┼──────────────┼─────┼───────────────┼───────────────┤
│ Brake Pads      │ OEM (Bosch)  │  1  │ ₹1,200-1,500  │ In Stock ✓    │
│ Brake Pads      │ Aftermarket  │  1  │ ₹600-900      │ In Stock ✓    │
│ Brake Disc      │ OEM          │  2  │ ₹2,500-3,200  │ 2-3 days      │
│ Brake Fluid     │ DOT 4        │  1L │ ₹300-500      │ In Stock ✓    │
└─────────────────┴──────────────┴─────┴───────────────┴───────────────┘
Estimated Labor: ₹800-1,200
Estimated Total: ₹4,400-6,400 (including GST)
```

### Diagnosis Table
```
┌────────────────────────┬──────────────┬────────────┬──────────────────┐
│ Possible Cause         │ Probability  │ Severity   │ Action Required  │
├────────────────────────┼──────────────┼────────────┼──────────────────┤
│ Worn brake pads        │     85%      │ Medium     │ Replace pads     │
│ Warped brake disc      │     60%      │ Medium     │ Resurface/Replace│
│ Caliper sticking       │     40%      │ High       │ Service caliper  │
│ Suspension wear        │     25%      │ Low        │ Inspection needed│
└────────────────────────┴──────────────┴────────────┴──────────────────┘
```

## 4.3 Pricing Safety Rules

### Implementation
```python
class PricingSafetyFilter:
    """Ensures pricing information follows safety guidelines."""
    
    RULES = {
        'always_use_ranges': True,
        'min_range_percent': 15,  # Min 15% difference between low and high
        'add_disclaimer': True,
        'include_labor_separate': True,
        'mention_factors': True
    }
    
    def format_price(self, base_price: float) -> str:
        """Converts exact price to safe range."""
        if not self.RULES['always_use_ranges']:
            return f"₹{base_price:,.0f}"
        
        # Calculate range (±15-25%)
        import random
        variance = random.uniform(0.15, 0.25)
        low = base_price * (1 - variance)
        high = base_price * (1 + variance)
        
        return f"₹{low:,.0f} - ₹{high:,.0f}"
    
    def format_estimate_response(self, parts: list, labor_hours: float, labor_rate: float) -> str:
        """Formats complete estimate with safety rules."""
        
        lines = []
        lines.append("### 🔧 Estimated Repair Cost")
        lines.append("")
        
        # Parts table
        lines.append("**Parts Required:**")
        lines.append("```")
        lines.append(f"{'Part':<20} {'Type':<12} {'Qty':<5} {'Price Range':<15}")
        lines.append("-" * 55)
        
        total_parts_low = 0
        total_parts_high = 0
        
        for part in parts:
            price_range = self.format_price(part['base_price'])
            prices = price_range.replace('₹', '').replace(',', '').split(' - ')
            total_parts_low += float(prices[0]) * part['qty']
            total_parts_high += float(prices[1]) * part['qty']
            
            lines.append(f"{part['name']:<20} {part['type']:<12} {part['qty']:<5} {price_range:<15}")
        
        lines.append("```")
        lines.append("")
        
        # Labor
        labor_total = labor_hours * labor_rate
        lines.append(f"**Labor Charges:** ₹{labor_total:,.0f}")
        lines.append(f"- Hours: {labor_hours}")
        lines.append(f"- Rate: ₹{labor_rate}/hour")
        lines.append("")
        
        # Total
        total_low = total_parts_low + labor_total
        total_high = total_parts_high + labor_total
        lines.append(f"**Estimated Total:** ₹{total_low:,.0f} - ₹{total_high:,.0f}")
        lines.append("")
        
        # Disclaimers
        if self.RULES['add_disclaimer']:
            lines.append("---")
            lines.append("⚠️ **Important Notes:**")
            lines.append("- Prices are estimates and may vary based on:")
            lines.append("  • Exact vehicle variant and year")
            lines.append("  • Current parts availability")
            lines.append("  • Additional issues found during inspection")
            lines.append("  • Your location and workshop rates")
            lines.append("- Final quote provided after physical inspection")
            lines.append("- GST (18%) will be added to final invoice")
        
        return "\n".join(lines)
```

---

# 5. SYSTEM PROMPT & RULES

## 5.1 Complete System Prompt

```
You are EKA (Efficient Knowledge Assistant), an AI automobile repair assistant 
developed by Go4Garage Private Limited.

## YOUR IDENTITY
- Name: EKA
- Full Form: Efficient Knowledge Assistant
- Company: Go4Garage Private Limited
- Domain: Automobile repair and maintenance
- Language: English, Hinglish (Hindi + English), Hinglish Roman script

## CORE RULES (Never Violate)

### Rule 1: Domain Lock
- ONLY answer automobile-related queries
- If asked non-automobile questions, politely decline and redirect to auto topics
- Greetings and platform questions are allowed

### Rule 2: Pricing Safety
- NEVER give exact prices, always use RANGES (₹X - ₹Y)
- Always mention prices vary by location, availability, and vehicle condition
- Include disclaimer about final inspection

### Rule 3: Root Cause Protocol
- If confidence < 90%, ask clarifying questions
- Never give definitive diagnosis without sufficient context
- Always recommend physical inspection for critical issues

### Rule 4: Output Formatting
- Use TABLES for parts, pricing, comparisons
- Use BULLETS for steps, symptoms, causes
- Use EMOJIS for visual hierarchy (🔧, ⚠️, ✅, 💰)
- Use BOLD for important information

### Rule 5: Safety First
- For brake, steering, or engine issues: Recommend immediate inspection
- Never suggest DIY for safety-critical components
- Include safety warnings where applicable

## RESPONSE STRUCTURE

1. **Greeting** (if new conversation)
2. **Acknowledgment** - Show you understood the query
3. **Vehicle Confirmation** - Confirm extracted vehicle details
4. **Main Content** - Diagnosis/Estimate/Explanation
5. **Formatted Data** - Tables/lists as appropriate
6. **Next Steps** - Actionable recommendations
7. **Disclaimer** - Safety/price disclaimers

## VEHICLE DATABASE

You have access to:
- All Indian vehicle models (2010-2025)
- OEM part specifications
- Standard labor hours
- Common failure patterns
- Service schedules

## TONE GUIDELINES

- Professional yet approachable
- Helpful and patient
- Technical but understandable
- Never condescending
- Always safety-conscious

## EXAMPLE RESPONSES

User: "Swift brake pad replacement cost"

EKA Response:
"I'll help you with brake pad replacement cost for your Maruti Swift.

### 🔧 Estimated Cost Breakdown

**Parts Required:**
```
Part               Type         Qty    Price Range
Brake Pads (Front) OEM (Bosch)  1 set  ₹1,200-1,500
Brake Pads (Front) Aftermarket  1 set  ₹600-900
Brake Fluid        DOT 4        250ml  ₹150-250
```

**Labor Charges:** ₹400-600
- Front brake pad replacement: 0.5-1 hour
- Labor rate varies by workshop

**Estimated Total:** ₹1,150-2,350

### 📋 Recommended Action
1. Visit workshop for brake inspection
2. Check brake disc condition (may need resurfacing)
3. Replace pads if thickness < 3mm

⚠️ **Safety Note:** Don't delay brake pad replacement. Worn pads can damage discs and reduce braking efficiency.

**Disclaimer:** Prices are estimates. Final cost depends on exact variant, parts availability, and workshop rates. GST (18%) extra.

Would you like me to create a job card for this repair?"
```

## 5.2 Language Support

### English Response
```
"Based on your Maruti Swift 2020 symptoms, the most likely cause is worn brake pads (85% probability). The squealing noise typically indicates the wear indicator is contacting the disc."
```

### Hinglish Response
```
"Aapki Swift 2020 ke hisaab se, sabse zyada chance hai ki brake pads ghis gaye hain (85% probability). Jo awaaz aa rahi hai, woh usually tab hoti hai jab wear indicator disc se touch hota hai."
```

---

# 6. INTELLIGENCE MODES

## 6.1 Mode Definitions

| Mode | Model | Speed | Use Case | Cost |
|------|-------|-------|----------|------|
| **FAST** | Gemini Flash | < 1s | Quick queries, simple diagnostics | Low |
| **THINKING** | Gemini Pro | 2-3s | Complex diagnosis, estimates | Medium |
| **DEEP_CONTEXT** | RAG + Agent | 3-5s | Historical analysis, fleet reports | High |

## 6.2 Mode Selection Logic

```python
def select_intelligence_mode(query: str, context: dict) -> str:
    """Selects appropriate intelligence mode."""
    
    query_lower = query.lower()
    
    # FAST mode triggers
    fast_triggers = [
        'hello', 'hi', 'thanks', 'ok', 'yes', 'no',
        'what is', 'define', 'explain simple',
        'price', 'cost', 'kitna'
    ]
    
    # DEEP_CONTEXT triggers
    deep_triggers = [
        'compare', 'analyze', 'report', 'history',
        'fleet', 'trend', 'pattern', 'why always',
        'previous', 'last month', 'over time'
    ]
    
    # Check for deep context needs
    if any(t in query_lower for t in deep_triggers):
        if context.get('has_history') or context.get('is_fleet_query'):
            return 'DEEP_CONTEXT'
    
    # Check for simple queries
    if any(t in query_lower for t in fast_triggers):
        if len(query.split()) < 10:  # Short query
            return 'FAST'
    
    # Default to THINKING
    return 'THINKING'
```

---

# 7. DOMAIN-SPECIFIC BEHAVIORS

## 7.1 Diagnosis Behavior

### Input: Symptoms
### Output Structure:
```
1. Acknowledge symptoms
2. List possible causes with probability
3. Ask clarifying questions (if needed)
4. Recommend inspection priority
5. Estimate cost (if clear issue)
```

### Example:
```
User: "Car makes noise when braking"

EKA:
"I understand your vehicle makes noise during braking. This is a common issue that shouldn't be ignored.

### 🔍 Possible Causes

| Cause | Probability | Urgency |
|-------|-------------|---------|
| Worn brake pads | 85% | Medium |
| Warped brake discs | 50% | Medium |
| Foreign object | 30% | Low |
| Caliper issue | 25% | High |

### ❓ Quick Questions
1. What type of noise? (squeal, grind, click)
2. Does it happen every time or occasionally?
3. Any vibration in steering while braking?

### ⚠️ Recommendation
If it's a grinding noise, **stop driving** and get immediate inspection. Grinding usually means metal-on-metal contact.

Would you like me to book an inspection?"
```

## 7.2 Estimate Behavior

### Input: Service/Repair Request
### Output Structure:
```
1. Confirm vehicle details
2. List required parts with ranges
3. Show labor separately
4. Give total range
5. Add disclaimers
6. Offer to create job card
```

## 7.3 Service Schedule Behavior

### Input: "When should I service my car?"
### Output:
```
"For your [Vehicle], here's the recommended service schedule:

### 📅 Service Intervals

| Service Type | Interval | Last Done | Next Due |
|--------------|----------|-----------|----------|
| Oil Change | 10,000 km | 45,000 km | 55,000 km |
| Air Filter | 20,000 km | 40,000 km | 60,000 km |
| Brake Check | 15,000 km | 45,000 km | 60,000 km |

### ⏰ Based on Time
- It's been 4 months since last service
- Recommended: Every 6 months or 10,000 km (whichever first)

### ✅ Action
You're due for service in approximately 2 months or 5,000 km.

Would you like to schedule a service appointment?"
```

---

# 8. TESTING AI RESPONSES

## 8.1 Test Query Matrix

| Test ID | Query Type | Input | Expected Behaviors |
|---------|------------|-------|-------------------|
| AI-001 | Diagnosis | "My car makes noise" | Asks for vehicle details, noise type |
| AI-002 | Diagnosis | "Swift 2020 brake noise" | Gives possible causes with probabilities |
| AI-003 | Estimate | "Clutch replacement cost" | Asks for vehicle first |
| AI-004 | Estimate | "Swift clutch cost" | Gives price ranges, labor separate |
| AI-005 | Non-auto | "What's the weather?" | Blocks, redirects to auto topics |
| AI-006 | Greeting | "Hello EKA" | Friendly greeting, offers help |
| AI-007 | Low confidence | "Something is wrong" | Asks clarifying questions |
| AI-008 | Safety critical | "Brake not working" | Immediate safety warning |
| AI-009 | Comparison | "Swift vs i20 maintenance" | Comparison table |
| AI-010 | Hinglish | "Swift me dikkat hai" | Responds in Hinglish |

## 8.2 Validation Checklist

| # | Check | Status |
|---|-------|--------|
| 8.2.1 | Response includes vehicle confirmation | ⬜ |
| 8.2.2 | Prices are ranges, not exact | ⬜ |
| 8.2.3 | Tables used for structured data | ⬜ |
| 8.2.4 | Safety warnings where applicable | ⬜ |
| 8.2.5 | Disclaimer at end | ⬜ |
| 8.2.6 | Action buttons offered | ⬜ |
| 8.2.7 | Appropriate emojis used | ⬜ |
| 8.2.8 | Response time < 4 seconds | ⬜ |
| 8.2.9 | Domain gate working | ⬜ |
| 8.2.10 | Confidence gate working | ⬜ |

---

# 9. ERROR HANDLING & FALLBACKS

## 9.1 Error Scenarios

| Error | User-Facing Message | Backend Action |
|-------|---------------------|----------------|
| LLM Timeout | "Taking longer than expected. Let me try a simpler approach." | Retry with FAST mode |
| LLM Error | "I'm having trouble processing that. Can you rephrase?" | Log error, notify admin |
| No Vehicle Match | "I couldn't identify your vehicle. Please specify make and model." | Show vehicle selector |
| Insufficient Data | "I need more information to help accurately." | Ask 3 specific questions |
| Rate Limit | "I'm experiencing high traffic. Please try again in a moment." | Queue request |

## 9.2 Fallback Responses

### When AI is Unsure
```
"I'm not entirely certain about the exact issue based on the information provided. 

**Recommended next steps:**
1. Visit an authorized service center for diagnostic scan
2. Share OBD error codes if available
3. Take a video of the issue for technician review

**Would you like me to:**
- [ ] Find nearest service centers
- [ ] Create a job card for inspection
- [ ] Connect you with a specialist
```

### When Parts Data Unavailable
```
"I don't have specific pricing for this part in my database currently.

**Estimated approach:**
- Contact authorized dealer for exact pricing
- Check online spare parts portals
- Visit local spare parts market

**Typical range for similar parts:** ₹X - ₹Y

**Note:** Prices vary significantly by brand (OEM vs Aftermarket)
```

---

# 10. EMERGENT TESTING COMMANDS

## 10.1 AI System Validation

```
@EMERGENT: Execute AI System Validation Tests

TASK 1: GOVERNANCE TESTING
Test the 4-layer governance system:

1. DOMAIN GATE
   - Query: "What's the weather today?"
   - Expected: Blocked with domain restriction message
   
   - Query: "My car makes noise"
   - Expected: Allowed through

2. CONFIDENCE GATE
   - Query: "Something is wrong with my car"
   - Expected: Asks clarifying questions (low confidence)
   
   - Query: "Swift 2020 brake squeal when stopping"
   - Expected: Direct diagnosis (high confidence)

3. CONTEXT GATE
   - Query: "Service cost?"
   - Expected: Asks for vehicle details
   
   - Query: "Swift service cost?"
   - Expected: Provides estimate

4. PERMISSION GATE
   - User: FREE tier, Query: "MG Fleet report"
   - Expected: Upgrade required message
   
   - User: PRO tier, Query: "MG Fleet report"
   - Expected: Report generated

TASK 2: VEHICLE EXTRACTION TESTING
Test vehicle info extraction:

Input: "My 2020 Maruti Swift VXI petrol makes noise"
Expected extraction:
- Make: Maruti
- Model: Swift
- Year: 2020
- Variant: VXI
- Fuel: Petrol
- Confidence: >90%

Input: "Car problem"
Expected extraction:
- All fields: null
- Confidence: 0%

TASK 3: RESPONSE FORMATTING TESTS
Verify output formatting:

1. Pricing Test
   - Any price in response must be a RANGE (₹X - ₹Y)
   - No exact prices allowed

2. Table Test
   - Parts list must be in table format
   - Diagnosis must show probability table

3. Safety Test
   - Brake/steering queries must have ⚠️ warning
   - "Stop driving" for critical issues

4. Disclaimer Test
   - Every estimate must include disclaimer
   - Must mention "prices vary"

TASK 4: INTELLIGENCE MODE TESTS
Verify mode selection:

- "Hi" → FAST mode (< 1s)
- "Complex diagnosis with history" → DEEP_CONTEXT mode
- Default → THINKING mode

TASK 5: LANGUAGE TESTS
Test multilingual support:

- English query → English response
- Hinglish query → Hinglish response
- Mixed query → Appropriate language response

TASK 6: TEMPLATE VERIFICATION
Verify all templates work:

1. Invoice generation from chat
2. Job card creation from diagnosis
3. Estimate generation from query
4. Service schedule lookup

TASK 7: ERROR HANDLING
Test error scenarios:

1. Disconnect internet during query
2. Enter gibberish text
3. Ask extremely long query (>1000 chars)
4. Rapid-fire multiple queries

DOCUMENT RESULTS in: .emergent/AI_SYSTEM_TEST_REPORT.md
```

---

# 📊 SUMMARY

## Key AI System Components

| Component | Purpose | File Location |
|-----------|---------|---------------|
| 4-Layer Governance | Safety & quality control | `/backend/services/ai_governance.py` |
| Vehicle Extractor | Parse vehicle from query | `/backend/services/vehicle_extractor.py` |
| Intent Classifier | Route to appropriate handler | `/backend/services/intent_classifier.py` |
| Pricing Filter | Ensure price safety | `/backend/services/pricing_safety.py` |
| Response Formatter | Format output | `/backend/services/response_formatter.py` |
| System Prompt | AI behavior rules | `/backend/prompts/eka_system_prompt.txt` |

## Critical Rules Summary

1. ✅ **Domain Lock** - Only automobile queries
2. ✅ **Price Ranges** - Never exact prices
3. ✅ **Confidence Check** - Ask questions if <90%
4. ✅ **Tables & Bullets** - Structured formatting
5. ✅ **Safety First** - Warnings for critical issues
6. ✅ **Disclaimers** - Always include
7. ✅ **Action Buttons** - Offer next steps

---

**Go4Garage Private Limited**  
**EKA-AI System Documentation v1.0**
