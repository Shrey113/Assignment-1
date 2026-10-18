# Document 04: User Roles, RBAC & Simplified Workflows

> **Focus:** Clear, Pragmatic User Roles, Role-Based Access Control, and Fast-to-Build Operational Workflows with Seamless Data Storing, Fetching, and Retrieving.

---

## 1. User Roles & System Interaction

To keep implementation fast and straightforward, the system focuses on **three core roles** with intuitive, well-defined responsibilities:

```mermaid
graph LR
    subgraph ROLES["User Roles"]
        D[Donor\nVoluntary Contributor]
        R[Requester\nPatient / Hospital Staff]
        A[Administrator\nBlood Bank Operator]
    end

    subgraph DATA_FLOW["Data Fetch & Store Actions"]
        D -->|Store Profile / Fetch History| HM1[Donor Hash Map]
        R -->|Store Emergency Request| PQ[Priority Queue]
        R -->|Store Routine Request| FQ[Standard FIFO Queue]
        A -->|Retrieve Next Emergency| PQ
        A -->|Fetch & Update Inventory| HM2[Stock Hash Map]
    end

    style D fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style R fill:#ffebee,stroke:#c62828,stroke-width:2px
    style A fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
```

### 1.1 Role: `Donor`
* **Purpose:** Individuals willing to donate blood.
* **Core Actions (Fast to Build):**
  * **Register / Store:** Submit registration form (name, blood group, contact, city, age, weight). Stored in MySQL and indexed in the **Donor Hash Map** ($O(1)$).
  * **Retrieve / Fetch:** View personal profile, donation eligibility status (automatically checks if last donation date was $\ge 90$ days ago), and past donation history.
  * **Update:** Simple one-click toggle to set availability (`Available` / `Unavailable`).

### 1.2 Role: `Requester`
* **Purpose:** Patients, family members, or doctors needing blood units.
* **Core Actions (Fast to Build):**
  * **Create / Store Request:** Fill a simple form with patient name, required blood group, hospital, units needed, and urgency level (`CRITICAL`, `URGENT`, `ROUTINE`).
    * **Critical / Urgent Requests:** Stored into the in-memory **Priority Queue (Max-Heap)** ($O(\log N)$).
    * **Routine Requests:** Stored into the in-memory **Standard Queue (FIFO)** ($O(1)$).
  * **Fetch / Retrieve Status:** Check the status of their request (`PENDING`, `MATCHED`, `FULFILLED`).
  * **Instant Donor Search:** Search available donors by blood group in $O(1)$ time via the **Donor Hash Map**.

### 1.3 Role: `Administrator`
* **Purpose:** Blood bank staff managing emergency allocation and stock.
* **Core Actions (Fast to Build):**
  * **Fetch Next Emergency:** Retrieve the most critical pending request from the **Priority Queue** with a single click (`extractMax()`).
  * **Fetch & Update Stock:** View blood unit counts per group from the **Stock Hash Map** ($O(1)$). Increment stock on new donation; decrement on fulfillment.
  * **Fulfill Requests:** Match the top emergency request with available stock, update MySQL status to `FULFILLED`, and sync the in-memory queue.

---

## 2. Role-Based Access Control (RBAC) Matrix

A simple, practical permissions structure that avoids complex role hierarchies:

| Feature / Data Entity | Donor | Requester | Administrator |
| :--- | :---: | :---: | :---: |
| **Register & Manage Own Profile** | ✅ Create / Read / Update | ❌ | ✅ Full Access |
| **Search Donors by Blood Group** | ❌ | ✅ Read ($O(1)$ Hash Map) | ✅ Read ($O(1)$ Hash Map) |
| **Create Blood Request** | ❌ | ✅ Create & View Own | ✅ Create & View All |
| **View Emergency Priority Queue** | ❌ | ❌ (Own status only) | ✅ Read & Extract Top ($O(\log N)$) |
| **View Routine Request Queue** | ❌ | ❌ (Own status only) | ✅ Read & Dequeue ($O(1)$) |
| **Update Blood Bank Inventory** | ❌ | ❌ | ✅ Add / Decrement Stock |
| **Record New Blood Donation** | ❌ | ❌ | ✅ Create & Update Cooldown |

---

## 3. Data Fetching, Storing, and Retrieving Architecture

To ensure fast development and reliable code, all entities follow a consistent **Dual-Layer Data Pipeline**:

```mermaid
sequenceDiagram
    autonumber
    participant UI as Frontend (React UI)
    participant API as Backend (Express API)
    participant DS as In-Memory DS Engine
    participant DB as MySQL Database

    rect rgb(240, 248, 255)
    Note over UI,DB: 1. STORING DATA (e.g. New Blood Request)
    UI->>API: POST /api/requests (BloodGroup, Urgency, Units)
    API->>DB: INSERT INTO blood_requests ...
    DB-->>API: Saved with requestId
    API->>DS: priorityQueue.insert(request) OR queue.enqueue(request)
    API-->>UI: 201 Created (Instant Confirmation)
    end

    rect rgb(255, 245, 238)
    Note over UI,DB: 2. FETCHING / RETRIEVING DATA (e.g. Search Donors or Get Next Emergency)
    UI->>API: GET /api/donors/search?group=O+
    API->>DS: donorHashMap.get("O+") -> O(1) Lookup
    DS-->>API: Returns matching donor array
    API-->>UI: 200 OK with instant donor list
    end
```

### Explanation of the 3 Data Phases:
1. **Storing Data:**
   * Incoming data is validated in Express.
   * Saved permanently to MySQL to prevent data loss.
   * Inserted into the active in-memory Data Structure (Hash Map, Priority Queue, or FIFO Queue) for fast algorithmic access.
2. **Retrieving Data:**
   * Real-time read operations (search donors, check blood stock, pull highest emergency) query the **in-memory Data Structures** first.
   * This yields instant ($O(1)$ or $O(\log N)$) responses without heavy SQL queries.
3. **Startup Hydration:**
   * When the Node.js server starts, a simple `initDataStructures()` function runs:
     `SELECT * FROM donors` $\to$ populates `donorHashMap`.
     `SELECT * FROM blood_stock` $\to$ populates `stockHashMap`.
     `SELECT * FROM blood_requests WHERE status='PENDING'` $\to$ inserts into `priorityQueue` / `fifoQueue`.

---

## 4. Simplified Operational Workflows

### 4.1 Blood Request Lifecycle (Fast to Build)

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : Requester submits request
    
    state Check_Urgency <<choice>>
    SUBMITTED --> Check_Urgency
    
    Check_Urgency --> PRIORITY_QUEUE : Urgency = CRITICAL or URGENT
    Check_Urgency --> ROUTINE_QUEUE : Urgency = ROUTINE
    
    PRIORITY_QUEUE --> FULFILLED : Admin extracts top & assigns stock
    ROUTINE_QUEUE --> FULFILLED : Processed in FIFO order
    
    SUBMITTED --> CANCELLED : Cancelled by user
    PRIORITY_QUEUE --> CANCELLED : Cancelled
    
    FULFILLED --> [*]
    CANCELLED --> [*]
```

---

### 4.2 Emergency Request & Triage Workflow (Sequence)

A streamlined 6-step flow that is easy to write in Node.js and easy to wire to a React button:

```mermaid
sequenceDiagram
    autonumber
    actor Req as Requester
    actor Admin as Admin
    participant Server as Express Server
    participant DS as DS Engine (Heap & Hash Map)
    participant DB as MySQL Database

    Req->>Server: POST /api/requests (Urgency: "CRITICAL", Group: "A+")
    Server->>DB: INSERT into blood_requests
    Server->>DS: emergencyHeap.insert(request) [O(log N)]
    Server-->>Req: Request Queued with High Priority

    Admin->>Server: GET /api/admin/next-emergency
    Server->>DS: emergencyHeap.extractMax() [O(log N)]
    DS-->>Server: Top Emergency Request
    Server->>DS: stockHashMap.get("A+") [O(1)]
    DS-->>Server: Available Units = 4
    Server-->>Admin: Show Emergency Request + Stock Available

    Admin->>Server: POST /api/admin/fulfill-request (requestId)
    Server->>DS: stockHashMap.decrement("A+", 1)
    Server->>DB: UPDATE blood_requests SET status='FULFILLED'
    Server-->>Admin: Confirmation: Request Fulfilled
```

---

### 4.3 Donor Registration & Availability Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Donor as Voluntary Donor
    participant Server as Express Server
    participant DS as Donor Hash Map
    participant DB as MySQL Database

    Donor->>Server: POST /api/donors/register (Name, "O+", Phone, City)
    Server->>DB: INSERT into donors
    Server->>DS: donorMap.put(donorId, donorData) [O(1)]
    Server->>DS: bloodGroupMap.add("O+", donorId) [O(1)]
    Server-->>Donor: Registration Successful!

    Donor->>Server: PATCH /api/donors/toggle-availability
    Server->>DB: UPDATE donors SET is_available = !is_available
    Server->>DS: donorMap.updateAvailability(donorId) [O(1)]
    Server-->>Donor: Availability status updated
```
