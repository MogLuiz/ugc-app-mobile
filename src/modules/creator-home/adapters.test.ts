import assert from 'node:assert/strict'
import test from 'node:test'
import type { CreatorHubItem } from '@/modules/contract-requests/creator-hub.types'
import { adaptHubUpcoming, adaptPendingActions } from './adapters'

function makeItem(overrides: Partial<CreatorHubItem> = {}): CreatorHubItem {
  return {
    id: 'x',
    kind: 'contract',
    displayStatus: 'ACCEPTED',
    company: { id: 'c', name: 'Empresa', logoUrl: null, rating: null, reviewCount: 0 },
    jobTypeName: 'UGC',
    title: 'Job',
    totalAmount: 10000,
    currency: 'BRL',
    startsAt: '2026-06-01T14:00:00Z',
    finalizedAt: null,
    effectiveExpiresAt: null,
    expiresSoon: false,
    openOfferId: null,
    address: 'Rua A',
    locationDisplay: null,
    primaryAction: 'VIEW',
    actionRequired: false,
    canAccept: false,
    canReject: false,
    canCancel: false,
    canConfirmCompletion: false,
    canDispute: false,
    myReviewPending: null,
    ...overrides,
  }
}

const now = new Date('2026-05-01T00:00:00Z')

test('adaptHubUpcoming excludes items with displayStatus AWAITING_CONFIRMATION', () => {
  const items = [
    makeItem({ id: '1', displayStatus: 'ACCEPTED' }),
    makeItem({ id: '2', displayStatus: 'AWAITING_CONFIRMATION' }),
  ]
  const result = adaptHubUpcoming(items, now)
  assert.deepEqual(result.map((i) => i.id), ['1'])
})

test('adaptHubUpcoming excludes items with primaryAction CONFIRM_OR_DISPUTE', () => {
  const items = [
    makeItem({ id: '1', primaryAction: 'VIEW' }),
    makeItem({ id: '2', primaryAction: 'CONFIRM_OR_DISPUTE' }),
  ]
  const result = adaptHubUpcoming(items, now)
  assert.deepEqual(result.map((i) => i.id), ['1'])
})

test('adaptHubUpcoming excludes items with canConfirmCompletion true', () => {
  const items = [
    makeItem({ id: '1', canConfirmCompletion: false }),
    makeItem({ id: '2', canConfirmCompletion: true }),
  ]
  const result = adaptHubUpcoming(items, now)
  assert.deepEqual(result.map((i) => i.id), ['1'])
})

test('adaptPendingActions returns confirmations before reviews', () => {
  const inProgress = [
    makeItem({ id: 'c1', displayStatus: 'AWAITING_CONFIRMATION' }),
  ]
  const completed = [
    makeItem({
      id: 'r1',
      displayStatus: 'COMPLETED',
      myReviewPending: true,
      finalizedAt: '2026-04-20T00:00:00Z',
    }),
  ]
  const result = adaptPendingActions(inProgress, completed)
  assert.deepEqual(result.map((i) => i.id), ['c1', 'r1'])
  assert.equal(result[0].kind, 'confirm_completion')
  assert.equal(result[1].kind, 'review_company')
})

test('adaptPendingActions only includes reviews where myReviewPending === true', () => {
  const inProgress: CreatorHubItem[] = []
  const completed = [
    makeItem({
      id: 'r1',
      displayStatus: 'COMPLETED',
      myReviewPending: true,
      finalizedAt: '2026-04-20T00:00:00Z',
    }),
    makeItem({
      id: 'r2',
      displayStatus: 'COMPLETED',
      myReviewPending: false,
      finalizedAt: '2026-04-21T00:00:00Z',
    }),
    makeItem({
      id: 'r3',
      displayStatus: 'COMPLETED',
      myReviewPending: null,
      finalizedAt: '2026-04-22T00:00:00Z',
    }),
  ]
  const result = adaptPendingActions(inProgress, completed)
  assert.deepEqual(result.map((i) => i.id), ['r1'])
})

test('adaptPendingActions includes confirmations from all three signal fields', () => {
  const inProgress = [
    makeItem({ id: 'a', displayStatus: 'AWAITING_CONFIRMATION', primaryAction: 'VIEW', canConfirmCompletion: false }),
    makeItem({ id: 'b', displayStatus: 'ACCEPTED', primaryAction: 'CONFIRM_OR_DISPUTE', canConfirmCompletion: false }),
    makeItem({ id: 'c', displayStatus: 'ACCEPTED', primaryAction: 'VIEW', canConfirmCompletion: true }),
    makeItem({ id: 'd', displayStatus: 'ACCEPTED', primaryAction: 'VIEW', canConfirmCompletion: false }),
  ]
  const result = adaptPendingActions(inProgress, [])
  assert.deepEqual(result.map((i) => i.id).sort(), ['a', 'b', 'c'])
})
