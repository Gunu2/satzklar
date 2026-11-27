/**
 * Zero-dependency WebRTC Group Audio Engine for SatzKlar Language Parties.
 *
 * - Real browser microphone capture (`getUserMedia` with echo cancellation + noise suppression)
 * - Real-time voice activity detection (`AnalyserNode`) for animated speaking rings
 * - Peer-to-peer WebRTC audio mesh across speakers & listeners via Supabase signaling
 */
import type { SupabaseConnection } from './chatBackend';
import { pollPartySignals, sendPartySignal, type PartySignal } from './partyBackend';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export class PartyAudioEngine {
  private conn: SupabaseConnection;
  private partyId: string;
  private myUserId: string;
  private localStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private localAnalyser: AnalyserNode | null = null;
  private speakingRaf: number | null = null;
  private signalTimer: number | null = null;
  private peers = new Map<string, RTCPeerConnection>();
  private remoteAudioEls = new Map<string, HTMLAudioElement>();
  private onSpeakingChange: (speaking: boolean) => void;
  private onMicError: (msg: string) => void;
  private lastSpeaking = false;

  constructor(opts: {
    conn: SupabaseConnection;
    partyId: string;
    myUserId: string;
    onSpeakingChange: (speaking: boolean) => void;
    onMicError: (msg: string) => void;
  }) {
    this.conn = opts.conn;
    this.partyId = opts.partyId;
    this.myUserId = opts.myUserId;
    this.onSpeakingChange = opts.onSpeakingChange;
    this.onMicError = opts.onMicError;
  }

  startSignaling(): void {
    if (this.signalTimer !== null) return;
    this.signalTimer = window.setInterval(() => {
      void this.consumeSignals();
    }, 1500);
  }

  async enableMicrophone(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.onMicError('Microphone API is unavailable in this browser.');
      return false;
    }

    try {
      if (!this.localStream) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      }

      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = true;
      }

      // Attach local audio track to existing peer connections
      for (const [peerId, pc] of this.peers.entries()) {
        const hasAudioSender = pc
          .getSenders()
          .some((s) => s.track && s.track.kind === 'audio');
        if (!hasAudioSender && this.localStream) {
          for (const track of this.localStream.getAudioTracks()) {
            pc.addTrack(track, this.localStream);
          }
          void this.renegotiateWith(peerId, pc);
        }
      }

      this.startVoiceMeter();
      return true;
    } catch {
      this.onMicError(
        'Microphone permission denied or no microphone detected. Allow mic access in your browser bar to speak on stage.'
      );
      return false;
    }
  }

  muteMicrophone(): void {
    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = false;
      }
    }
    this.stopVoiceMeter();
  }

  releaseMicrophone(): void {
    this.stopVoiceMeter();
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        track.stop();
      }
      this.localStream = null;
    }
  }

  syncPeers(activePeerIds: string[]): void {
    const targetSet = new Set(activePeerIds.filter((id) => id !== this.myUserId));

    // Close connections for peers who left
    for (const [peerId, pc] of this.peers.entries()) {
      if (!targetSet.has(peerId)) {
        pc.close();
        this.peers.delete(peerId);
        const audio = this.remoteAudioEls.get(peerId);
        if (audio) {
          audio.srcObject = null;
          audio.remove();
          this.remoteAudioEls.delete(peerId);
        }
      }
    }

    // Create connections for new peers (deterministic initiator prevents glare)
    for (const peerId of targetSet) {
      if (!this.peers.has(peerId) && this.myUserId < peerId) {
        const pc = this.createPeerConnection(peerId);
        void this.renegotiateWith(peerId, pc);
      }
    }
  }

  destroy(): void {
    if (this.signalTimer !== null) {
      window.clearInterval(this.signalTimer);
      this.signalTimer = null;
    }
    this.releaseMicrophone();
    for (const pc of this.peers.values()) {
      pc.close();
    }
    this.peers.clear();
    for (const audio of this.remoteAudioEls.values()) {
      audio.srcObject = null;
      audio.remove();
    }
    this.remoteAudioEls.clear();
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const existing = this.peers.get(peerId);
    if (existing) return existing;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.peers.set(peerId, pc);

    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        pc.addTrack(track, this.localStream);
      }
    } else {
      // Allow listeners to receive audio even without a microphone
      pc.addTransceiver('audio', { direction: 'recvonly' });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        void sendPartySignal(this.conn, {
          partyId: this.partyId,
          fromUserId: this.myUserId,
          toUserId: peerId,
          signalType: 'ice',
          payload: event.candidate.toJSON() as Record<string, unknown>,
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (!stream) return;
      let audio = this.remoteAudioEls.get(peerId);
      if (!audio) {
        audio = document.createElement('audio');
        audio.autoplay = true;
        audio.setAttribute('playsinline', 'true');
        audio.className = 'hidden';
        document.body.appendChild(audio);
        this.remoteAudioEls.set(peerId, audio);
      }
      audio.srcObject = stream;
      void audio.play().catch(() => {});
    };

    return pc;
  }

  private async renegotiateWith(peerId: string, pc: RTCPeerConnection): Promise<void> {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendPartySignal(this.conn, {
        partyId: this.partyId,
        fromUserId: this.myUserId,
        toUserId: peerId,
        signalType: 'offer',
        payload: { type: offer.type, sdp: offer.sdp },
      });
    } catch {
      // Ignore renegotiation race
    }
  }

  private async consumeSignals(): Promise<void> {
    const signals = await pollPartySignals(this.conn, this.partyId, this.myUserId);
    for (const sig of signals) {
      await this.handleSignal(sig);
    }
  }

  private async handleSignal(sig: PartySignal): Promise<void> {
    try {
      if (sig.signalType === 'offer') {
        const pc = this.createPeerConnection(sig.fromUserId);
        await pc.setRemoteDescription(
          new RTCSessionDescription(sig.payload as unknown as RTCSessionDescriptionInit)
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendPartySignal(this.conn, {
          partyId: this.partyId,
          fromUserId: this.myUserId,
          toUserId: sig.fromUserId,
          signalType: 'answer',
          payload: { type: answer.type, sdp: answer.sdp },
        });
      } else if (sig.signalType === 'answer') {
        const pc = this.peers.get(sig.fromUserId);
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(
            new RTCSessionDescription(sig.payload as unknown as RTCSessionDescriptionInit)
          );
        }
      } else if (sig.signalType === 'ice') {
        const pc = this.peers.get(sig.fromUserId);
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(
            new RTCIceCandidate(sig.payload as unknown as RTCIceCandidateInit)
          );
        }
      }
    } catch {
      // Ignore stale ICE/SDP candidates
    }
  }

  private startVoiceMeter(): void {
    if (!this.localStream || typeof AudioContext === 'undefined') return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
        const source = this.audioCtx.createMediaStreamSource(this.localStream);
        this.localAnalyser = this.audioCtx.createAnalyser();
        this.localAnalyser.fftSize = 256;
        source.connect(this.localAnalyser);
      }
      if (this.audioCtx.state === 'suspended') {
        void this.audioCtx.resume();
      }
      const data = new Uint8Array(this.localAnalyser!.frequencyBinCount);
      const loop = () => {
        if (!this.localAnalyser) return;
        this.localAnalyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        const speaking = avg > 16;
        if (speaking !== this.lastSpeaking) {
          this.lastSpeaking = speaking;
          this.onSpeakingChange(speaking);
        }
        this.speakingRaf = window.requestAnimationFrame(loop);
      };
      this.speakingRaf = window.requestAnimationFrame(loop);
    } catch {
      // Ignore AudioContext restriction errors
    }
  }

  private stopVoiceMeter(): void {
    if (this.speakingRaf !== null) {
      window.cancelAnimationFrame(this.speakingRaf);
      this.speakingRaf = null;
    }
    if (this.lastSpeaking) {
      this.lastSpeaking = false;
      this.onSpeakingChange(false);
    }
  }
}
