import React, { useState, useEffect, useRef } from "react";
import Background from "assets/images/bg.png";
import RecordMessage from "./RecordMessage";
import "./video-chat.css";
// import AWS from "aws-sdk";
// import axios from "axios";
import { getSpeechToTextCompletion } from "api";
import Lottie from "lottie-react";
import gradientHaloAnim from "assets/animations/gradiant-halo.json";
// import { input } from "assets/theme/components/form/input";
// RCE CSS
import "react-chat-elements/dist/main.css";
// MessageBox component
import { MessageBox } from "react-chat-elements";
// const s3 = new AWS.S3();
const apiConfig = {
  url: "https://api.d-id.com",
  key: "YWJoaW5hdmEuc2FueWFsMTZAZ21haWwuY29t:PaUIFoADIZRFyyx384cWG",
};
const VideoChatComponent = () => {
  // refs
  const talkVideo = useRef();
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
      const _timeToIdleState = Math.floor(timeToIdleStateRef.current + prevStartTime);
      console.log("isTimeToIdleStateAndCurrentTimeMatch::", _currentTime, _timeToIdleState);
      if (_currentTime >= _timeToIdleState) {
        return true;
      }
      return false;
    },
    [timeToIdleState, timeToIdleStateRef]
  );

  function onIceCandidate(event, _streamId, _sessionId) {
    console.log("onIceCandidate", event);
    if (event.candidate) {
      const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

      fetch(`${apiConfig.url}/talks/streams/${_streamId}/ice`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${apiConfig.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ candidate, sdpMid, sdpMLineIndex, session_id: _sessionId }),
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
    // function onactive() {
    //   console.log("on active event");
    // }
    // function oninactive() {
    //   console.log("on inactive event");
    // }
    // function onremovetrack() {
    //   console.log("on remove track event");
    // }
    // function onaddtrack () {
    //   console.log("on add track event");
    // }
    const remoteStream = event.streams[0];
    console.log("onTrack:::setting video element 000::", event);
    // remoteStream.onremovetrack = ({ track }) => {
    //   console.log(`${track.kind} track was removed.`);
    //   if (!stream.getTracks().length) {
    //     console.log(`stream ${stream.id} emptied (effectively removed).`);
    //   }
    // };
    // remoteStream.onaddtrack = ({ track }) => {
    //   console.log(`${track.kind} track was added.`);
    // };
    // remoteStream.oninactive = () => {
    //   console.log("stream inactive");
    // };
    // remoteStream.onactive = () => {
    //   console.log("stream active");
    // };
    //

    console.log("onTrack:::setting video element 001::", event.streams);
    // console.log("onTrack:::setting video element 111::",remoteStream );
    // remoteStream.oninactive = oninactive;
    // remoteStream.onactive = onactive;
    // remoteStream.onremovetrack = onremovetrack;
    // remoteStream.onaddtrack = onaddtrack;

    // setStream(remoteStream);
    setVideoElement(remoteStream);
  }

  function setVideoElement(stream) {
    if (!stream) return;
    console.log("setVideoElement:::setting video element 222::", talkVideo.current);
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
    pc.removeEventListener("iceconnectionstatechange", onIceConnectionStateChange, true);
    pc.removeEventListener("track", onTrack, true);
    console.log("stopped peer connection");
    if (pc === peerConnection) {
      peerConnection = null;
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
      const response = await fetch(`${apiConfig.url}/talks/streams/${streamId}`, options);
      const jsonResponse = await response.json();
      console.log(jsonResponse);
    } catch (error) {
      console.error("Error while deleting a talk stream:", error);
    }

    stopAllStreams();
    closePC();
  };

  useEffect(() => {
    const RTCPeerConnection = (
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
          source_url: "https://athena-yantra.s3.ap-south-1.amazonaws.com/FridayAvatar.png",
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
        body: JSON.stringify({ answer: _sessionClientAnswer, session_id: newSessionId }),
      });
    };

    async function createPeerConnection(offer, iceServers, newStreamId, newSessionId) {
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
            console.log("onTrack:::setting video element 111::", event.streams[0]);
            onTrack(event);
          },
          true
        );
        function onremovestream(event) {
          console.log("onremovestream:::setting video element 111::");
          // onTrack(event);
        }
        function onaddstream(event) {
          console.log("onaddstream:::setting video element 111::");
        }
        function onsignalingstatechange(event) {
          console.log("onsignalingstatechange:::setting video element 111::");
        }
        function onicecandidateerror(event) {
          console.log("onicecandidateerror:::setting video element 111::");
        }
        function oniceconnectionstatechange(event) {
          console.log("oniceconnectionstatechange:::setting video element 111::");
        }
        function onicegatheringstatechange(event) {
          console.log("onicegatheringstatechange:::setting video element 111::");
        }
        function onnegotiationneeded(event) {
          console.log("onnegotiationneeded:::setting video element 111::");
        }
        function ondatachannel(event) {
          console.log("ondatachannel:::setting video element 111::");
        }
        function onconnectionstatechange(event) {
          console.log("onconnectionstatechange:::setting video element 111::");
        }

        _peerConnection.onicecandidateerror = onicecandidateerror;
        _peerConnection.oniceconnectionstatechange = oniceconnectionstatechange;
        _peerConnection.onicegatheringstatechange = onicegatheringstatechange;
        _peerConnection.onnegotiationneeded = onnegotiationneeded;
        _peerConnection.ondatachannel = ondatachannel;
        _peerConnection.onconnectionstatechange = onconnectionstatechange;
        _peerConnection.onsignalingstatechange = onsignalingstatechange;
        _peerConnection.onremovestream = onremovestream;
        _peerConnection.onaddstream = onaddstream;
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
      await handleConnectButtonClick();
    })();

    connectButton.current?.addEventListener("click", handleConnectButtonClick);
    destroyButton.current?.addEventListener("click", handleDestroyButtonClick);
    talkVideo.current.addEventListener("ended", function () {
      console.log("video ended");
    });
    talkVideo.current.addEventListener("pause", function () {
      console.log("video paused");
    });
    talkVideo.current.addEventListener("waiting", function () {
      console.log("video waiting");
    });
    talkVideo.current.addEventListener("progress", function () {
      console.log("video progress");
      talkVideo.current.style.opacity = 0;
    });
    talkVideo.current.addEventListener("playing", function () {
      console.log("video playing");
      talkVideo.current.style.opacity = 0;
    });
    talkVideo.current.addEventListener("play", function () {
      console.log("video play");
      talkVideo.current.style.opacity = 0;
    });
    talkVideo.current.addEventListener("emptied", function () {
      console.log("video emptied");
    });
    talkVideo.current.addEventListener("stalled", function () {
      console.log("video stalled");
    });
    talkVideo.current.addEventListener("suspend", function () {
      console.log("video suspend");
    });
    talkVideo.current.addEventListener("error", function () {
      console.log("video error");
    });
    talkVideo.current.addEventListener("seeking", function () {
      console.log("video seeking");
    });
    let prevStartTime;
    talkVideo.current.addEventListener("timeupdate", function (event) {
      console.log(" video timeupdate::::: matched::", talkVideo.current.srcObject.getTracks());
      if (!prevStartTime) {
        // first value
        prevStartTime = talkVideo.current.currentTime;
      }

      // prevStartTime = talkVideo.current.currentTime;
      talkVideo.current.style.opacity = 1;
      if (isTimeToIdleStateAndCurrentTimeMatch(talkVideo.current.currentTime, prevStartTime)) {
        setTimeout(() => {
          talkVideo.current.style.opacity = 0;
          prevStartTime = null;
        }, 1500);
      }
    });

    return () => {
      connectButton.current?.removeEventListener("click", handleConnectButtonClick);
      destroyButton.current?.removeEventListener("click", handleDestroyButtonClick);
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
            input: completionText,
            text: completionText,
            provider: {
              type: "microsoft",
              voice_id: "en-US-JennyNeural",
              voice_config: {
                style: "Cheerful",
              },
            },
          },
          config: {
            stitch: true,
          },
          session_id: sessionId,
        }),
      };
      // || "https://athena-yantra.s3.ap-south-1.amazonaws.com/ElevenLabs_2023-03-26T07_26_55.000Z_Bella_kZtqR5Rk3rFH0BlwQV7s.mp3",
      try {
        const response = await fetch(`${apiConfig.url}/talks/streams/${streamId}`, options);
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
        const rachelMessage = { sender: "rachel", text: assistantTextResult.completion_text };
        messagesArr.push(rachelMessage);

        setMessages(messagesArr);
        // handleTalkButtonClick(assistantTextResult.completion_text);
        setIsLoading(false);
        // send form data to api endpoint
        // await axios
        //   .post("http://localhost:8000/post-audio", formData, {
        //     headers: {
        //       "Content-Type": "audio/mpeg",
        //     },
        //     responseType: "arraybuffer", // Set the response type to handle binary data
        //   })
        //   .then(async (res) => {
        //     console.log("the response data", res);
        //     const blob = res.data;
        //     const audio = new Audio();
        //     // const s3Url = await uploadToS3(blob);
        //     audio.src = createBlobURL(blob);

        //     // Append to audio
        //     const rachelMessage = { sender: "rachel", blobUrl: audio.src };
        //     messagesArr.push(rachelMessage);
        //     setMessages(messagesArr);

        //     // Update audioUrl state
        //     setAudioUrl(audio.src);
        //     // Invoke handleTalkButtonClick with the updated audioUrl
        //     handleTalkButtonClick(audio.src, s3Url);
        //     // Play audio
        //     setIsLoading(false);
        //     audio.play();
        //   })
        //   .catch((err) => {
        //     console.error(err);
        //     setIsLoading(false);
        //   });
      });
  };

  return (
    <div className=" overflow-y-hidden ">
      <div
        id="video-wrapper"
        style={{ backgroundImage: `url(${Background})`, backgroundPosition: "center top" }}
      >
        <Lottie
          animationData={gradientHaloAnim}
          loop={true}
          style={{ width: "280px", height: "270px", position: "absolute", top: 0, left: "25%" }}
        />
        <div style={{ position: "absolute", top: 0, left: "25%" }}>
          <video
            id="idle-video"
            playsInline
            autoPlay
            loop
            src={require("assets/video/FridayAvatarIdleMontage.mp4")}
          />
          <video
            id="talk-video"
            // onEnded={() => {
            //   console.log("ended");
            //   talkVideo.current.style.opacity = 0;
            //   talkVideo.current.pause();
            //   talkVideo.current.currentTime = 0;
            //   idleVideo.current.style.opacity = 1;
            //   idleVideo.current.play();
            // } }

            // onPause={() => {
            //   console.log("paused");
            //   talkVideo.current.style.opacity = 0;
            //   talkVideo.current.pause();
            //   talkVideo.current.currentTime = 0;
            //   idleVideo.current.style.opacity = 1;
            //   idleVideo.current.play();
            // } }
            style={{ opacity: 0 }}
            ref={talkVideo}
            playsInline
            autoPlay
          />
        </div>
      </div>
      <div className="px-5" style={{marginTop:"-6rem"}}>
        {messages?.map((message, index) => {
          return (
            <div
              key={index + message.sender}
              className={"flex flex-col " + (message.sender == "rachel" && "flex items-end")}
            >
              {/* Sender */}
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
                {/* Message */}
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
                    <div className="flex flex-col" style={{whiteSpace:"pre-wrap"}}>
                      <p className="text-sm" style={{whiteSpace:"pre-wrap"}}>{message.text}</p>
                      {/* <p className="text-xs text-gray-500 mt-1">
                        {moment(message.createdAt).format("h:mm a")}
                      </p> */}
                    </div>
                  }
                />
              </div>
            </div>
          );
        })}

        {messages.length == 0 && !isLoading && (
          <div className="text-center font-light italic mt-10">Send Rachel a message...</div>
        )}

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
          // borderRadius: "30px",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px",
        }}
        className="fixed bg-white inset-x-0 bottom-0 w-100 pt-6  rounded-t-2xl shadow-xl shadow-zinc-400 text-center bg-gradient-to-r mb-30 mx-2"
      >
        <div className="flex justify-center items-center w-full">
          <div>
            <RecordMessage handleStop={handleStop} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChatComponent;
