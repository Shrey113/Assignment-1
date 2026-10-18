# BloodLink: DS-Based Blood Donor & Emergency Management System

> **Data Structures Core Assignment — Stage 01: Foundation & Requirements**  
> A streamlined, fast-to-build emergency blood allocation platform powered by core in-memory Data Structures for **instant Data Storing, Fetching, and Retrieving**.

---

## 📌 Executive Summary

**BloodLink** replaces sluggish linear database searches with an in-memory **Data Structures Engine** that handles emergency requests, donor searches, and stock lookups at microsecond speeds.

### Core Data Structures
1. **Custom Hash Map ($O(1)$):** Stores donors and stock for instantaneous key-value retrieval by blood group and ID.
2. **Priority Queue / Max-Heap ($O(\log N)$):** Ranks emergency blood requisitions so the most critical patient is always served first.
3. **Standard FIFO Queue ($O(1)$):** Handles routine, non-emergency requests in fair first-come, first-served order.
4. **Blood Compatibility Dictionary ($O(1)$):** Instant single-line lookup for safe donor-recipient matches.

---

## 📂 Documentation Directory

All finalized specifications are organized in the **[`docs/`](file:///a:/Nirma/DS/Assignment%201/docs/README.md)** folder:

* **[`docs/01_project_scope.md`](file:///a:/Nirma/DS/Assignment%201/docs/01_project_scope.md):** Streamlined scope, functional requirements for storing/fetching/retrieving, and boundaries.
* **[`docs/02_data_structures_architecture.md`](file:///a:/Nirma/DS/Assignment%201/docs/02_data_structures_architecture.md):** Detailed designs and implementation contracts for Hash Map, Priority Queue, and Queue.
* **[`docs/03_entity_definitions.md`](file:///a:/Nirma/DS/Assignment%201/docs/03_entity_definitions.md):** Practical schemas for `Donor`, `Blood Group`, `Donation`, `Blood Bank`, `Hospital`, and `Blood Request` with clean ERD and Class diagrams.
* **[`docs/04_user_roles_and_workflows.md`](file:///a:/Nirma/DS/Assignment%201/docs/04_user_roles_and_workflows.md):** Clear, easy-to-build workflows for Donors, Requesters, and Admins with sequence diagrams.
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

* [x] **Stage 01: Project Foundation & Requirements** (Scope, 6 Entities, 3 Roles, 3 Core Data Structures, Git initialized).
* [ ] **Stage 02: Database & System Design** (MySQL schemas, ER diagrams, UML diagrams).
* [ ] **Stage 03: Professional UI/UX Design** (Clean React pages for Donor, Requester, Admin).
* [ ] **Stage 04: Backend & Database Integration** (Express routes, MySQL queries).
* [ ] **Stage 05: Data Structures Implementation** (Custom JS classes: `HashMap.js`, `PriorityQueue.js`, `Queue.js`).
* [ ] **Stage 06: Final Polish & Testing** (Unit tests, benchmarks, presentation).
