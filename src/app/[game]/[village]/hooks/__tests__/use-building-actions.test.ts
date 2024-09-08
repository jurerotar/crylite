import { QueryClient } from '@tanstack/react-query';
import { useBuildingActions } from 'app/[game]/[village]/hooks/use-building-actions';
import { currentServerCacheKey } from 'app/[game]/hooks/use-current-server';
import { eventsCacheKey } from 'app/[game]/hooks/use-events';
import { getBuildingData } from 'app/[game]/utils/building';
import type { GameEvent } from 'interfaces/models/events/game-event';
import type { Server } from 'interfaces/models/game/server';
import {
  clayPitUpgradeLevel1EventMock,
  clayPitUpgradeLevel2EventMock,
  mainBuildingUpgradeLevel1EventMock,
  mainBuildingUpgradeLevel2EventMock,
} from 'mocks/game/event-mock';
import { romanServerMock } from 'mocks/game/server-mock';
import { renderHookWithGameContext } from 'test-utils';
import { type Mock, describe, vi } from 'vitest';

const clayPit = getBuildingData('CLAY_PIT');
const mainBuilding = getBuildingData('MAIN_BUILDING');

beforeAll(() => {
  vi.spyOn(Date, 'now').mockReturnValue(0);
});

afterAll(() => {
  (Date.now as Mock).mockRestore();
});

// The only important thing here is the "calculateResolvesAt" function, so we only test that
describe('calculateResolvesAt', () => {
  test('With no building events happening, new building event should resolve in time it takes to construct said building', () => {
    const { result } = renderHookWithGameContext(() => useBuildingActions('CLAY_PIT', 5));
    const { calculateResolvesAt } = result.current;

    expect(calculateResolvesAt()).toBe(clayPit.buildingDuration[0]);
  });

  test('With a building event happening, new building event should resolve in time it takes to construct said building + the building before', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<GameEvent[]>([eventsCacheKey], [clayPitUpgradeLevel1EventMock]);

    const { result } = renderHookWithGameContext(() => useBuildingActions('CLAY_PIT', 5), { queryClient });
    const { calculateResolvesAt } = result.current;

    expect(calculateResolvesAt()).toBe(clayPit.buildingDuration[0] + clayPit.buildingDuration[1]);
  });

  test('With multiple building events happening, new building event should resolve in time it takes to construct said building + all of the events before it', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<GameEvent[]>([eventsCacheKey], [clayPitUpgradeLevel1EventMock, clayPitUpgradeLevel2EventMock]);

    const { result } = renderHookWithGameContext(() => useBuildingActions('CLAY_PIT', 5), { queryClient });
    const { calculateResolvesAt } = result.current;

    // Normally this would be the sum of all 3 events, but we attach the next event to the end of the previous one, so we only need to look
    // at last one in this case
    expect(calculateResolvesAt()).toBe(clayPit.buildingDuration[1] + clayPit.buildingDuration[2]);
  });

  test('As roman, a village building should not delay a resource building', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<Server>([currentServerCacheKey], romanServerMock);
    queryClient.setQueryData<GameEvent[]>([eventsCacheKey], [mainBuildingUpgradeLevel1EventMock]);

    const { result } = renderHookWithGameContext(() => useBuildingActions('CLAY_PIT', 5), { queryClient });
    const { calculateResolvesAt } = result.current;

    expect(calculateResolvesAt()).toBe(clayPit.buildingDuration[0]);
  });

  test('As roman, a resource building should not delay a village building', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<Server>([currentServerCacheKey], romanServerMock);
    queryClient.setQueryData<GameEvent[]>([eventsCacheKey], [clayPitUpgradeLevel1EventMock]);

    const { result } = renderHookWithGameContext(() => useBuildingActions('MAIN_BUILDING', 38), { queryClient });
    const { calculateResolvesAt } = result.current;

    expect(calculateResolvesAt()).toBe(mainBuilding.buildingDuration[1]);
  });

  test('As roman, second resource building event should only be delayed by previous resource building events', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<Server>([currentServerCacheKey], romanServerMock);
    queryClient.setQueryData<GameEvent[]>([eventsCacheKey], [mainBuildingUpgradeLevel1EventMock, clayPitUpgradeLevel1EventMock]);

    const { result } = renderHookWithGameContext(() => useBuildingActions('CLAY_PIT', 5), { queryClient });
    const { calculateResolvesAt } = result.current;

    expect(calculateResolvesAt()).toBe(clayPit.buildingDuration[0] + clayPit.buildingDuration[1]);
  });

  test('As roman, second village building event should only be delayed by previous village building events', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<Server>([currentServerCacheKey], romanServerMock);
    queryClient.setQueryData<GameEvent[]>([eventsCacheKey], [mainBuildingUpgradeLevel2EventMock, clayPitUpgradeLevel1EventMock]);

    const { result } = renderHookWithGameContext(() => useBuildingActions('MAIN_BUILDING', 38), { queryClient });
    const { calculateResolvesAt } = result.current;

    expect(calculateResolvesAt()).toBe(mainBuilding.buildingDuration[1] + mainBuilding.buildingDuration[2]);
  });
});
