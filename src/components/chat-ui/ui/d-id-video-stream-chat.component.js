import React, { useState, useEffect, useRef } from "react";
import Background from "assets/images/bg.png";
import RecordMessage from "./record-message.component";
import "./video-chat.styled.scss";
import { getSpeechToTextCompletion } from "api";
import Lottie from "lottie-react";
import gradientHaloAnim from "assets/animations/gradiant-halo.json";
import "react-chat-elements/dist/main.css";
import { MessageBox } from "react-chat-elements";
import ChatInputBox from "./chat-input.component";
// import RecordMessage from "./record-message.component";
const apiConfig = {
  url: "https://api.d-id.com",
  key: "YWJoaW5hdmEuc2FueWFsMTZAZ21haWwuY29t:-ykxOgaaLcZSCw-W8Po6z",
};
const VideoChatComponent = () => {
  // refs
  const talkVideo = useRef();
  const idleVideo = useRef();
  const connectButton = useRef();
  const talkButton = useRef();
  const destroyButton = useRef();
  // states
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentResponse, setCurrentResponse] = useState("");
  // const [stream , setStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [streamId, setStreamId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionClientAnswer, setSessionClientAnswer] = useState(null);
  const [timeToIdleState, setTimeToIdleState] = useState(0);

  const timeToIdleStateRef = React.useRef(timeToIdleState);
  const setTimeToIdleStateRefState = (data) => {
    timeToIdleStateRef.current = data;
    setTimeToIdleState(data);
  };

  const isTimeToIdleStateAndCurrentTimeMatch = React.useCallback(
    (startTime, prevStartTime) => {
      const _currentTime = Math.ceil(talkVideo.current.currentTime);
      const _timeToIdleState = Math.floor(
        timeToIdleStateRef.current + prevStartTime
      );
      console.log(
        "isTimeToIdleStateAndCurrentTimeMatch::",
        _currentTime,
        _timeToIdleState
      );
      if (_currentTime >= _timeToIdleState) {
        return true;
      }
      return false;
    },
    [timeToIdleState, timeToIdleStateRef]
  );

  function onIceCandidate(event, _streamId, _sessionId) {
    if (event.candidate) {
      const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

      fetch(`${apiConfig.url}/talks/streams/${_streamId}/ice`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${apiConfig.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidate,
          sdpMid,
          sdpMLineIndex,
          session_id: _sessionId,
        }),
      });
    }
  }

  function onIceConnectionStateChange(e, _peerConnection) {
    if (
      _peerConnection.iceConnectionState === "failed" ||
      _peerConnection.iceConnectionState === "closed"
    ) {
      stopAllStreams();
      closePC();
    }
  }

  function onTrack(event) {
    const remoteStream = event.streams[0];

    setVideoElement(remoteStream);
  }

  function setVideoElement(stream) {
    if (!stream) return;
    console.log(
      "setVideoElement:::setting video element 222::",
      talkVideo.current
    );
    stream.addEventListener("inactive", (event) => {
      console.log("stream inactive::", event);
      talkVideo.current.style.opacity = 0;
    });
    stream.addEventListener("active", (event) => {
      console.log("stream active::", event);
      talkVideo.current.style.opacity = 1;
    });
    talkVideo.current.srcObject = stream;
    stream.oninactive = (event) => {
      console.log("stream inactive::", event);
      talkVideo.current.style.opacity = 0;
    };
    stream.onaddtrack = (event) => {
      console.log("stream onaddtrack::", event);
    };
    stream.onremovetrack = (event) => {
      console.log("stream onremovetrack::", event);
    };
    stream.onactive = (event) => {
      console.log("stream active::", event);
      talkVideo.current.style.opacity = 1;
    };
    if (talkVideo.current.paused) {
      talkVideo.current
        .play()
        .then((_) => {
          console.log("***********play video");
          talkVideo.current.style.opacity = 1;
        })
        .catch((e) => {});
    }
  }

  function stopAllStreams() {
    if (talkVideo.current.srcObject) {
      console.log("stopping video streams");
      talkVideo.current.srcObject.getTracks().forEach((track) => track.stop());
      talkVideo.current.srcObject = null;
    }
  }

  function closePC(pc = peerConnection) {
    if (!pc) return;
    console.log("stopping peer connection");
    pc.close();
    pc.removeEventListener("icecandidate", onIceCandidate, true);
    pc.removeEventListener(
      "iceconnectionstatechange",
      onIceConnectionStateChange,
      true
    );
    pc.removeEventListener("track", onTrack, true);
    console.log("stopped peer connection");
    if (pc === peerConnection) {
      setPeerConnection(null);
    }
  }

  const handleDestroyButtonClick = async () => {
    const options = {
      method: "DELETE",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Basic ${apiConfig.key}`,
      },
      body: JSON.stringify({ session_id: sessionId }),
    };

    try {
      const response = await fetch(
        `${apiConfig.url}/talks/streams/${streamId}`,
        options
      );
      const jsonResponse = await response.json();
      console.log(jsonResponse);
    } catch (error) {
      console.error("Error while deleting a talk stream:", error);
    }

    stopAllStreams();
    closePC();
  };

  useEffect(() => {
    let RTCPeerConnection = (
      window.RTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection
    ).bind(window);

    const handleConnectButtonClick = async () => {
      if (peerConnection && peerConnection.connectionState === "connected") {
        return;
      }

      stopAllStreams();
      closePC();

      const sessionResponse = await fetch(`${apiConfig.url}/talks/streams`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${apiConfig.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_url:
            "https://athena-yantra.s3.ap-south-1.amazonaws.com/FridayAvatar.png",
        }),
      });

      const {
        id: newStreamId,
        offer,
        ice_servers: iceServers,
        session_id: newSessionId,
      } = await sessionResponse.json();
      // streamId = newStreamId;
      // sessionId = newSessionId;
      setStreamId(newStreamId);
      setSessionId(newSessionId);
      let _sessionClientAnswer;
      try {
        _sessionClientAnswer = await createPeerConnection(
          offer,
          iceServers,
          newStreamId,
          newSessionId
        );
        setSessionClientAnswer(_sessionClientAnswer);
      } catch (e) {
        console.log("error during streaming setup", e);
        stopAllStreams();
        closePC();
        return;
      }

      await fetch(`${apiConfig.url}/talks/streams/${newStreamId}/sdp`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${apiConfig.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer: _sessionClientAnswer,
          session_id: newSessionId,
        }),
      });
    };

    async function createPeerConnection(
      offer,
      iceServers,
      newStreamId,
      newSessionId
    ) {
      let _peerConnection = peerConnection;
      if (!_peerConnection) {
        _peerConnection = new RTCPeerConnection({ iceServers });
        _peerConnection.addEventListener(
          "icecandidate",
          (event) => onIceCandidate(event, newStreamId, newSessionId),
          true
        );
        _peerConnection.addEventListener(
          "iceconnectionstatechange",
          (event) => onIceConnectionStateChange(event, _peerConnection),
          true
        );
        _peerConnection.addEventListener(
          "track",
          (event) => {
            console.log("onTrack::", event);
            onTrack(event);
          },
          true
        );
      }

      await _peerConnection.setRemoteDescription(offer);
      console.log("set remote sdp OK");

      const _sessionClientAnswer = await _peerConnection.createAnswer();
      console.log("create local sdp OK");

      await _peerConnection.setLocalDescription(_sessionClientAnswer);
      console.log("set local sdp OK");

      setPeerConnection(_peerConnection);

      return _sessionClientAnswer;
    }

    // Call handleConnectButtonClick when component mounts
    (async () => {
      // wait for 20 secs before starting
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve();
        }, 2000)
      );
      await handleConnectButtonClick();
    })();

    // connectButton.current?.addEventListener("click", handleConnectButtonClick);
    // destroyButton.current?.addEventListener("click", handleDestroyButtonClick);
    talkVideo.current.addEventListener("ended", function () {
      console.log("video ended");
    });

    let prevStartTime;
    talkVideo.current.addEventListener("timeupdate", function (event) {
      console.log(
        " video timeupdate::::: matched::",
        talkVideo.current.srcObject.getTracks()
      );
      if (!prevStartTime) {
        // first value
        prevStartTime = talkVideo.current.currentTime;
      }

      // prevStartTime = talkVideo.current.currentTime;
      talkVideo.current.style.opacity = 1;
      if (
        isTimeToIdleStateAndCurrentTimeMatch(
          talkVideo.current.currentTime,
          prevStartTime
        )
      ) {
        setTimeout(() => {
          talkVideo.current.style.opacity = 0;
          idleVideo.current.style.opacity = 1;
          idleVideo.current.play();
          prevStartTime = null;
        }, 800);
      }
    });

    return () => {
      // connectButton.current?.removeEventListener("click", handleConnectButtonClick);
      // destroyButton.current?.removeEventListener("click", handleDestroyButtonClick);
      // handleDestroyButtonClick();
    };
  }, []);

  function createBlobURL(data) {
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    return url;
  }

  const handleTalkButtonClick = async (completionText) => {
    console.log("handleTalkButtonClick:::", peerConnection);
    if (
      peerConnection?.signalingState === "stable" ||
      peerConnection?.iceConnectionState === "connected"
    ) {
      const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Basic ${apiConfig.key}`,
        },
        body: JSON.stringify({
          script: {
            type: "text",
            subtitles: "false",
            input: completionText,
            // provider: {
            //   type: 'elevenlabs',
            //   voice_id: '21m00Tcm4TlvDq8ikWAM'
            // },
            
            provider: {
              type: "microsoft",
              voice_id: "en-SG-LunaNeural",
            },
          },
          ssml: "false",
          config: {
            fluent: "true",
            pad_audio: "3.5",
            stitch: true,
          },
          session_id: sessionId,
        }),
      };
      // || "https://athena-yantra.s3.ap-south-1.amazonaws.com/ElevenLabs_2023-03-26T07_26_55.000Z_Bella_kZtqR5Rk3rFH0BlwQV7s.mp3",
      try {
        const response = await fetch(
          `${apiConfig.url}/talks/streams/${streamId}`,
          options
        );
        const jsonResponse = await response.json();
        console.log("current response duration:--", jsonResponse.duration);
        // setTimeToIdleState( talkVideo.current.currentTime + jsonResponse.duration);
        setTimeToIdleStateRefState(jsonResponse.duration);
      } catch (error) {
        console.error("Error while creating a talk stream:", error);
      }
    }
  };

  const handleStop = async (blobUrl) => {
    setIsLoading(true);

    // Append recorded message to messages

    // convert blob url to blob object
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        // Construct audio to send file
        const formData = new FormData();
        formData.append("file", blob, "myFile.wav");
        const assistantTextResult = await getSpeechToTextCompletion(formData);
        const myMessage = { sender: "me", text: assistantTextResult.user_text };
        const messagesArr = [...messages, myMessage];

        // Append to audio
        const rachelMessage = {
          sender: "rachel",
          text: assistantTextResult.completion_text,
        };
        messagesArr.push(rachelMessage);

        setMessages(messagesArr);
        handleTalkButtonClick(assistantTextResult.completion_text);
        setIsLoading(false);
      });
  };

  return (
<div className="chat-container">
      <div
        id="video-wrapper"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundPosition: "center top",
        }}
      >
        <Lottie
          animationData={gradientHaloAnim}
          loop={true}
          style={{
            width: "390px",
            height: "290px",
            position: "absolute",
            top: 0,
            left: "30%",
          }}
        />
        <div style={{ position: "absolute", top: "10%", left: "24%" }}>
          <video
            id="idle-video"
            playsInline
            autoPlay={true}
            loop
            ref={idleVideo}
            src={require("assets/video/FridayAvatarIdleMontage.mp4")}
          />
          <video
            id="talk-video"
            style={{ opacity: 0 }}
            ref={talkVideo}
            playsInline
            autoPlay
          />
        </div>
      </div>
      <div className="px-5" style={{ marginTop: "1rem" }}>
        {messages?.map((message, index) => {
          return (
            <div
              key={index + message.sender}
              className={
                "flex flex-col " +
                (message.sender == "rachel" && "flex items-end")
              }
            >
              <div className="mt-4 ">
                <p
                  className={
                    message.sender !== "rachel"
                      ? "text-right mr-2 italic text-green-500"
                      : "ml-2 italic text-blue-500"
                  }
                >
                  {message.sender}
                </p>
                {console.log("controller:-", message)}

                <MessageBox
                  position={message.sender === "me" ? "right" : "left"}
                  type={"text"}
                  style={{
                    width: "100%",
                    marginTop: "30px",
                    backdropFilter: "saturate(150%) blur(12px)",
                    filter: "saturate(200%) blur(30px)",
                  }}
                  text={
                    <div
                      className="flex flex-col"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      <p className="text-sm" style={{ whiteSpace: "pre-wrap" }}>
                        {message.text}
                      </p>
                    </div>
                  }
                />
              </div>
            </div>
          );
        })}
{/* 
        {messages.length == 0 && !isLoading && (
          <div className="text-center font-light italic mt-10">
            Send Rachel a message...
          </div>
        )} */}

        {isLoading && (
          <div className="text-center font-light italic mt-10 animate-pulse">
            Gimme a few seconds...
          </div>
        )}
      </div>
      <div
        style={{
          height: "107px",
          overflowY: "hidden",
        }}
        className="flex inset-x-0 bottom-0 w-full pt-6 mb-30 mx-2 justify-start items-center"
      >
        <ChatInputBox handleStop={handleStop} />
        <div className="flex justify-center items-center w-full">
          <RecordMessage handleStop={handleStop} />
        </div>
      </div>
    </div>
  );
};

export default VideoChatComponent;
