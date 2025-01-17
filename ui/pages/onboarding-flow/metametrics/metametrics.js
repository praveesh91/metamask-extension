import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Typography from '../../../components/ui/typography/typography';
import {
  TypographyVariant,
  FONT_WEIGHT,
  TEXT_ALIGN,
  TextColor,
  IconColor,
} from '../../../helpers/constants/design-system';
import Button from '../../../components/ui/button';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  setParticipateInMetaMetrics,
  setDataCollectionForMarketing,
} from '../../../store/actions';
import {
  getParticipateInMetaMetrics,
  getDataCollectionForMarketing,
  getFirstTimeFlowType,
  getFirstTimeFlowTypeRouteAfterMetaMetricsOptIn,
} from '../../../selectors';

import {
  MetaMetricsEventAccountType,
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';

import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  Checkbox,
  Icon,
  IconName,
  IconSize,
} from '../../../components/component-library';

import Box from '../../../components/ui/box/box';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';

export default function OnboardingMetametrics() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  const nextRoute = useSelector(getFirstTimeFlowTypeRouteAfterMetaMetricsOptIn);
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);

  const dataCollectionForMarketing = useSelector(getDataCollectionForMarketing);
  const participateInMetaMetrics = useSelector(getParticipateInMetaMetrics);

  const trackEvent = useContext(MetaMetricsContext);

  const onConfirm = async () => {
    if (dataCollectionForMarketing === null) {
      await dispatch(setDataCollectionForMarketing(false));
    }

    const [, metaMetricsId] = await dispatch(setParticipateInMetaMetrics(true));
    try {
      trackEvent(
        {
          category: MetaMetricsEventCategory.Onboarding,
          event: MetaMetricsEventName.WalletSetupStarted,
          properties: {
            account_type:
              firstTimeFlowType === FirstTimeFlowType.create
                ? MetaMetricsEventAccountType.Default
                : MetaMetricsEventAccountType.Imported,
          },
        },
        {
          isOptIn: true,
          metaMetricsId,
          flushImmediately: true,
        },
      );

      if (participateInMetaMetrics) {
        trackEvent({
          category: MetaMetricsEventCategory.Onboarding,
          event: MetaMetricsEventName.AppInstalled,
        });

        trackEvent({
          category: MetaMetricsEventCategory.Onboarding,
          event: MetaMetricsEventName.AnalyticsPreferenceSelected,
          properties: {
            is_metrics_opted_in: true,
            has_marketing_consent: Boolean(dataCollectionForMarketing),
            location: 'onboarding_metametrics',
          },
        });
      }
    } finally {
      history.push(nextRoute);
    }
  };

  const onCancel = async () => {
    await dispatch(setParticipateInMetaMetrics(false));
    await dispatch(setDataCollectionForMarketing(false));
    history.push(nextRoute);
  };

  return (
    <div
      className="onboarding-metametrics"
      data-testid="onboarding-metametrics"
    >
      <Typography
        variant={TypographyVariant.H2}
        align={TEXT_ALIGN.CENTER}
        fontWeight={FONT_WEIGHT.BOLD}
      >
        {t('onboardingMetametricsTitle')}
      </Typography>
      <Typography
        className="onboarding-metametrics__desc"
        align={TEXT_ALIGN.LEFT}
      >
        {t('onboardingMetametricsDescription')}
      </Typography>
      <Typography
        className="onboarding-metametrics__desc"
        align={TEXT_ALIGN.LEFT}
      >
        {t('onboardingMetametricsDescription2')}
      </Typography>
      <ul>
        <li>
          <Box>
            <Icon
              marginInlineEnd={2}
              name={IconName.Check}
              size={IconSize.Sm}
              color={IconColor.successDefault}
            />
            {t('onboardingMetametricsNeverCollect', [
              <Typography
                variant={TypographyVariant.span}
                key="never"
                fontWeight={FONT_WEIGHT.BOLD}
                marginTop={0}
              >
                {t('onboardingMetametricsNeverCollectEmphasis')}
              </Typography>,
            ])}
          </Box>
        </li>
        <li>
          <Box>
            <Icon
              marginInlineEnd={2}
              name={IconName.Check}
              size={IconSize.Sm}
              color={IconColor.successDefault}
            />
            {t('onboardingMetametricsNeverCollectIP', [
              <Typography
                variant={TypographyVariant.span}
                key="never-collect"
                fontWeight={FONT_WEIGHT.BOLD}
              >
                {t('onboardingMetametricsNeverCollectIPEmphasis')}
              </Typography>,
            ])}
          </Box>
        </li>
        <li>
          <Box>
            <Icon
              marginInlineEnd={2}
              name={IconName.Check}
              size={IconSize.Sm}
              color={IconColor.successDefault}
            />
            {t('onboardingMetametricsNeverSellData', [
              <Typography
                variant={TypographyVariant.span}
                key="never-sell"
                fontWeight={FONT_WEIGHT.BOLD}
              >
                {t('onboardingMetametricsNeverSellDataEmphasis')}
              </Typography>,
            ])}
          </Box>{' '}
        </li>
      </ul>
      <Checkbox
        id="metametrics-opt-in"
        isChecked={dataCollectionForMarketing}
        onClick={() =>
          dispatch(setDataCollectionForMarketing(!dataCollectionForMarketing))
        }
        label={t('onboardingMetametricsUseDataCheckbox')}
        paddingBottom={3}
      />
      <Typography
        color={TextColor.textAlternative}
        align={TEXT_ALIGN.LEFT}
        variant={TypographyVariant.H6}
        className="onboarding-metametrics__terms"
      >
        {t('onboardingMetametricsInfuraTerms', [
          <a
            href="https://metamask.io/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            key="privacy-link"
          >
            {t('onboardingMetametricsInfuraTermsPolicy')}
          </a>,
        ])}
      </Typography>

      <div className="onboarding-metametrics__buttons">
        <Button
          data-testid="metametrics-i-agree"
          type="primary"
          large
          onClick={onConfirm}
        >
          {t('onboardingMetametricsAgree')}
        </Button>
        <Button
          data-testid="metametrics-no-thanks"
          type="secondary"
          large
          onClick={onCancel}
        >
          {t('noThanks')}
        </Button>
      </div>
    </div>
  );
}
