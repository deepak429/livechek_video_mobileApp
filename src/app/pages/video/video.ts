import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Device } from '@capacitor/device';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-video',
  templateUrl: './video.html',
  styleUrls: ['./video.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class VideoPage implements OnInit, OnDestroy {

  @ViewChild('webVideo') webVideoEl?: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoEl?: ElementRef<HTMLVideoElement>;


  // A single state to manage the UI
  uiState: 'initial' | 'searching' | 'recording' | 'completed' | 'failed' = 'initial';
  isWeb: boolean = false;

  // Timer
  instructionText: string = 'Click below to find an agent.';
  timer: number = 120;
  initialTimerValue: number = 120;
  displayTime: string = '02:00';
  interval: any;

  // Web recording
  webStream?: MediaStream;
  // Recording timer
  recordingTime: number = 0;
  displayRecordingTime: string = '00:00';
  recordingInterval: any;
  isAgentMuted = false;
  
  // WebRTC and Signaling
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private iceCandidateQueue: RTCIceCandidateInit[] = [];
  private roomId: string | null = null; // To store the current room ID
  private peerConnectionConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    ]
  };

  constructor(private platform: Platform) {}

  async ngOnInit() {
    this.isWeb = !this.platform.is('hybrid');
    // Log device information when the page loads
    const deviceInfo = await Device.getInfo();
    console.log('Device info:', deviceInfo);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    clearInterval(this.recordingInterval);
    if (this.platform.is('mobile')) {
      ScreenOrientation.unlock();
    }
    this.stopWebStream();
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  async findAgent() {
    this.uiState = 'searching';
    this.instructionText = 'Searching for an agent...';
    this.startTimer();
    await this.setupSignaling();
  }

  startTimer() {
    this.stopInitialTimer(); // Ensure no multiple timers
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        this.displayTime = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
      }
    }, 1000);
  }

  private stopInitialTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  setupSignaling() {
    // Connect to your signaling server. Use localhost for testing on the same machine.
    // this.socket = io('http://34.207.147.131:8080/');
    this.socket = io('https://peer.livechek.com/');


    this.socket.on('connect', async () => {
      console.log('Customer app connected to signaling server.');
      // Generate a room ID and immediately send an inspection request.
      this.roomId = `session_${Math.random().toString(36).substring(2, 9)}`;
      console.log(`Generated new room ID: ${this.roomId}`);
      const customerInfo = await Device.getInfo();
      this.socket?.emit('new_inspection_request', { roomId: this.roomId, customerInfo });
      console.log(`Sent new inspection request for room: ${this.roomId}`);
      // Also join the room immediately after creating it.
      this.socket?.emit('join_room', { roomId: this.roomId });
    });
    this.socket.on('start_customer_stream', () => {
      console.log('Agent accepted the request, starting stream.');
      this.startRecording();
    });

    this.socket.on('signal', async (data) => {
      if (this.peerConnection && data.answer) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        // Process any queued ICE candidates now that the answer is set
        while (this.iceCandidateQueue.length > 0) {
          const candidate = this.iceCandidateQueue.shift();
          if (candidate) {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error('Error adding queued ICE candidate:', e));
          }
        }
      } else if (this.peerConnection && data.candidate) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          if (this.peerConnection.remoteDescription === null) {
            this.iceCandidateQueue.push(data.candidate);
          } else {
            console.error('Error adding received ICE candidate', e);
          }
        }
      }
    });

    this.socket.on('mute_status', (data: { muted: boolean }) => {
      console.log('Agent mute status updated:', data.muted);
      this.isAgentMuted = data.muted;
    });

    this.socket.on('call_status', (data: { status: 'complete' | 'failed' | 'exited' }) => {
      console.log(`Call status received: ${data.status}`);
      if (data.status === 'complete') {
        this.uiState = 'completed';
        this.instructionText = 'Call completed successfully.';
        this.stopWebStream();
      } else if (data.status === 'exited') {
        this.stopWebStream();
      } else { // Covers 'failed'
        this.uiState = 'failed';
        this.instructionText = 'Call failed or was terminated.';
      }
    });

    this.socket.on('peer_disconnected', () => {
      console.log('Agent has disconnected. Resetting state.');
      this.instructionText = 'Agent disconnected. Ready to start a new stream.';
      // Stop all streams and reset the UI to the initial state
      this.stopWebRecording();
    });

    this.socket.on('agent_reconnected', () => {
      console.log('Agent has reconnected. Reloading the page to re-establish connection.');
      window.location.reload();
    });
  }

async startRecording() {
  // Lock the screen to landscape mode when recording starts
  if (this.platform.is('mobile')) {
    try {
      await ScreenOrientation.lock({ orientation: 'landscape-primary' });
    } catch (e) { console.error('Screen lock failed:', e); }
  }

  this.stopInitialTimer();
  this.uiState = 'recording';

  // Use getUserMedia for both web and mobile for a consistent live stream
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.webStream = stream;

    // --- Start WebRTC Streaming Logic ---
    this.peerConnection = new RTCPeerConnection(this.peerConnectionConfig);

    // Set up the event handler for when network candidates are found
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('signal', { roomId: this.roomId, candidate: event.candidate });
      }
    };

    // Add the local camera stream tracks to the connection to be sent
    stream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, stream);
    });

    // --- RECEIVE AGENT'S AUDIO AND VIDEO ---
    // When the remote tracks come from the agent, add them to our stream.
    this.peerConnection.ontrack = (event) => {
      console.log('Remote track received from agent:', event.track, event.streams);
      // When the agent's stream arrives, display it in the remoteVideo element.
      if (this.remoteVideoEl?.nativeElement) {
        this.remoteVideoEl.nativeElement.srcObject = event.streams[0];
      }
    };

    // Create the offer and send it to the agent
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.socket?.emit('signal', { roomId: this.roomId, offer });

    // Notify the agent that the customer has started the inspection
    this.socket?.emit('inspection_started', { roomId: this.roomId });

    // Display the local camera stream in the #webVideo element (picture-in-picture)
    if (this.webVideoEl?.nativeElement) {
      this.webVideoEl.nativeElement.srcObject = stream;
    }

    // Start the recording timer
    this.recordingTime = 0;
    this.recordingInterval = setInterval(() => {
      this.recordingTime++;
      const minutes = Math.floor(this.recordingTime / 60);
      const seconds = this.recordingTime % 60;
      this.displayRecordingTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
  } catch (err) {
    console.error('Camera error', err);
    this.uiState = 'initial'; // Go back to initial state on error
  }
}

  stopWebRecording() {
    this.socket?.emit('call_status', { roomId: this.roomId, status: 'exited' });
    this.stopWebStream(); // This will close connections and stop tracks
  }

  stopWebStream() {
    // Lock the screen back to portrait when streaming stops
    if (this.platform.is('mobile')) {
      ScreenOrientation.lock({ orientation: 'portrait-primary' }).catch(e => console.error('Could not lock to portrait', e));
    }
    if (this.webStream) {
      this.webStream.getTracks().forEach(track => track.stop());
      this.webStream = undefined;
    }
    if (this.peerConnection) { // peerConnection is RTCPeerConnection | null
      this.peerConnection.close();
      this.peerConnection = null;
    }
    clearInterval(this.recordingInterval);
    this.recordingInterval = undefined;
    this.displayRecordingTime = '00:00';
    this.uiState = 'initial'; // Always return to initial state
  }

  nextStep() {
    console.log('Next clicked!');
    // Implement your next step logic here
  }

  /**
   * Calculates the stroke offset for the circular timer animation.
   * @returns The calculated stroke offset.
   */
  calculateStrokeOffset(): number {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    return circumference - (this.timer / this.initialTimerValue) * circumference;
  }

  reconnect() {
    // Simply reload the page for the cleanest state reset
    window.location.reload();
  }
}
