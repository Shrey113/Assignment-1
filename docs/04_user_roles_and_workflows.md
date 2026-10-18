# Document 04: User Roles, RBAC & Algorithmic Workflows

> **Scope:** Definition of User Roles (`Donor`, `Requester`, `Administrator`), Access Control Policies, and End-to-End Operational Workflows in **BloodLink**.

---

## 1. User Roles & Personas

```mermaid
graph LR
    subgraph ROLES["BloodLink User Ecosystem"]
        D[Donor Persona\nVoluntary Giver]
        R[Requester Persona\nHospital / Patient Kin]
        A[Administrator Persona\nBlood Bank / Health Authority]
    end

    subgraph ACTIONS["Primary System Engagements"]
        D -->|Maintains Availability, Views History| DS_H[Doubly Linked History]
        R -->|Raises Emergency/Routine Demands| DS_Q[Max-Heap / FIFO Queue]
        A -->|Monitors Inventory, Dispatches Units| DS_I[FEFO Min-Heap & Graph]
    end

    style D fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style R fill:#ffebee,stroke:#c62828,stroke-width:2px
    style A fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
```

### 1.1 Role: `Donor`
* **Definition:** An individual who voluntarily participates in the blood supply network.
* **Core Responsibilities & Capabilities:**
  * Complete personal profile registration, contact credentials, and initial medical self-assessment.
  * Toggle availability status (`Available` vs `Temporarily Unavailable`).
  * Check algorithmic eligibility status in real-time (automatically evaluated against the 90-day cooldown window from their last recorded donation).
  * View their personal chronological donation timeline, retrieved by traversing their **Doubly Linked List** of `DonationRecord` nodes.
  * Receive emergency notifications when a matching critical blood request is within proximity.
  * Download an authenticated Donor ID Card and participation certificates.

### 1.2 Role: `Requester`
* **Definition:** An attending physician, hospital triage coordinator, or patient family member in immediate need of blood units.
* **Core Responsibilities & Capabilities:**
  * Raise an urgent or routine blood request specifying the required blood group, patient details, unit count, and hospital destination.
  * Select urgency classification (`Routine`, `Urgent`, `Emergency`, `Critical`).
  * Monitor request progress in real time as it moves through the **Binary Max-Heap Triage Engine** or **Circular FIFO Queue**.
  * View matched voluntary donors or assigned blood bank facilities.
  * Confirm unit arrival or cancel the request if medical circumstances change.

### 1.3 Role: `Administrator`
* **Definition:** Authorized blood bank supervisor, laboratory technician, or regional healthcare dispatch officer.
* **Core Responsibilities & Capabilities:**
  * Review and verify laboratory screening results (HIV, Hepatitis B/C, Syphilis, Malaria) for freshly harvested blood bags.
  * Approve tested blood units into active storage, automatically inserting them into the blood group's **FEFO Min-Heap** based on expiration date.
  * Monitor the active **Binary Max-Heap** priority queue to oversee critical triage allocations and prevent clinical starvation.
  * Initiate and oversee inter-facility blood transfers using the **Weighted Graph Logistics Engine** (Dijkstra shortest-route paths).
  * Supervise inventory levels, trigger low-stock camp drives, and audit expired blood bag disposals.

---

## 2. Role-Based Access Control (RBAC) Matrix

| System Resource / Entity | Donor Role | Requester Role | Administrator Role |
| :--- | :---: | :---: | :---: |
| **Donor Self Profile** | `CREATE`, `READ`, `UPDATE` | `READ` (Masked Contact) | `READ`, `UPDATE`, `DEACTIVATE` |
| **Donor Medical History (DLL)** | `READ` (Own History) | `NO_ACCESS` | `READ`, `AUDIT`, `APPEND` |
| **Blood Request Creation** | `NO_ACCESS` | `CREATE`, `READ` (Own), `CANCEL` | `CREATE`, `READ` (All), `CANCEL` |
| **Emergency Priority Queue (Max-Heap)** | `NO_ACCESS` | `READ` (Position / Status Only) | `READ`, `PEEK`, `EXTRACT`, `OVERRIDE` |
| **Routine Request Queue (FIFO)** | `NO_ACCESS` | `READ` (Position / Status Only) | `READ`, `DEQUEUE`, `MANAGE` |
| **Blood Bank Inventory (FEFO Heaps)** | `NO_ACCESS` | `READ` (Stock Count Only) | `CREATE`, `READ`, `DISPATCH`, `DISCARD` |
| **Logistics Routing (Graph)** | `NO_ACCESS` | `READ` (Delivery ETA) | `EXECUTE_ROUTING`, `MANAGE_NODES` |
| **Compatibility Matrix Inspection** | `READ` | `READ` | `READ`, `UPDATE_CONFIG` |

---

## 3. End-to-End Operational Workflows

### 3.1 Blood Request Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : Requester submits form
    
    state Urgency_Evaluation <<choice>>
    SUBMITTED --> Urgency_Evaluation : System scores urgency
    
    Urgency_Evaluation --> MAX_HEAP_TRIAGE : Urgency is EMERGENCY / CRITICAL
    Urgency_Evaluation --> FIFO_QUEUE : Urgency is ROUTINE
    
    MAX_HEAP_TRIAGE --> MATCHED : Priority extraction matches stock / donors
    FIFO_QUEUE --> MATCHED : Dequeued in FCFS order
    
    MATCHED --> DISPATCHED : Units released from FEFO Min-Heap
    DISPATCHED --> FULFILLED : Confirmed delivered & transfused
    
    SUBMITTED --> CANCELLED : Cancelled by requester
    MAX_HEAP_TRIAGE --> CANCELLED : Clinical condition changed
    
    FULFILLED --> [*]
    CANCELLED --> [*]
```

---

### 3.2 Emergency Triage & Dispatch Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Req as Requester (Hospital Triage)
    participant API as BloodLink API Gateway
    participant DS_Heap as Max-Heap Priority Queue
    participant DS_Compat as Compatibility Matrix (8x8)
    participant DS_Inv as Inventory Hash Map & FEFO Heap
    participant DS_Graph as Logistics Graph (Dijkstra)
    actor Admin as Blood Bank Admin

    Req->>API: POST /api/requests (Urgency: CRITICAL, Group: O-, Units: 2)
    API->>API: Compute Dynamic Priority Score (Score: 4250)
    API->>DS_Heap: insert(BloodRequestNode)
    Note over DS_Heap: Request placed in Max-Heap (Heapify-Up O(log N))

    DS_Heap-->>API: extractMax() returns top emergency
    API->>DS_Compat: checkCompatibility("O-", availableGroups)
    DS_Compat-->>API: Compatible groups = ["O-"] (O(1))

    API->>DS_Inv: lookupBloodStock("O-")
    DS_Inv-->>API: Blood Bank #BB-10 has 3 safe units
    
    API->>DS_Inv: getFefoUnit("BB-10", "O-")
    Note over DS_Inv: Extract 2 earliest-expiring bags from Min-Heap (O(log K))

    API->>DS_Graph: computeShortestRoute(BB-10, TargetHospital)
    Note over DS_Graph: Dijkstra shortest path calculation O((V+E) log V)
    DS_Graph-->>API: Optimal Route via Central Expy (ETA: 14 mins)

    API->>Admin: Alert Dispatch Officer with Bag IDs & Route
    Admin->>API: Confirm Handover & Transit Departure
    API->>Req: Notify Requester: Units Dispatched (ETA: 14 mins)
```

---

### 3.3 Donor Eligibility & Donation History Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Donor as Voluntary Donor
    participant API as BloodLink Engine
    participant Registry as Donor Hash Map
    participant History as Doubly Linked List

    Donor->>API: Check Donation Eligibility
    API->>Registry: lookupDonor(donorId) -> O(1)
    Registry-->>API: DonorRecord { lastDonation: "2026-07-01", weight: 68kg }
    API->>API: Check Days Elapsed: 109 days >= 90 days? -> TRUE
    API-->>Donor: Status: "ELIGIBLE TO DONATE"

    Donor->>API: Completes Blood Donation Camp Event
    API->>History: pushHead(new DonationRecord("2026-10-18", 450ml, "PASSED"))
    Note over History: Instant O(1) prepend to Doubly Linked List
    API->>Registry: updateLastDonationDate("2026-10-18")
    API-->>Donor: Updated History Available & Certificate Issued
```
