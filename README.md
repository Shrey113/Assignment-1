# BloodLink: DS-Based Blood Donor & Emergency Management System

> **Data Structures Core Assignment — Stage 01: Foundation & Requirements**  
> **Selected Mode:** 🟡 **Medium Mode (Recommended / Balanced Academic Baseline)**  
> An algorithmic emergency blood management platform built on custom in-memory Data Structures for **instant Data Storing, Fetching, and Retrieving**.

---

## 📌 Architectural Mode Comparison

| Feature | 🟢 Lower Mode | 🟡 Medium Mode (Selected) | 🔴 Higher Mode |
| :--- | :--- | :--- | :--- |
| **Donor Lookup & Stock** | JS Object / Array filter | **Custom Separate-Chaining Hash Map ($O(1)$)** | Custom Hash Map + Dynamic Rehashing |
| **Emergency Triage** | Array `sort()` | **Binary Max-Heap Priority Queue ($O(\log N)$)** | Dual Heaps + Complex Physics Scoring |
| **Routine Requests** | Array `push()` / `shift()` | **Circular FIFO Queue ($O(1)$)** | Multi-channel fair queue |
| **Compatibility Match** | Simple `if/else` | **Static 8-Blood Group Dictionary ($O(1)$)** | 8x8 Bitwise Bitmask Matrix |
| **Build Time** | 2 – 3 Hours | **4 – 6 Hours** | 12 – 16+ Hours |
| **Teacher Viva Defense** | Trivial (Low marks) | **Textbook Data Structures (Top marks)** | Overly complex to explain |

---

## 🧠 Core Data Structures (Medium Mode)

1. **Custom Hash Map ($O(1)$):** Separate-chaining hash table with an array of buckets for instantaneous donor lookup by ID/blood group and stock counts.
2. **Priority Queue / Binary Max-Heap ($O(\log N)$):** Ranks emergency blood requisitions so the most critical patient is always served first ($\text{Score} = \text{Urgency Base} + \text{Minutes Waiting}$).
3. **Circular FIFO Queue ($O(1)$):** Handles routine, non-emergency requests in fair first-come, first-served order.
4. **Blood Compatibility Dictionary ($O(1)$):** Instant single-line lookup for safe donor-recipient matches.

---

## 📂 Documentation Directory

All finalized specifications are organized in the **[`docs/`](file:///a:/Nirma/DS/Assignment%201/docs/README.md)** folder:

* **[`docs/01_project_scope.md`](file:///a:/Nirma/DS/Assignment%201/docs/01_project_scope.md):** Medium Mode scope, functional requirements for storing/fetching/retrieving, and teacher viva defense strategy.
* **[`docs/02_data_structures_architecture.md`](file:///a:/Nirma/DS/Assignment%201/docs/02_data_structures_architecture.md):** Class blueprints, index math, time/space complexity matrix, and viva Q&A for Hash Map, Max-Heap, and Circular Queue.
* **[`docs/03_entity_definitions.md`](file:///a:/Nirma/DS/Assignment%201/docs/03_entity_definitions.md):** Practical schemas for `Donor`, `Blood Group`, `Donation`, `Blood Bank`, `Hospital`, and `Blood Request` with clean ERD and Class diagrams.
* **[`docs/04_user_roles_and_workflows.md`](file:///a:/Nirma/DS/Assignment%201/docs/04_user_roles_and_workflows.md):** Clear workflows for Donors, Requesters, and Admins with end-to-end Store/Fetch/Retrieve sequence diagrams.
* **[`docs/05_system_architecture_and_folder_structure.md`](file:///a:/Nirma/DS/Assignment%201/docs/05_system_architecture_and_folder_structure.md):** Full-stack architecture, startup hydration, and repository layout.

---

## 🏗️ Clean Project Directory Structure

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
│   ├── config/
│   ├── core/
│   │   ├── data_structures/
│   │   └── compatibility.js
│   ├── controllers/
│   ├── routes/
│   └── server.js
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── tests/
```

---

## 🚦 Roadmap Progress

* [x] **Stage 01: Project Foundation & Requirements** (Scope, 6 Entities, 3 Roles, 3 Core Data Structures in Medium Mode, Git initialized).
* [ ] **Stage 02: Database & System Design** (MySQL schemas, ER diagrams, UML diagrams).
* [ ] **Stage 03: Professional UI/UX Design** (Clean React pages for Donor, Requester, Admin).
* [ ] **Stage 04: Backend & Database Integration** (Express routes, MySQL queries).
* [ ] **Stage 05: Data Structures Implementation** (Custom JS classes: `HashMap.js`, `PriorityQueue.js`, `Queue.js`).
* [ ] **Stage 06: Final Polish & Testing** (Unit tests, benchmarks, presentation).
