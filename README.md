# BloodLink: DS-Based Blood Donor & Emergency Management System

> **Data Structures Core Coursework / Project Assignment**  
> An algorithmic emergency management and blood distribution platform built on custom Data Structures.

---

## 📌 Executive Summary

**BloodLink** transforms conventional blood bank operations by deploying an in-memory **Data Structures Engine** for sub-millisecond emergency triage, inventory optimization, and donor matching.

### Core Data Structure Highlights
* **Binary Max-Heap:** Prioritizes emergency blood requests by clinical urgency, wait time, and deficit volume ($O(\log N)$ extraction).
* **Binary Min-Heap (FEFO):** Enforces First-Expiring, First-Out blood unit dispatch to eliminate perishable stock wastage ($O(\log K)$).
* **Separate-Chaining Hash Map:** Constant-time ($O(1)$) donor lookup, blood group indices, and hospital facility indexing.
* **Circular FIFO Queue:** Zero-starvation, fair first-come, first-served processing for non-critical elective requests ($O(1)$).
* **Doubly Linked List:** Tamper-evident, chronologically ordered donation history ledger with bi-directional traversal ($O(1)$ head insertion).
* **Weighted Graph & Dijkstra:** Finds optimal shortest delivery routes between blood depositories and trauma hospitals ($O((V + E) \log V)$).
* **8x8 Compatibility Bitmask Matrix:** Instant single-cycle validation of donor-recipient immunological compatibility ($O(1)$).

---

## 📂 Documentation Directory

All architectural blueprints, entity specifications, and requirements are structured inside the **[`docs/`](file:///a:/Nirma/DS/Assignment%201/docs/README.md)** directory:

1. **[`docs/01_project_scope.md`](file:///a:/Nirma/DS/Assignment%201/docs/01_project_scope.md):** Project Scope, Problem Statement, In-Scope & Out-of-Scope boundaries.
2. **[`docs/02_data_structures_architecture.md`](file:///a:/Nirma/DS/Assignment%201/docs/02_data_structures_architecture.md):** Algorithmic Architecture, Mathematical Scoring, Heaps, Hash Maps, Queues, Graphs, and Complexity Tables.
3. **[`docs/03_entity_definitions.md`](file:///a:/Nirma/DS/Assignment%201/docs/03_entity_definitions.md):** Technical specification for the 6 Core Entities (`Donor`, `Blood Group`, `Donation`, `Blood Bank`, `Hospital`, `Blood Request`) with ER and Class diagrams.
4. **[`docs/04_user_roles_and_workflows.md`](file:///a:/Nirma/DS/Assignment%201/docs/04_user_roles_and_workflows.md):** User roles (`Donor`, `Requester`, `Administrator`), RBAC matrix, State machines, and Sequence diagrams.
5. **[`docs/05_system_architecture_and_folder_structure.md`](file:///a:/Nirma/DS/Assignment%201/docs/05_system_architecture_and_folder_structure.md):** Multi-tier architecture, code directory layout, and version control guidelines.

---

## 🏗️ Repository Skeleton

```
Assignment 1/
├── .gitignore
├── flow.md
├── README.md
├── docs/
│   ├── README.md
│   ├── 01_project_scope.md
│   ├── 02_data_structures_architecture.md
│   ├── 03_entity_definitions.md
│   ├── 04_user_roles_and_workflows.md
│   └── 05_system_architecture_and_folder_structure.md
├── src/
│   ├── core/
│   │   ├── data_structures/
│   │   └── algorithms/
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── config/
│   └── utils/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── services/
└── tests/
    ├── data_structures/
    └── integration/
```

---

## 🚦 Roadmap Progress

* [x] **Stage 01: Project Foundation & Requirements**
  * Scope finalized & documented.
  * 6 Core entities defined with constraints and DS representations.
  * 3 User roles established with RBAC and state workflows.
  * Directory structure created and Git repository initialized.
* [ ] **Stage 02: Database & System Design** (ER diagrams, MySQL schemas, UML diagrams).
* [ ] **Stage 03: Professional UI/UX Design** (React layouts, dashboards, visualizers).
* [ ] **Stage 04: Backend & Database Integration** (Express APIs, MySQL connections).
* [ ] **Stage 05: Data Structures Implementation** (Custom JS classes: Heaps, Hash Maps, Queues).
* [ ] **Stage 06: Final Polish & Testing** (Integration tests, benchmarks, demonstrations).
