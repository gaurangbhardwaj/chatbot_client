import { ReactMediaRecorder } from "react-media-recorder";
import MicAnimation from "assets/animations/mic-animation.json";
import Lottie from "lottie-react";
import MicIcon from "@mui/icons-material/Mic";

const RecordMessage = ({ handleStop }) => {
  return (
    <ReactMediaRecorder
      audio
      onStop={handleStop}
      render={({ status, startRecording, stopRecording }) => (
        <div className="mt-2">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            className={
              status !== "recording"
                ? " bg-gradient-to-r from-primary-red to-secondary-red p-4 rounded-full shadow-xl"
                : ""
            }
          >
            {status !== "recording" && (
              <MicIcon fontSize="large" color="white" />
            )}
            {status == "recording" && (
              <Lottie
                animationData={MicAnimation}
                loop={true}
                style={{
                  width: "25%",
                  height: "25%",
                  textAlign: "center",
                  display: "inherit",
                }}
              />
            )}
          </button>
        </div>
      )}
    />
  );
};

export default RecordMessage;
