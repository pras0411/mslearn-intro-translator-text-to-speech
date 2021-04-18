import React, { useEffect, useState } from "react";
import className from "classnames";

// local imports
import "./App.css";
import {
  LanguageSettings,
  TextAreaField,
  TranslationResults,
} from "./components";
import { presetPhrases, presetLanguageSettings, STATUS } from "./constants";
import { synthesizeText, getLocales } from "./api";

export const App = () => {
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);
  const [languageSettings, setLanguageSettings] = useState(
    presetLanguageSettings
  );
  const [textToTranslate, setTextToTranslate] = useState();
  const [availableLocales, setAvailableLocales] = useState([]);
  const [processingStatus, setProcessingStatus] = useState(STATUS.idle);
  const submitting = processingStatus === STATUS.pending;
  const [translationResults, setTranslationResults] = useState([]);

  const processTextToSpeech = async (text) => {
    try {
      setProcessingStatus(STATUS.pending);
      setTranslationResults([]);
      const response = await synthesizeText(
        text,
        languageSettings.map((setting) => ({
          targetLanguage: setting.locale.language,
          voiceName: setting.voice.voiceShortName,
        }))
      );
      setTranslationResults(response);
      setProcessingStatus(STATUS.success);
    } catch (error) {
      setProcessingStatus(STATUS.failure);
    }
  };

  useEffect(() => {
    const getAndSetAvailableLocales = async () => {
      const response = await getLocales();
      setAvailableLocales(response);
    };
    getAndSetAvailableLocales();
  }, []);

  if (!availableLocales || availableLocales.length === 0) {
    return null;
  }
  return (
    <>
      <main className="container">
        <header className="PageHeader row">
          <div className="col-6">
            <h1 className="PageHeader__heading">
              Translator &amp; Text to Speech
            </h1>
            <p className="PageHeader__text">
              Write an announcement or select a pre-made announcement, and
              select the languages to translate your messages into. Translator
              service will translate your message into new languages, and
              text-to-speech will read out your message in the selected
              languages.
            </p>
          </div>
        </header>
        <div className="row py-4">
          <div className="col-6">
            <>
              <form
                aria-label="Text to Speech"
                onSubmit={(e) => {
                  e.preventDefault();
                  processTextToSpeech(textToTranslate);
                }}
                autoComplete={false}
              >
                <LanguageSettings
                  availableLocales={availableLocales}
                  currentLanguageSetting={
                    languageSettings[selectedLanguageIndex]
                  }
                  updateCurrentLanguageSetting={(updatedValue) => {
                    const updatedSettings = [...languageSettings];
                    updatedSettings[selectedLanguageIndex] = updatedValue;
                    setLanguageSettings(updatedSettings);
                  }}
                  submitting={submitting}
                />
                <TextAreaField
                  name="text"
                  placeholder="This is the final call for flight AA123 to Buenos Aires"
                  errorMessage="Please enter some text"
                  value={textToTranslate}
                  onChange={(value) => setTextToTranslate(value)}
                  isMultiline
                  disabled={submitting}
                  className="TranslatorTextInput"
                />
                <div className="row py-4">
                  <div className="col">
                    <h4>Selected languages</h4>
                    <div className="row">
                      <div className="col  d-flex flex-wrap">
                        {languageSettings.map(({ locale }, index) => {
                          return (
                            <button
                              key={locale.locale}
                              className={className({
                                btn: true,
                                flex: true,
                                "btn-language": true,
                                "btn-light": index !== selectedLanguageIndex,
                                "btn-primary": index === selectedLanguageIndex,
                              })}
                              disabled={submitting}
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedLanguageIndex(index);
                              }}
                            >
                              {locale.displayName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row py-4">
                  <div className="col">
                    <h4>Pre made phrases</h4>
                    <div className="d-flex flex-wrap flex-row">
                      {presetPhrases.map((text) => (
                        <button
                          key={text}
                          onClick={() => processTextToSpeech(text)}
                          className={className({
                            btn: true,
                            flex: true,
                            "btn-phrase": true,
                          })}
                          disabled={submitting}
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <button
                      className="btn btn-primary btn-wide float-right"
                      type="submit"
                      disabled={submitting}
                    >
                      Translate
                    </button>
                  </div>
                </div>
              </form>
            </>
          </div>
          <div className="col-6">
            <TranslationResults
              results={translationResults}
              processingStatus={processingStatus}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default App;
