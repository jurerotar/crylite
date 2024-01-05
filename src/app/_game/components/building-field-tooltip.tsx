import { BuildingFieldId } from 'interfaces/models/game/village';
import React from 'react';
import { useCurrentVillage } from 'hooks/game/use-current-village';
import { getBuildingData, getBuildingFieldByBuildingFieldId } from 'utils/game/common';
import { useTranslation } from 'react-i18next';
import { Icon } from 'components/icon';
import { Resources } from 'app/_game/components/resources';
import { formatTime } from 'utils/time';

type BuildingFieldTooltipProps = {
  buildingFieldId: BuildingFieldId;
};

export const BuildingFieldTooltip: React.FC<BuildingFieldTooltipProps> = ({ buildingFieldId }) => {
  const { t } = useTranslation();
  const { currentVillage } = useCurrentVillage();
  const buildingField = getBuildingFieldByBuildingFieldId(currentVillage, buildingFieldId);

  if (!buildingField) {
    return t('APP.GAME.VILLAGE.BUILDING_FIELD.EMPTY');
  }

  const { level, buildingId } = buildingField;
  const { nextLevelBuildingDuration, nextLevelResourceCost, isMaxLevel } = getBuildingData(buildingId, level);

  const title = `${t(`BUILDINGS.${buildingId}.NAME`)} ${t('GENERAL.LEVEL', { level }).toLowerCase()}`;
  const formattedTime = formatTime(nextLevelBuildingDuration * 1000);

  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold">{title}</span>
      {isMaxLevel && (
        <span>{t('APP.GAME.VILLAGE.BUILDING_FIELD.MAX_LEVEL')}</span>
      )}
      {!isMaxLevel && (
        <>
          <span className="text-gray-300">{t('APP.GAME.VILLAGE.BUILDING_FIELD.NEXT_LEVEL_COST', { level: level + 1 })}</span>
          <Resources resources={nextLevelResourceCost} />
          <span className="flex gap-1">
            <Icon type="buildingDuration" />
            {formattedTime}
          </span>
        </>
      )}
    </div>
  );
}
