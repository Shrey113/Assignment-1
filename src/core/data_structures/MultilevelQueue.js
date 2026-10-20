/**
 * ============================================================================
 * BloodLink Data Structures - Multilevel Priority Queue (MLQ) Triage Engine
 * ============================================================================
 * 
 * Academic Concept: Multilevel Queue (MLQ) Priority Dispatching.
 * Modeled after the Emergency Severity Index (ESI) Triage Protocol used in
 * real-world hospital emergency departments.
 * 
 * Architectural Design:
 * - Maintains 4 separate FIFO Queues partitioned by medical emergency severity:
 *     Level 1: CRITICAL  - STAT Emergency (< 1 hour response)
 *     Level 2: URGENT    - ICU / Active Deficit (< 4 hour response)
 *     Level 3: SCHEDULED - Elective Surgeries (< 24 hour response)
 *     Level 4: FUTURE    - Required by Date / Advance Reservation
 * 
 * Dispatching Rules:
 * - Strict Priority Precedence: The dispatcher serves Higher Priority Queues first.
 *   Queue 1 is completely drained before Queue 2 is served.
 * - Intra-Tier FIFO Fairness: Within the same urgency level, requests are served
 *   strictly in order of arrival (First-In, First-Out), eliminating starvation.
 * 
 * Time Complexities:
 * - Enqueue: O(1) Constant Time (Direct routing to appropriate queue tier)
 * - Dequeue: O(1) Constant Time (Top priority queue head extraction)
 * - Peek:    O(1) Constant Time
 */

import { Queue } from './Queue.js';

export const TRIAGE_TIERS = {
  CRITICAL: { level: 1, id: 'CRITICAL' },
  URGENT: { level: 2, id: 'URGENT' },
  SCHEDULED: { level: 3, id: 'SCHEDULED' },
  FUTURE: { level: 4, id: 'FUTURE' }
};

export class MultilevelQueue {
  constructor() {
    // 4 distinct FIFO Queues
    this.criticalQueue = new Queue();   // Tier 1
    this.urgentQueue = new Queue();     // Tier 2
    this.scheduledQueue = new Queue();  // Tier 3
    this.futureQueue = new Queue();     // Tier 4

    this.totalEnqueuedCount = 0;
    this.totalDispatchedCount = 0;
  }

  classifyTier(req) {
    // Priority 1: STAT Immediate Emergency or Explicitly Critical
    if (req.isImmediate === true || req.urgency === 'CRITICAL') {
      return TRIAGE_TIERS.CRITICAL;
    }

    // Priority 2: Inpatient Urgent Requirement (< 4h)
    if (req.urgency === 'URGENT') {
      return TRIAGE_TIERS.URGENT;
    }

    // Priority 3: Elective / Scheduled Surgery (< 24h)
    if (req.urgency === 'SCHEDULED') {
      return TRIAGE_TIERS.SCHEDULED;
    }

    // Priority 4: Specified Future Date Reservation
    if (req.requiredDate && !req.isImmediate) {
      return TRIAGE_TIERS.FUTURE;
    }

    // Fallback default: Urgent triage
    return TRIAGE_TIERS.URGENT;
  }

  enqueue(requestData) {
    const tier = this.classifyTier(requestData);

    const requisitionItem = {
      ...requestData,
      id: requestData.id || `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      triageLevel: tier.level,
      triageId: tier.id,
      enqueuedAt: new Date().toISOString()
    };

    switch (tier.id) {
      case 'CRITICAL':
        this.criticalQueue.enqueue(requisitionItem);
        break;
      case 'URGENT':
        this.urgentQueue.enqueue(requisitionItem);
        break;
      case 'SCHEDULED':
        this.scheduledQueue.enqueue(requisitionItem);
        break;
      case 'FUTURE':
      default:
        this.futureQueue.enqueue(requisitionItem);
        break;
    }

    this.totalEnqueuedCount++;

    return {
      success: true,
      requestId: requisitionItem.id,
      tier: tier,
      queuePosition: this.getQueueSizeForTier(tier.id),
      enqueuedAt: requisitionItem.enqueuedAt
    };
  }

  dequeue() {
    let dequeuedItem = null;
    let servedTier = null;

    if (!this.criticalQueue.isEmpty()) {
      dequeuedItem = this.criticalQueue.dequeue();
      servedTier = TRIAGE_TIERS.CRITICAL;
    } else if (!this.urgentQueue.isEmpty()) {
      dequeuedItem = this.urgentQueue.dequeue();
      servedTier = TRIAGE_TIERS.URGENT;
    } else if (!this.scheduledQueue.isEmpty()) {
      dequeuedItem = this.scheduledQueue.dequeue();
      servedTier = TRIAGE_TIERS.SCHEDULED;
    } else if (!this.futureQueue.isEmpty()) {
      dequeuedItem = this.futureQueue.dequeue();
      servedTier = TRIAGE_TIERS.FUTURE;
    }

    if (!dequeuedItem) {
      return null;
    }

    this.totalDispatchedCount++;

    return {
      request: dequeuedItem,
      triage: {
        tier: servedTier.level,
        tierId: servedTier.id,
        dispatchedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Peeks at the highest-priority request ready to be dispatched without removing it.
   * Time Complexity: O(1)
   * @returns {Object|null}
   */
  peek() {
    if (!this.criticalQueue.isEmpty()) return this.criticalQueue.peek();
    if (!this.urgentQueue.isEmpty()) return this.urgentQueue.peek();
    if (!this.scheduledQueue.isEmpty()) return this.scheduledQueue.peek();
    if (!this.futureQueue.isEmpty()) return this.futureQueue.peek();
    return null;
  }

  /**
   * Checks if all 4 priority queues are empty.
   * @returns {boolean}
   */
  isEmpty() {
    return (
      this.criticalQueue.isEmpty() &&
      this.urgentQueue.isEmpty() &&
      this.scheduledQueue.isEmpty() &&
      this.futureQueue.isEmpty()
    );
  }

  /**
   * Returns current count of requests for a specific tier.
   * @param {string} tierId
   * @returns {number}
   */
  getQueueSizeForTier(tierId) {
    switch (tierId) {
      case 'CRITICAL': return this.criticalQueue.size();
      case 'URGENT': return this.urgentQueue.size();
      case 'SCHEDULED': return this.scheduledQueue.size();
      case 'FUTURE': return this.futureQueue.size();
      default: return 0;
    }
  }

  /**
   * Returns real-time statistics across all 4 queues.
   * @returns {Object}
   */
  getStatus() {
    return {
      critical: this.criticalQueue.size(),
      urgent: this.urgentQueue.size(),
      scheduled: this.scheduledQueue.size(),
      future: this.futureQueue.size(),
      totalPending:
        this.criticalQueue.size() +
        this.urgentQueue.size() +
        this.scheduledQueue.size() +
        this.futureQueue.size(),
      totalEnqueuedLifetime: this.totalEnqueuedCount,
      totalDispatchedLifetime: this.totalDispatchedCount
    };
  }

  /**
   * Returns complete array snapshots of all 4 queues for audit and UI inspectors.
   * @returns {Object}
   */
  getSnapshot() {
    return {
      critical: this.criticalQueue.toArray(),
      urgent: this.urgentQueue.toArray(),
      scheduled: this.scheduledQueue.toArray(),
      future: this.futureQueue.toArray(),
      stats: this.getStatus()
    };
  }

  /**
   * Drains and clears all 4 queues.
   */
  clear() {
    this.criticalQueue.clear();
    this.urgentQueue.clear();
    this.scheduledQueue.clear();
    this.futureQueue.clear();
  }
}

// Global Singleton Instance for In-Memory Triage Dispatch
export const triageMLQ = new MultilevelQueue();

export default MultilevelQueue;
