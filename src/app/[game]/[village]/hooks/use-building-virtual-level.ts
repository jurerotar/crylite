import { useCurrentVillage } from 'app/[game]/hooks/use-current-village';
import { useEvents } from 'app/[game]/hooks/use-events';
import type { Building } from 'interfaces/models/game/building';
import type { BuildingField } from 'interfaces/models/game/village';

export const useBuildingVirtualLevel = (buildingId: Building['id'], buildingFieldId: BuildingField['id']) => {
  const { currentVillage } = useCurrentVillage();
  const { currentVillageBuildingEvents } = useEvents();

  const buildingLevel = (() => {
    const sameBuildingConstructionEvents = currentVillageBuildingEvents.filter(({ buildingFieldId: eventBuildingFieldId, building }) => {
      return building.id === buildingId && eventBuildingFieldId === buildingFieldId;
    });

    if (sameBuildingConstructionEvents.length > 0) {
      return (currentVillage.buildingFields.find(({ id }) => id === buildingFieldId)?.level ?? 0) + sameBuildingConstructionEvents.length;
    }

    return currentVillage.buildingFields.find(({ id }) => id === buildingFieldId)?.level ?? 0;
  })();

  return {
    buildingLevel,
  };
};
