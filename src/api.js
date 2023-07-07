// api.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://192.168.1.7:3002/",
});

export default instance;

// Authentication routes (login, register, logout)

// export const loginUserWithGoogle = async (email, password) => {
//   try {
//      await instance.get("api/auth/google");
   
//   } catch (error) {
//     throw error;
//   }
// };
export const loginUser = async (email, password) => {
  try {
    const response = await instance.post("api/auth/login", {
      email,
      password,
    });
    if (response.data.token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
    } else {
      delete instance.defaults.headers.common["Authorization"];
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const loginUserWithGoogle = async () => {
  try {
    window.location.href = "http://192.168.1.7:3002/api/auth/google";
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await instance.post("api/auth/register", {
      email,
      name,
      password,
    });
    if (response.data.token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
    } else {
      delete instance.defaults.headers.common["Authorization"];
    }
    console.log("registerUser", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// LLM  routes
export const getLLMs = async () => {
  try {
    const response = await instance.get("api/ml-models");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eleven Labs voice tts routes
export const getTextToSpeech = async (message, stability, similarity_boost, voiceId) => {
  try {
    instance.defaults.headers.common["Content-Type"] = "audio/mpeg";

    const response = await instance.post(
      "api/chat/text-to-speech",
      {
        message,
        stability,
        similarity_boost,
        voiceId,
      },
      {
        headers: {
          "Content-Type": "audio/mpeg",
        },
        responseType: "arraybuffer", // Set the response type to handle binary data
      }
    );
    console.log("response raw :-", response);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSpeechToTextCompletion = async (audio) => {
  try {
    const response = await instance.post(
      "api/chat/audio-to-text-completion",
      audio,
      {
        headers: {
          "Content-Type": "audio/mpeg", 
        }
      }
    );
    console.log("response raw :-", response);
    return response.data;
  } catch (error) {
    throw error;
  }
}