import { TTSConfig, TTSConfigValidator } from "../store";
import React, { useState } from "react";

import Locale from "../locales";
import { ListItem, Select } from "./ui-lib";
import {
  ModelProvider,
  DEFAULT_TTS_ENGINE,
  DEFAULT_TTS_ENGINES,
  DEFAULT_TTS_MODELS,
  DEFAULT_TTS_VOICES,
} from "../constant";
import { InputRange } from "./input-range";
import { IconButton } from "./button";
import SpeakIcon from "../icons/speak.svg";
import SpeakStopIcon from "../icons/speak-stop.svg";
import { createTTSPlayer } from "../utils/audio";
import { useAppConfig } from "../store";
import { ClientApi } from "../client/api";

const ttsPlayer = createTTSPlayer();
export function TTSConfigList(props: {
  ttsConfig: TTSConfig;
  updateConfig: (updater: (config: TTSConfig) => void) => void;
}) {
  const [speechLoading, setSpeechLoading] = useState(false);
  const [speechStatus, setSpeechStatus] = useState(false);

  async function openaiSpeech(text: string) {
    if (speechStatus) {
      ttsPlayer.stop();
      setSpeechStatus(false);
    } else {
      var api: ClientApi;
      api = new ClientApi(ModelProvider.GPT);
      const config = useAppConfig.getState();
      setSpeechLoading(true);
      ttsPlayer.init();
      let audioBuffer: ArrayBuffer;
      audioBuffer = await api.llm.speech({
        model: config.ttsConfig.model,
        input: text,
        voice: config.ttsConfig.voice,
        speed: config.ttsConfig.speed,
      });
      setSpeechStatus(true);
      ttsPlayer
        .play(audioBuffer, () => {
          setSpeechStatus(false);
        })
        .catch((e) => {
          console.error("[OpenAI Speech]", e);
          setSpeechStatus(false);
        })
        .finally(() => setSpeechLoading(false));
    }
  }
  return (
    <>
      <ListItem
        title={Locale.Settings.TTS.Enable.Title}
        subTitle={Locale.Settings.TTS.Enable.SubTitle}
      >
        <input
          type="checkbox"
          checked={props.ttsConfig.enable}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.enable = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>
      {/* <ListItem
        title={Locale.Settings.TTS.Autoplay.Title}
        subTitle={Locale.Settings.TTS.Autoplay.SubTitle}
      >
        <input
          type="checkbox"
          checked={props.ttsConfig.autoplay}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.autoplay = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem> */}
      <ListItem title={Locale.Settings.TTS.Engine}>
        <Select
          value={props.ttsConfig.engine}
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.engine = TTSConfigValidator.engine(
                  e.currentTarget.value,
                )),
            );
          }}
        >
          {DEFAULT_TTS_ENGINES.map((v, i) => (
            <option value={v} key={i}>
              {v}
            </option>
          ))}
        </Select>
      </ListItem>
      {props.ttsConfig.engine === DEFAULT_TTS_ENGINE && (
        <>
          <ListItem title={Locale.Settings.TTS.Model}>
            <Select
              value={props.ttsConfig.model}
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.model = TTSConfigValidator.model(
                      e.currentTarget.value,
                    )),
                );
              }}
            >
              {DEFAULT_TTS_MODELS.map((v, i) => (
                <option value={v} key={i}>
                  {v}
                </option>
              ))}
            </Select>
          </ListItem>
          <ListItem
            title={Locale.Settings.TTS.Voice.Title}
            subTitle={Locale.Settings.TTS.Voice.SubTitle}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <IconButton
                aria={Locale.Chat.Actions.Speech}
                icon={speechStatus ? <SpeakStopIcon /> : <SpeakIcon />}
                text={
                  speechLoading
                    ? "Loading..."
                    : speechStatus
                    ? Locale.Chat.Actions.Stop
                    : Locale.Chat.Actions.Speech
                }
                onClick={() => {
                  speechStatus
                    ? (ttsPlayer.stop(), setSpeechStatus(false))
                    : openaiSpeech(
                        "NextChat,Unleash your imagination, experience the future of AI conversation.",
                      );
                }}
              />

              <Select
                value={props.ttsConfig.voice}
                onChange={(e) => {
                  props.updateConfig(
                    (config) =>
                      (config.voice = TTSConfigValidator.voice(
                        e.currentTarget.value,
                      )),
                  );
                }}
              >
                {DEFAULT_TTS_VOICES.map((v, i) => (
                  <option value={v} key={i}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
          </ListItem>
          <ListItem
            title={Locale.Settings.TTS.Speed.Title}
            subTitle={Locale.Settings.TTS.Speed.SubTitle}
          >
            <InputRange
              aria={Locale.Settings.TTS.Speed.Title}
              value={props.ttsConfig.speed?.toFixed(1)}
              min="0.3"
              max="4.0"
              step="0.1"
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.speed = TTSConfigValidator.speed(
                      e.currentTarget.valueAsNumber,
                    )),
                );
              }}
            ></InputRange>
          </ListItem>
        </>
      )}
    </>
  );
}
