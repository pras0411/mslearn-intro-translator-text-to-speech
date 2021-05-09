import React, { useEffect, useState } from "react";

// local imports
import "./LanguageSettingsEditor.css";
import { SelectField, RangeField } from "../formControls";
import { getVoicesForLocale } from "../../api";
import { adjustments, STATUS } from "../../constants";
import { getDefaultVoiceAdjustments } from "../../utility";
import { usePrevious } from "../../hooks";

export const LanguageSettingsEditor = ({
  updateCurrentLanguageSetting,
  currentLanguageSetting,
  availableLocales,
  submitting,
}) => {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(STATUS.idle);
  const prevLanguageSetting = usePrevious(currentLanguageSetting);
  const shouldFetchVoices =
    !availableVoices ||
    (prevLanguageSetting &&
      currentLanguageSetting.locale !== prevLanguageSetting.locale) ||
    !currentLanguageSetting.voice;

  /**
   * Determines and updates if the voices for the current settings need to be loaded again
   * by setting a status
   */
  useEffect(() => {
    if (shouldFetchVoices) {
      setLoadingStatus(STATUS.idle);
    }
  }, [shouldFetchVoices]);

  /**
   * Get and set voices based on the currently selected local if it hasn't already been fetched
   */
  useEffect(() => {
    const getVoicesForSelectedLocale = async () => {
      setLoadingStatus(STATUS.pending);
      const voices = await getVoicesForLocale(
        currentLanguageSetting.locale.locale
      );
      const updatedVoices = voices.map((v) => ({
        ...v,
        value: v.voiceShortName,
        label: v.displayName,
        adjustments: getDefaultVoiceAdjustments(v),
      }));
      if (!currentLanguageSetting.voice) {
        const defaultVoice = updatedVoices[0];
        const updatedSetting = {
          ...currentLanguageSetting,
          voice: defaultVoice,
        };
        updateCurrentLanguageSetting(updatedSetting);
      }
      setAvailableVoices(updatedVoices);
      setLoadingStatus(STATUS.success);
    };
    if (shouldFetchVoices && loadingStatus === STATUS.idle) {
      getVoicesForSelectedLocale();
    }
  }, [
    availableVoices,
    currentLanguageSetting,
    loadingStatus,
    shouldFetchVoices,
    updateCurrentLanguageSetting,
  ]);

  const updateRangeAdjustment = (name, value) => {
    const updatedSetting = {
      ...currentLanguageSetting,
      voice: {
        ...currentLanguageSetting.voice,
        adjustments: {
          ...currentLanguageSetting.voice.adjustments,
          [name]: value,
        },
      },
    };
    updateCurrentLanguageSetting(updatedSetting);
  };

  const getStyleOptions = () => {
    const styles = currentLanguageSetting.voice.styles;
    if (!styles || styles.length === 0) {
      return [];
    }
    return styles.map((v) => ({
      ...v,
      value: v.styleName,
      label: v.displayName,
    }));
  };

  if (
    shouldFetchVoices ||
    loadingStatus === STATUS.idle ||
    loadingStatus === STATUS.pending
  ) {
    return null;
  }
  return (
    <div className="LanguageSettingsEditor d-flex flex-row">
      <div className="pr-2">
        <SelectField
          name="locale"
          label="Locale"
          placeholder="Select some target locales"
          errorMessage="Please select a target language."
          value={currentLanguageSetting.locale}
          options={availableLocales.map((v) => ({
            ...v,
            value: v.locale,
            label: v.displayName,
          }))}
          onChange={(option) => {
            if (currentLanguageSetting.locale.locale === option.value) {
              return;
            }
            const updatedSetting = {
              ...currentLanguageSetting,
              locale: option,
              voice: undefined,
            };
            updateCurrentLanguageSetting(updatedSetting);
          }}
          disabled={submitting}
        />
      </div>
      <div className="pr-2">
        <SelectField
          name="voice"
          label="Voice"
          placeholder="Select a voice"
          errorMessage="Please select a voice."
          options={availableVoices.map((v) => ({
            ...v,
            value: v.voiceShortName,
            label: v.displayName,
          }))}
          disabled={submitting}
          value={currentLanguageSetting.voice}
          onChange={(option) => {
            if (
              currentLanguageSetting?.voice?.voiceShortName ===
              option.voiceShortName
            ) {
              return;
            }
            updateCurrentLanguageSetting({
              ...currentLanguageSetting,
              voice: option,
            });
          }}
        />
      </div>
      {!currentLanguageSetting.voice.adjustments.style ||
      currentLanguageSetting.voice.adjustments.style.length === 0 ? (
        <div className="pr-2">
          <label>Style</label>
          <SelectField
            name={adjustments.style.name}
            value={currentLanguageSetting.voice.adjustments.style}
            options={getStyleOptions()}
            onChange={(option) => {
              const currentStyle =
                currentLanguageSetting.voice.adjustments.style.value;
              if (currentStyle === option.value) {
                return;
              }
              updateCurrentLanguageSetting({
                ...currentLanguageSetting,
                voice: {
                  ...currentLanguageSetting.voice,
                  adjustments: {
                    ...currentLanguageSetting.voice.adjustments,
                    style: option,
                  },
                },
              });
            }}
            disabled={submitting}
          />
        </div>
      ) : null}
      {currentLanguageSetting.voice.adjustments.pitch ? (
        <div className="pr-2">
          <RangeField
            name={adjustments.pitch.name}
            label={adjustments.pitch.displayName}
            onChange={(value) =>
              updateRangeAdjustment(adjustments.rate.name, value)
            }
            value={currentLanguageSetting.voice.adjustments.pitch}
            min={0}
            max={10}
            disabled={submitting}
          />
        </div>
      ) : null}
      {currentLanguageSetting.voice.adjustments.rate ? (
        <div>
          <RangeField
            name={adjustments.rate.name}
            label={adjustments.rate.displayName}
            onChange={(value) =>
              updateRangeAdjustment(adjustments.rate.name, value)
            }
            value={currentLanguageSetting.voice.adjustments.rate}
            min={0}
            max={300}
            disabled={submitting}
          />
        </div>
      ) : null}
      <div></div>
    </div>
  );
};
