import Typist from "react-typist";
import { useEffect } from "react";
import className from "classnames";

// local imports
import "./TranslationResults.css";
import { STATUS } from "../../constants";
import { wait } from "../../utility";

const typingDelay = 50;

const getTranslationDelay = (text, audioDuration) => {
  const typingDuration = text.length * typingDelay;
  return audioDuration * 1000 > typingDuration
    ? audioDuration * 1000 - typingDuration
    : 0;
};

export const TranslationResults = ({ results, processingStatus }) => {
  const hasResults =
    processingStatus === STATUS.success && results && results.length > 0;
  useEffect(() => {
    const playAudio = async (results) => {
      for (let index = 0; index < results.length; index++) {
        const translation = results[index];
        await translation.audioElement.play();
        await wait(translation.duration * 1000);
      }
    };
    if (hasResults) {
      playAudio(results);
    }
  }, [results, hasResults]);
  return (
    <div
      className={className({
        TranslationResults: true,
        "TranslationResults--hasResults": hasResults,
      })}
    >
      {hasResults ? (
        <Typist
          avgTypingDelay={typingDelay}
          cursor={{
            show: false,
          }}
        >
          {results.map((translation) => {
            return (
              <span>
                <p key={translation.translatedText}>
                  {translation.translatedText}
                </p>
                <Typist.Delay
                  ms={getTranslationDelay(
                    translation.translatedText,
                    translation.duration
                  )}
                />
              </span>
            );
          })}
        </Typist>
      ) : null}{" "}
    </div>
  );
};
