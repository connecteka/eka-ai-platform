# Enterprise Technical Requirements
## For 200,000 Users - Scale Architecture

---

## Infrastructure Requirements

### 1. Compute Layer

#### Kubernetes Cluster (GKE/EKS/AKS)
```yaml
Cluster Configuration:
  - Node Pools: 3 (frontend, backend, workers)
  - Nodes per pool: 5-20 (auto-scaling)
  - Machine type: n2-standard-4 (4 vCPU, 16GB RAM)
  - Total capacity: 60-240 vCPUs, 240-960GB RAM
```

#### Pod Distribution
| Service | Replicas | CPU | Memory | Purpose |
|---------|----------|-----|--------|---------|
| Frontend (NextJS) | 10 | 500m | 1Gi | Web UI |
| Backend API | 20 | 1000m | 2Gi | FastAPI |
| AI Service | 5 | 2000m | 4Gi | Gemini integration |
| Worker (Celery) | 10 | 500m | 1Gi | Background jobs |
| NGINX Ingress | 3 | 250m | 512Mi | Load balancer |

---

### 2. Database Layer

#### Supabase (PostgreSQL) - Primary
```yaml
Plan: Enterprise
Configuration:
  - Instance: db.r6g.2xlarge (8 vCPU, 64GB RAM)
  - Storage: 1TB SSD (auto-grow to 5TB)
  - Read Replicas: 3 (Mumbai, Singapore, Frankfurt)
  - Connection Pooling: PgBouncer (200 connections)
  - Backup: Continuous + Daily snapshots
  - Point-in-time recovery: 7 days
```

**Tables to Partition** (for 200K users):
```sql
-- Partition job_cards by month
CREATE TABLE job_cards (
    id UUID,
    workshop_id UUID,
    created_at TIMESTAMP,
    -- ...
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE job_cards_2024_01 PARTITION OF job_cards
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### MongoDB Atlas - Secondary
```yaml
Cluster: M50 (Production)
Configuration:
  - RAM: 64GB
  - Storage: 2TB
  - Nodes: 3 (replica set)
  - Sharding: Enabled
  - Regions: Mumbai (primary), Singapore (secondary)

Collections:
  - chat_sessions (shard by user_id)
  - ai_logs (shard by date)
  - notifications (TTL: 30 days)
  - analytics_events (shard by date)
```

#### Redis - Caching
```yaml
Provider: Redis Cloud Pro
Configuration:
  - Memory: 25GB
  - Cluster mode: Enabled (5 shards)
  - Persistence: AOF every 1s
  - Eviction policy: allkeys-lru

Cache Strategy:
  - Session data: 24h TTL
  - API responses: 5m TTL
  - Job card data: 1h TTL
  - User profiles: 12h TTL
```

---

### 3. Storage & CDN

#### Supabase Storage
```yaml
Buckets:
  - pdi-photos: 10GB/month per workshop
  - invoice-pdfs: 1GB/month per workshop
  - documents: 5GB/month per workshop
  - backups: 100GB/month

Total: ~5TB/month for 200K users
```

#### Cloudflare CDN
```yaml
Plan: Enterprise
Features:
  - Global edge caching
  - DDoS protection (unmetered)
  - WAF (Web Application Firewall)
  - Image optimization
  - Argo Smart Routing
```

---

### 4. Networking

#### Load Balancer (NGINX Ingress)
```yaml
Configuration:
  - SSL termination
  - Rate limiting: 100 req/min per IP
  - Geo-blocking (optional)
  - Health checks: /api/health

SSL/TLS:
  - Certificate: Wildcard (*.eka-ai.in)
  - HSTS enabled
  - TLS 1.3 only
```

#### VPC Configuration
```yaml
Network:
  - Private subnets for databases
  - Public subnets for load balancers
  - NAT Gateway for outbound traffic
  - VPC peering with Supabase

Security Groups:
  - Frontend: 80, 443 inbound
  - Backend: 8001 internal only
  - Database: 5432, 27017 internal only
  - Redis: 6379 internal only
```

---

### 5. Monitoring & Observability

#### Datadog / New Relic
```yaml
Metrics:
  - Infrastructure: CPU, Memory, Disk, Network
  - Application: Response time, Error rate, Throughput
  - Database: Query time, Connection pool, Slow queries
  - Business: Active users, Job cards/hour, Revenue

Alerts:
  - P1: API down, Database unreachable
  - P2: Error rate > 1%, Latency > 2s
  - P3: Disk usage > 80%, Memory > 85%

Dashboards:
  - Executive: Revenue, Users, Uptime
  - Technical: Infrastructure health
  - Business: Feature adoption, Support tickets
```

#### Logging (ELK Stack / Loki)
```yaml
Log Aggregation:
  - Application logs: JSON format
  - Audit logs: Immutable storage
  - Access logs: 90 days retention
  - Error logs: 1 year retention

Search Capabilities:
  - Full-text search
  - Structured filtering
  - Real-time tail
```

---

### 6. Security Requirements

#### Authentication & Authorization
```yaml
SSO Integration:
  - SAML 2.0 (Okta, Azure AD, Auth0)
  - OIDC (Google Workspace, Microsoft)
  - LDAP (Active Directory)

MFA:
  - Required for admin roles
  - TOTP (Google Authenticator)
  - SMS backup

RBAC:
  - Super Admin
  - Workshop Admin
  - Manager
  - Technician
  - Accountant
  - Customer (read-only)
```

#### Data Protection
```yaml
Encryption:
  - At rest: AES-256 (database + storage)
  - In transit: TLS 1.3
  - Application level: Field-level encryption for PII

Backup:
  - Daily automated backups
  - Cross-region replication
  - 30-day retention
  - Quarterly disaster recovery drill

Compliance:
  - ISO 27001:2022
  - SOC 2 Type II
  - GDPR (EU customers)
  - DPDP India (Indian customers)
```

---

### 7. Disaster Recovery

#### RPO/RTO Targets
```yaml
Recovery Point Objective (RPO): 5 minutes
Recovery Time Objective (RTO): 30 minutes

DR Strategy:
  - Multi-region active-passive
  - Primary: Mumbai (asia-south1)
  - Secondary: Singapore (asia-southeast1)
  - Data replication: Synchronous (RPO=0) for critical
  - Data replication: Asynchronous for non-critical
```

#### Runbook
```markdown
## Database Failover Procedure
1. Detect failure via health check
2. Promote read replica to primary (automated)
3. Update connection strings in app
4. Notify on-call engineer
5. Root cause analysis within 4 hours

## Complete Region Failure
1. Activate secondary region
2. Update DNS to point to secondary
3. Verify all services healthy
4. Communicate to customers
5. Post-incident review within 24 hours
```

---

## Cost Estimate (Monthly)

| Component | Specification | Monthly Cost |
|-----------|--------------|--------------|
| **GKE Cluster** | 50 nodes, n2-standard-4 | $3,500 |
| **Supabase Enterprise** | 8 vCPU, 64GB, 1TB | $600 |
| **MongoDB Atlas M50** | 64GB RAM, 2TB | $800 |
| **Redis Cloud** | 25GB cluster | $350 |
| **Cloudflare Enterprise** | Full features | $200 |
| **Monitoring (Datadog)** | 50 hosts | $1,500 |
| **Storage (GCS)** | 5TB | $100 |
| **Load Balancer** | 3 LBs | $50 |
| **Network egress** | 10TB | $200 |
| **Reserved Total** | | **$7,300/month** |
| **≈ ₹6,00,000/month** | | |

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time** | p95 < 200ms | Datadog APM |
| **Page Load Time** | < 2 seconds | Lighthouse |
| **Database Query Time** | p95 < 50ms | pg_stat_statements |
| **Availability** | 99.99% | Uptime monitoring |
| **Concurrent Users** | 50,000 | Load testing |
| **Job Cards/Hour** | 10,000 | Business metrics |

---

## Load Testing Plan

### Phase 1: Baseline (10K users)
- 1,000 concurrent users
- 100 requests/second
- Duration: 1 hour

### Phase 2: Stress Test (100K users)
- 10,000 concurrent users
- 1,000 requests/second
- Duration: 2 hours

### Phase 3: Spike Test (200K users)
- 20,000 concurrent users
- 2,000 requests/second
- Sudden spike in 1 minute
- Duration: 30 minutes

### Tools
- k6 (open-source load testing)
- Locust (Python-based)
- Artillery (Node.js)

---

**Next Steps:**
1. Provision infrastructure
2. Set up monitoring
3. Run load tests
4. Security audit
5. Go-live checklist
