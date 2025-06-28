# Catch Up AI - 재미로 하는 Vibe Coding

OpenAI Realtime Console을 기반으로 한 실시간 음성 AI 통역 프로젝트입니다.

## 🎯 프로젝트 개요

이 프로젝트는 OpenAI의 Realtime API를 활용하여 실시간 음성 통역 기능을 제공하는 웹 애플리케이션입니다. 원본 기능을 보존하면서 새로운 실험적 기능을 개발할 수 있는 환경을 제공합니다.

## 🚀 주요 기능

### 🏠 Landing Page

- **Catch Up AI 재미로 하는 Vibe Coding** 메인 화면
- 두 가지 앱 버전 선택 가능
- 현대적이고 아름다운 UI 디자인

### 🎯 Original Translator (원본 앱)

- 기존 OpenAI Realtime Console의 모든 기능 보존
- 실시간 음성 인식 및 번역
- 다국어 지원 (한국어, 일본어, 중국어, 스페인어, 프랑스어, 독일어)
- Push-to-Talk 및 VAD (Voice Activity Detection) 모드

### 🧪 Playground (실험용 앱)

- 새로운 기능 개발 및 실험용 환경
- 원본 앱과 동일한 기능으로 시작
- 자유로운 수정 및 기능 추가 가능

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **Styling**: SCSS
- **Audio Processing**: WavRecorder, WavStreamPlayer
- **AI Integration**: OpenAI Realtime API
- **Build Tool**: Create React App
- **Package Manager**: NPM

## 📦 설치 및 실행

### 필수 요구사항

- Node.js (v16 이상)
- NPM
- OpenAI API Key

### 설치 방법

1. **저장소 클론**

   ```bash
   git clone https://github.com/Bullskc/CUA_VibeCoding.git
   cd CUA_VibeCoding
   ```

2. **의존성 설치**

   ```bash
   npm install
   ```

3. **환경 변수 설정 (선택사항)**

   ```bash
   # .env 파일 생성
   OPENAI_API_KEY=your_api_key_here
   REACT_APP_LOCAL_RELAY_SERVER_URL=http://localhost:8081
   ```

4. **애플리케이션 실행**

   ```bash
   npm start
   ```

5. **브라우저에서 접속**
   ```
   http://localhost:3000
   ```

## 🎮 사용 방법

1. **API 키 입력**: 앱 시작 시 OpenAI API 키 입력
2. **앱 선택**: Landing Page에서 원본 앱 또는 실험용 앱 선택
3. **음성 통역**: Connect 버튼을 눌러 마이크 연결 후 음성 통역 시작
4. **언어 변경**: 드롭다운 메뉴에서 번역할 언어 선택
5. **홈으로 이동**: 각 앱에서 "🏠 홈으로" 버튼으로 메인 화면 복귀

## 🔧 주요 컴포넌트

### 라우팅 시스템

- `App.tsx`: 메인 애플리케이션 컴포넌트 (상태 기반 라우팅)
- `LandingPage.tsx`: 랜딩 페이지 컴포넌트
- `OriginalApp.tsx`: 원본 앱 컴포넌트
- `ExperimentApp.tsx`: 실험용 앱 컴포넌트

### 스타일링

- `LandingPage.scss`: 랜딩 페이지 스타일
- `AdditionalStyles.scss`: 추가 스타일 및 z-index 문제 해결
- `App.scss`: 메인 애플리케이션 스타일

## 🎨 디자인 특징

- **반응형 디자인**: 모바일 및 데스크톱 환경 지원
- **모던 UI**: 그라데이션, 그림자, 애니메이션 효과
- **직관적 UX**: 이모지와 아이콘을 활용한 사용자 친화적 인터페이스
- **드롭다운 최적화**: z-index 문제 해결로 완벽한 사용성

## 🚨 주의사항

- OpenAI API 사용에는 비용이 발생할 수 있습니다
- API 키는 안전하게 보관하고 공개하지 마세요
- 마이크 접근 권한이 필요합니다

## 🔄 릴레이 서버 (선택사항)

```bash
# 릴레이 서버 실행
npm run relay
```

릴레이 서버를 사용하면 API 키를 숨기고 서버에서 커스텀 로직을 실행할 수 있습니다.

---

**Powered by OpenAI Realtime API** 🚀

The OpenAI Realtime Console is intended as an inspector and interactive API reference
for the OpenAI Realtime API. It comes packaged with two utility libraries,
[openai/openai-realtime-api-beta](https://github.com/openai/openai-realtime-api-beta)
that acts as a **Reference Client** (for browser and Node.js) and
[`/src/lib/wavtools`](./src/lib/wavtools) which allows for simple audio
management in the browser.

<img src="/readme/realtime-console-demo.png" width="800" />

# Starting the console

This is a React project created using `create-react-app` that is bundled via Webpack.
Install it by extracting the contents of this package and using;

```shell
$ npm i
```

Start your server with:

```shell
$ npm start
```

It should be available via `localhost:3000`.

# Table of contents

1. [Using the console](#using-the-console)
   1. [Using a relay server](#using-a-relay-server)
1. [Realtime API reference client](#realtime-api-reference-client)
   1. [Sending streaming audio](#sending-streaming-audio)
   1. [Adding and using tools](#adding-and-using-tools)
   1. [Interrupting the model](#interrupting-the-model)
   1. [Reference client events](#reference-client-events)
1. [Wavtools](#wavtools)
   1. [WavRecorder quickstart](#wavrecorder-quickstart)
   1. [WavStreamPlayer quickstart](#wavstreamplayer-quickstart)
1. [Acknowledgements and contact](#acknowledgements-and-contact)

# Using the console

The console requires an OpenAI API key (**user key** or **project key**) that has access to the
Realtime API. You'll be prompted on startup to enter it. It will be saved via `localStorage` and can be
changed at any time from the UI.

To start a session you'll need to **connect**. This will require microphone access.
You can then choose between **manual** (Push-to-talk) and **vad** (Voice Activity Detection)
conversation modes, and switch between them at any time.

There are two functions enabled;

- `get_weather`: Ask for the weather anywhere and the model will do its best to pinpoint the
  location, show it on a map, and get the weather for that location. Note that it doesn't
  have location access, and coordinates are "guessed" from the model's training data so
  accuracy might not be perfect.
- `set_memory`: You can ask the model to remember information for you, and it will store it in
  a JSON blob on the left.

You can freely interrupt the model at any time in push-to-talk or VAD mode.

## Using a relay server

If you would like to build a more robust implementation and play around with the reference
client using your own server, we have included a Node.js [Relay Server](/relay-server/index.js).

```shell
$ npm run relay
```

It will start automatically on `localhost:8081`.

**You will need to create a `.env` file** with the following configuration:

```conf
OPENAI_API_KEY=YOUR_API_KEY
REACT_APP_LOCAL_RELAY_SERVER_URL=http://localhost:8081
```

You will need to restart both your React app and relay server for the `.env.` changes
to take effect. The local server URL is loaded via [`ConsolePage.tsx`](/src/pages/ConsolePage.tsx).
To stop using the relay server at any time, simply delete the environment
variable or set it to empty string.

```javascript
/**
 * Running a local relay server will allow you to hide your API key
 * and run custom logic on the server
 *
 * Set the local relay server address to:
 * REACT_APP_LOCAL_RELAY_SERVER_URL=http://localhost:8081
 *
 * This will also require you to set OPENAI_API_KEY= in a `.env` file
 * You can run it with `npm run relay`, in parallel with `npm start`
 */
const LOCAL_RELAY_SERVER_URL: string =
  process.env.REACT_APP_LOCAL_RELAY_SERVER_URL || '';
```

This server is **only a simple message relay**, but it can be extended to:

- Hide API credentials if you would like to ship an app to play with online
- Handle certain calls you would like to keep secret (e.g. `instructions`) on
  the server directly
- Restrict what types of events the client can receive and send

You will have to implement these features yourself.

# Realtime API reference client

The latest reference client and documentation are available on GitHub at
[openai/openai-realtime-api-beta](https://github.com/openai/openai-realtime-api-beta).

You can use this client yourself in any React (front-end) or Node.js project.
For full documentation, refer to the GitHub repository, but you can use the
guide here as a primer to get started.

```javascript
import { RealtimeClient } from '/src/lib/realtime-api-beta/index.js';

const client = new RealtimeClient({ apiKey: process.env.OPENAI_API_KEY });

// Can set parameters ahead of connecting
client.updateSession({ instructions: 'You are a great, upbeat friend.' });
client.updateSession({ voice: 'alloy' });
client.updateSession({ turn_detection: 'server_vad' });
client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

// Set up event handling
client.on('conversation.updated', ({ item, delta }) => {
  const items = client.conversation.getItems(); // can use this to render all items
  /* includes all changes to conversations, delta may be populated */
});

// Connect to Realtime API
await client.connect();

// Send an item and triggers a generation
client.sendUserMessageContent([{ type: 'text', text: `How are you?` }]);
```

## Sending streaming audio

To send streaming audio, use the `.appendInputAudio()` method. If you're in `turn_detection: 'disabled'` mode,
then you need to use `.generate()` to tell the model to respond.

```javascript
// Send user audio, must be Int16Array or ArrayBuffer
// Default audio format is pcm16 with sample rate of 24,000 Hz
// This populates 1s of noise in 0.1s chunks
for (let i = 0; i < 10; i++) {
  const data = new Int16Array(2400);
  for (let n = 0; n < 2400; n++) {
    const value = Math.floor((Math.random() * 2 - 1) * 0x8000);
    data[n] = value;
  }
  client.appendInputAudio(data);
}
// Pending audio is committed and model is asked to generate
client.createResponse();
```

## Adding and using tools

Working with tools is easy. Just call `.addTool()` and set a callback as the second parameter.
The callback will be executed with the parameters for the tool, and the result will be automatically
sent back to the model.

```javascript
// We can add tools as well, with callbacks specified
client.addTool(
  {
    name: 'get_weather',
    description:
      'Retrieves the weather for a given lat, lng coordinate pair. Specify a label for the location.',
    parameters: {
      type: 'object',
      properties: {
        lat: {
          type: 'number',
          description: 'Latitude',
        },
        lng: {
          type: 'number',
          description: 'Longitude',
        },
        location: {
          type: 'string',
          description: 'Name of the location',
        },
      },
      required: ['lat', 'lng', 'location'],
    },
  },
  async ({ lat, lng, location }) => {
    const result = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`
    );
    const json = await result.json();
    return json;
  }
);
```

## Interrupting the model

You may want to manually interrupt the model, especially in `turn_detection: 'disabled'` mode.
To do this, we can use:

```javascript
// id is the id of the item currently being generated
// sampleCount is the number of audio samples that have been heard by the listener
client.cancelResponse(id, sampleCount);
```

This method will cause the model to immediately cease generation, but also truncate the
item being played by removing all audio after `sampleCount` and clearing the text
response. By using this method you can interrupt the model and prevent it from "remembering"
anything it has generated that is ahead of where the user's state is.

## Reference client events

There are five main client events for application control flow in `RealtimeClient`.
Note that this is only an overview of using the client, the full Realtime API
event specification is considerably larger, if you need more control check out the GitHub repository:
[openai/openai-realtime-api-beta](https://github.com/openai/openai-realtime-api-beta).

```javascript
// errors like connection failures
client.on('error', (event) => {
  // do thing
});

// in VAD mode, the user starts speaking
// we can use this to stop audio playback of a previous response if necessary
client.on('conversation.interrupted', () => {
  /* do something */
});

// includes all changes to conversations
// delta may be populated
client.on('conversation.updated', ({ item, delta }) => {
  // get all items, e.g. if you need to update a chat window
  const items = client.conversation.getItems();
  switch (item.type) {
    case 'message':
      // system, user, or assistant message (item.role)
      break;
    case 'function_call':
      // always a function call from the model
      break;
    case 'function_call_output':
      // always a response from the user / application
      break;
  }
  if (delta) {
    // Only one of the following will be populated for any given event
    // delta.audio = Int16Array, audio added
    // delta.transcript = string, transcript added
    // delta.arguments = string, function arguments added
  }
});

// only triggered after item added to conversation
client.on('conversation.item.appended', ({ item }) => {
  /* item status can be 'in_progress' or 'completed' */
});

// only triggered after item completed in conversation
// will always be triggered after conversation.item.appended
client.on('conversation.item.completed', ({ item }) => {
  /* item status will always be 'completed' */
});
```

# Wavtools

Wavtools contains easy management of PCM16 audio streams in the browser, both
recording and playing.

## WavRecorder Quickstart

```javascript
import { WavRecorder } from '/src/lib/wavtools/index.js';

const wavRecorder = new WavRecorder({ sampleRate: 24000 });
wavRecorder.getStatus(); // "ended"

// request permissions, connect microphone
await wavRecorder.begin();
wavRecorder.getStatus(); // "paused"

// Start recording
// This callback will be triggered in chunks of 8192 samples by default
// { mono, raw } are Int16Array (PCM16) mono & full channel data
await wavRecorder.record((data) => {
  const { mono, raw } = data;
});
wavRecorder.getStatus(); // "recording"

// Stop recording
await wavRecorder.pause();
wavRecorder.getStatus(); // "paused"

// outputs "audio/wav" audio file
const audio = await wavRecorder.save();

// clears current audio buffer and starts recording
await wavRecorder.clear();
await wavRecorder.record();

// get data for visualization
const frequencyData = wavRecorder.getFrequencies();

// Stop recording, disconnects microphone, output file
await wavRecorder.pause();
const finalAudio = await wavRecorder.end();

// Listen for device change; e.g. if somebody disconnects a microphone
// deviceList is array of MediaDeviceInfo[] + `default` property
wavRecorder.listenForDeviceChange((deviceList) => {});
```

## WavStreamPlayer Quickstart

```javascript
import { WavStreamPlayer } from '/src/lib/wavtools/index.js';

const wavStreamPlayer = new WavStreamPlayer({ sampleRate: 24000 });

// Connect to audio output
await wavStreamPlayer.connect();

// Create 1s of empty PCM16 audio
const audio = new Int16Array(24000);
// Queue 3s of audio, will start playing immediately
wavStreamPlayer.add16BitPCM(audio, 'my-track');
wavStreamPlayer.add16BitPCM(audio, 'my-track');
wavStreamPlayer.add16BitPCM(audio, 'my-track');

// get data for visualization
const frequencyData = wavStreamPlayer.getFrequencies();

// Interrupt the audio (halt playback) at any time
// To restart, need to call .add16BitPCM() again
const trackOffset = await wavStreamPlayer.interrupt();
trackOffset.trackId; // "my-track"
trackOffset.offset; // sample number
trackOffset.currentTime; // time in track
```

# Acknowledgements and contact

Thanks for checking out the Realtime Console. We hope you have fun with the Realtime API.
Special thanks to the whole Realtime API team for making this possible. Please feel free
to reach out, ask questions, or give feedback by creating an issue on the repository.
You can also reach out and let us know what you think directly!

- OpenAI Developers / [@OpenAIDevs](https://x.com/OpenAIDevs)
- Jordan Sitkin / API / [@dustmason](https://x.com/dustmason)
- Mark Hudnall / API / [@landakram](https://x.com/landakram)
- Peter Bakkum / API / [@pbbakkum](https://x.com/pbbakkum)
- Atty Eleti / API / [@athyuttamre](https://x.com/athyuttamre)
- Jason Clark / API / [@onebitToo](https://x.com/onebitToo)
- Karolis Kosas / Design / [@karoliskosas](https://x.com/karoliskosas)
- Keith Horwood / API + DX / [@keithwhor](https://x.com/keithwhor)
- Romain Huet / DX / [@romainhuet](https://x.com/romainhuet)
- Katia Gil Guzman / DX / [@kagigz](https://x.com/kagigz)
- Ilan Bigio / DX / [@ilanbigio](https://x.com/ilanbigio)
- Kevin Whinnery / DX / [@kevinwhinnery](https://x.com/kevinwhinnery)
