# 💧 The Fun Fan Reporter: Liquid Metal Edition
> **"Where connectivity ends, community begins."**

[![Hackathon](https://img.shields.io/badge/Submission-The_AI_Champion_Ship-orange)](https://devpost.com/)
[![Status](https://img.shields.io/badge/Status-Prototype-green)]()

## 🏆 Hackathon Submission Tracks
We are submitting **TheFunFanReporter** for the following specific prize categories:

* **🏆 Best Overall Idea:**
    * *Why:* A "Liquid" architecture that adapts to its environment (Cloud-to-Mesh) solves a massive infrastructure problem for events like the Super Bowl and World Cup.
* **🎯 Best Small Startup Agents:**
    * *Why:* We are building a decentralized "offline economy" where autonomous agents verify safety reports and facilitate micro-transactions without a central server.
* **🎙️ Best Voice Agent (ElevenLabs):**
    * *Why:* In a crowd of 75,000 screaming fans, text fails. We designed the system to use **ElevenLabs** to generate high-fidelity, authoritative voice broadcasts that cut through the noise and save lives. *(Note: Currently running in simulation mode due to API access limits).*
* **🌍 Best AI Solution for Public Good:**
    * *Why:* This isn't just an app; it's a safety net. It prevents panic during transit failures (like the Caltrain delays) and ensures critical safety information reaches people even when the grid goes down.
* **💡 Best AI App by a Solopreneur:**
    * *Why:* Built by a solo Latina non-technical founder using AI to bridge the gap between complex infrastructure engineering and real-world user needs.

---

## 📣 Founder's Inspiration
**As a Latina founder from Peru living in Silicon Valley, I believe AI must solve real-world problems.**
I recently experienced a 5-hour delay on Caltrain that paralyzed the Bay Area. Now, imagine that chaos amplified by **75,000 fans** at the upcoming Super Bowl at Levi's Stadium. When the network crashes, safety goes blind.

**TheFunFanReporter** is a "Liquid Application" designed to fix this. It utilizes **Vultr Cloud GPUs** for high-level analytics when online, and "melts" into a local **Liquid Metal Raindrop** mesh network when the internet fails, ensuring the community stays connected via peer-to-peer reporting.

---

## ⚖️ Hackathon Transparency & Implementation Status
**A Note to the Judges:**
To demonstrate the full vision of a "Hybrid Cloud-Edge" system within the hackathon timeframe, we believe in radical transparency. Here is exactly what is live code and what is architecturally simulated due to time or access constraints:

| Feature | Status | Engineering Context |
| :--- | :--- | :--- |
| **Google Gemini Live API** | **🟢 REAL / LIVE** | The "Walkie-Talkie" feature uses the **live WebSocket API** with raw PCM audio processing. You can actually talk to the AI in real-time. |
| **ElevenLabs Voice** | **🟡 SIMULATED** | The integration code (`services/elevenLabsService.ts`) is written. However, due to an **API Key access issue** preventing us from generating a key during the hackathon, we are simulating the audio output using standard Text-to-Speech for the demo. |
| **Liquid Metal Infrastructure** | **🟡 ARCHITECTED (Simulated)** | We wrote the production-ready **Infrastructure-as-Code** (`raindrop.yaml`) to prove the deployment logic. However, for the demo, the app runs in a "Simulation Mode" (`raindropConnection.ts`) to mimic latency and mesh behavior without requiring a physical server cluster at the venue. |
| **Redis Edge Sync** | **🟡 SIMULATED** | The UI demonstrates the UX of data syncing between nodes. The actual conflict-resolution logic is mocked to show the intended user experience. |

---

## ⚡ The Solution: "Liquid" Architecture
We designed a system that operates in two distinct states:

1.  **Solid State (Online):**
    * **Brain:** Vultr Cloud Compute (GPU Inference).
    * **Function:** Processes heavy global data, transportation APIs, and social sentiment.
2.  **Liquid State (Offline):**
    * **Nervous System:** Liquid Metal Edge Nodes.
    * **Function:** Switches to the local configuration defined in our `raindrop.yaml`. It syncs critical safety data via peer-to-peer hops.

---

## 🛠️ Tech Stack
* **Edge Orchestration:** Liquid Metal Raindrop (See `raindrop.yaml`)
* **Frontend:** React + TypeScript (Cyberpunk/Matrix Aesthetic)
* **Voice Input:** Gemini Live API (Bi-directional WebSocket)
* **Voice Broadcast:** ElevenLabs (Service Integrated, Simulated Output)

---

## 📺 Demo Video
https://www.youtube.com/watch?v=hRKzuiEEpj4

---

## 🚀 Deployment Instructions
To run the application locally (in Simulation Mode):

```bash
# 1. Install Dependencies
npm install

# 2. Start Application
# This will launch the UI and the 'Raindrop Simulator' service
npm start
