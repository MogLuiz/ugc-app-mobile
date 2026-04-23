import assert from 'node:assert/strict'
import test from 'node:test'
import type { InfiniteData } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  extractWorkTypes,
  filterOpportunities,
  flattenOpportunityPages,
  isAddressRequiredError,
  selectDisplayableOpenOpportunities,
  sortOpportunities,
} from './helpers'
import type { OpportunityFilters, OpportunityListItem, OpportunityListResponse } from './types'

const baseItems: OpportunityListItem[] = [
  {
    id: '1',
    status: 'OPEN',
    description: 'Primeira',
    startsAt: '2026-05-02T12:00:00.000Z',
    durationMinutes: 60,
    jobFormattedAddress: 'Centro',
    offeredAmount: 400,
    expiresAt: '2026-05-01T12:00:00.000Z',
    platformFeeRateSnapshot: 0.2,
    jobType: { id: 'a', name: 'UGC' },
    createdAt: '2026-04-01T12:00:00.000Z',
    updatedAt: '2026-04-01T12:00:00.000Z',
    distanceKm: 4,
  },
  {
    id: '2',
    status: 'FILLED',
    description: 'Segunda',
    startsAt: '2026-05-03T12:00:00.000Z',
    durationMinutes: 120,
    jobFormattedAddress: 'Bairro',
    offeredAmount: 600,
    expiresAt: '2026-05-02T12:00:00.000Z',
    platformFeeRateSnapshot: 0.2,
    jobType: { id: 'b', name: 'Review' },
    createdAt: '2026-04-02T12:00:00.000Z',
    updatedAt: '2026-04-02T12:00:00.000Z',
    distanceKm: 10,
  },
  {
    id: '3',
    status: 'OPEN',
    description: 'Terceira',
    startsAt: '2026-05-01T12:00:00.000Z',
    durationMinutes: 90,
    jobFormattedAddress: 'Zona Sul',
    offeredAmount: 800,
    expiresAt: '2026-04-30T12:00:00.000Z',
    platformFeeRateSnapshot: 0.2,
    jobType: { id: 'c', name: 'Review' },
    createdAt: '2026-04-03T12:00:00.000Z',
    updatedAt: '2026-04-03T12:00:00.000Z',
    distanceKm: 2,
  },
]

test('selectDisplayableOpenOpportunities keeps only OPEN items', () => {
  assert.deepEqual(
    selectDisplayableOpenOpportunities(baseItems).map((item) => item.id),
    ['1', '3'],
  )
})

test('extractWorkTypes returns sorted unique values from loaded items', () => {
  assert.deepEqual(extractWorkTypes(baseItems), ['Review', 'UGC'])
})

test('filterOpportunities filters by work type and distance', () => {
  const filters: OpportunityFilters = { workType: 'UGC', distance: '5' }
  assert.deepEqual(
    filterOpportunities(baseItems, filters).map((item) => item.id),
    ['1'],
  )
})

test('sortOpportunities sorts by recent, value and distance', () => {
  assert.deepEqual(
    sortOpportunities(baseItems, 'recent').map((item) => item.id),
    ['2', '1', '3'],
  )
  assert.deepEqual(
    sortOpportunities(baseItems, 'value').map((item) => item.id),
    ['3', '2', '1'],
  )
  assert.deepEqual(
    sortOpportunities(baseItems, 'distance').map((item) => item.id),
    ['3', '1', '2'],
  )
})

test('isAddressRequiredError detects the backend 403 message', () => {
  const error = new AxiosError('Request failed', '403', undefined, undefined, {
    data: { message: 'Complete seu endereço para acessar oportunidades' },
    status: 403,
    statusText: 'Forbidden',
    headers: {},
    config: { headers: {} as never },
  })

  assert.equal(isAddressRequiredError(error), true)
  assert.equal(isAddressRequiredError(new Error('other')), false)
})

test('flattenOpportunityPages flattens accumulated pages', () => {
  const data: InfiniteData<OpportunityListResponse> = {
    pages: [
      {
        items: [baseItems[0]],
        pagination: { page: 1, limit: 24, total: 2, totalPages: 2 },
      },
      {
        items: [baseItems[2]],
        pagination: { page: 2, limit: 24, total: 2, totalPages: 2 },
      },
    ],
    pageParams: [1, 2],
  }

  assert.deepEqual(
    flattenOpportunityPages(data).map((item) => item.id),
    ['1', '3'],
  )
  assert.deepEqual(flattenOpportunityPages(undefined), [])
})
