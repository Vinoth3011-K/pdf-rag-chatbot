"use client";

import { useCallback, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { ChatMessage, ChatSource } from "@/types";

interface StreamMessage extends ChatMessage {
  streaming?: boolean;
}

let localIdCounter = 0;

function localId() {
  localIdCounter += 1;
  return `local-${Date.now()}-${localIdCounter}`;
}

export function useChatStream() {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {

      // Prevent empty messages
      if (!content || !content.trim()) {
        return;
      }

      content = content.trim();

      const userMessage: StreamMessage = {
        id: localId(),
        role: "USER",
        content,
        suggestedQuestions: [],
        sources: [],
        createdAt: new Date().toISOString(),
      };

      const assistantId = localId();

      const assistantMessage: StreamMessage = {
        id: assistantId,
        role: "ASSISTANT",
        content: "",
        suggestedQuestions: [],
        sources: [],
        createdAt: new Date().toISOString(),
        streaming: true,
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
        assistantMessage,
      ]);

      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${apiClient.apiUrl}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // No credentials: "include" — chat uses Authorization Bearer header
          signal: controller.signal,

          body: JSON.stringify({
            sessionId,
            message: content,
          }),
        });


        if (!res.ok || !res.body) {
          throw new Error("Failed to reach the chat service");
        }


        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";


        while (true) {
          const { value, done } = await reader.read();

          if (done) break;


          buffer += decoder.decode(value, {
            stream: true,
          });


          const events = buffer.split("\n\n");

          buffer = events.pop() ?? "";


          for (const rawEvent of events) {

            const lines = rawEvent.split("\n");

            let eventName = "message";
            let dataLine = "";


            for (const line of lines) {

              if (line.startsWith("event:")) {
                eventName = line
                  .slice(6)
                  .trim();
              }


              if (line.startsWith("data:")) {
                dataLine += line
                  .slice(5)
                  .trim();
              }

            }


            if (!dataLine) continue;


            const data = JSON.parse(dataLine);



            if (eventName === "session") {

              setSessionId(data.sessionId);

            }


            else if (eventName === "token") {


              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content:
                          m.content + data.content,
                      }
                    : m
                )
              );


            }


            else if (eventName === "done") {


              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: data.answer,
                        sources:
                          data.sources as ChatSource[],
                        suggestedQuestions:
                          data.suggestedQuestions as string[],
                        streaming: false,
                      }
                    : m
                )
              );


            }


            else if (eventName === "error") {


              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: `⚠️ ${
                          data.message ||
                          "Something went wrong."
                        }`,
                        streaming: false,
                      }
                    : m
                )
              );


            }

          }

        }


      } catch (err) {


        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "⚠️ Connection lost. Please try again.",
                  streaming: false,
                }
              : m
          )
        );


      } finally {

        setIsStreaming(false);
        abortRef.current = null;

      }


    },

    [sessionId]
  );


  return {
    messages,
    sendMessage,
    isStreaming,
    sessionId,
  };
}