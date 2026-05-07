/**
 * WebRTC Service for Audio/Video Calling
 * Manages peer connections, media streams, and ICE candidates
 */

export interface WebRTCConfig {
  iceServers?: RTCIceServer[];
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302'] },
  { urls: ['stun:stun1.l.google.com:19302'] },
  { urls: ['stun:stun2.l.google.com:19302'] },
];

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;

  /**
   * Initialize WebRTC Manager
   */
  constructor(private config: WebRTCConfig = {}) {}

  /**
   * Get user media (audio + video)
   */
  async getUserMedia(
    constraints: MediaStreamConstraints = {
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    }
  ): Promise<MediaStream> {
    try {
      console.log('📹 Requesting user media...');
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Local stream obtained');
      return this.localStream;
    } catch (error) {
      console.error('❌ Error getting user media:', error);
      throw error;
    }
  }

  /**
   * Get display screen for screen sharing
   */
  async getScreenStream(): Promise<MediaStream> {
    try {
      console.log('🖥️ Requesting screen share...');
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: false,
      });
      console.log('✅ Screen stream obtained');
      return screenStream;
    } catch (error) {
      console.error('❌ Error getting screen:', error);
      throw error;
    }
  }

  /**
   * Create peer connection
   */
  createPeerConnection(
    onIceCandidate: (candidate: RTCIceCandidate) => void,
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void,
    onIceConnectionStateChange: (state: RTCIceConnectionState) => void
  ): RTCPeerConnection {
    try {
      console.log('🔌 Creating peer connection...');

      const config = {
        iceServers: this.config.iceServers || ICE_SERVERS,
      };

      this.peerConnection = new RTCPeerConnection(config);

      // Add local stream tracks
      if (this.localStream) {
        console.log('📤 Adding local stream tracks...');
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      // Handle ICE candidates
      this.peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          console.log('🎯 ICE candidate found');
          onIceCandidate(event.candidate);
        }
      });

      // Handle remote stream
      this.peerConnection.addEventListener('track', (event) => {
        console.log('📥 Remote track received');
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
          onRemoteStream(this.remoteStream);
        }
        this.remoteStream.addTrack(event.track);
      });

      // Handle connection state change
      this.peerConnection.addEventListener('connectionstatechange', () => {
        console.log('🔄 Connection state:', this.peerConnection?.connectionState);
        onConnectionStateChange(this.peerConnection!.connectionState);
      });

      // Handle ICE connection state change
      this.peerConnection.addEventListener('iceconnectionstatechange', () => {
        console.log('🔄 ICE connection state:', this.peerConnection?.iceConnectionState);
        onIceConnectionStateChange(this.peerConnection!.iceConnectionState);
      });

      console.log('✅ Peer connection created');
      return this.peerConnection;
    } catch (error) {
      console.error('❌ Error creating peer connection:', error);
      throw error;
    }
  }

  /**
   * Create offer
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      console.log('📝 Creating offer...');
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.peerConnection.setLocalDescription(offer);
      console.log('✅ Offer created');
      return offer;
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Create answer
   */
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      console.log('📝 Creating answer...');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      console.log('✅ Answer created');
      return answer;
    } catch (error) {
      console.error('❌ Error creating answer:', error);
      throw error;
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      await this.peerConnection.addIceCandidate(candidate);
      console.log('✅ ICE candidate added');
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }

  /**
   * Set remote description
   */
  async setRemoteDescription(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Remote description set');
    } catch (error) {
      console.error('❌ Error setting remote description:', error);
      throw error;
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Close peer connection
   */
  closePeerConnection(): void {
    try {
      console.log('🔌 Closing peer connection...');

      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      console.log('✅ Peer connection closed');
    } catch (error) {
      console.error('❌ Error closing peer connection:', error);
    }
  }

  /**
   * Stop local stream
   */
  stopLocalStream(): void {
    try {
      if (this.localStream) {
        console.log('🛑 Stopping local stream...');
        this.localStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.localStream = null;
        console.log('✅ Local stream stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping local stream:', error);
    }
  }

  /**
   * Stop remote stream
   */
  stopRemoteStream(): void {
    try {
      if (this.remoteStream) {
        console.log('🛑 Stopping remote stream...');
        this.remoteStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.remoteStream = null;
        console.log('✅ Remote stream stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping remote stream:', error);
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
      console.log('🎙️ Audio:', enabled ? 'ON' : 'OFF');
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
      console.log('📹 Video:', enabled ? 'ON' : 'OFF');
    }
  }

  /**
   * Get peer connection state
   */
  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  /**
   * Get ICE connection state
   */
  getIceConnectionState(): RTCIceConnectionState | null {
    return this.peerConnection?.iceConnectionState || null;
  }
}

export default WebRTCManager;
