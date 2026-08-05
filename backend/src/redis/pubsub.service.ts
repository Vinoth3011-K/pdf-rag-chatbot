import { EventEmitter } from "events";
import { v4 as uuid } from "uuid";

import {
  publisherClient,
  subscriberClient
} from "./client";

import { RedisTopics } from "./topics";

import {
  ChatRequestMessage,
  ChatResponseMessage,
  ChatStreamChunkMessage,
  PdfProcessRequestMessage,
  PdfProcessResponseMessage
} from "./types";

import { logger } from "@utils/logger";


class RedisEventBus extends EventEmitter {}

export const redisEventBus = new RedisEventBus();

redisEventBus.setMaxListeners(0);


let initialized = false;



export async function initPubSubSubscriptions(): Promise<void> {

  if (initialized) return;

  initialized = true;


  // PDF Processing Response

  await subscriberClient.subscribe(
    RedisTopics.PDF_PROCESS_RESPONSE,
    (rawMessage: string) => {

      try {

        const message: PdfProcessResponseMessage =
          JSON.parse(rawMessage);


        redisEventBus.emit(
          `pdf:${message.requestId}`,
          message
        );


      } catch (err) {

        logger.error(
          "Failed parsing PDF response",
          {
            err,
            rawMessage
          }
        );

      }

    }
  );



  // Chat final response

  await subscriberClient.subscribe(
    RedisTopics.CHAT_RESPONSE,
    (rawMessage: string) => {


      try {

        const message: ChatResponseMessage =
          JSON.parse(rawMessage);


        redisEventBus.emit(
          `chat:done:${message.requestId}`,
          message
        );


      } catch(err){

        logger.error(
          "Failed parsing chat response",
          {
            err,
            rawMessage
          }
        );

      }

    }
  );




  // Chat streaming token

  await subscriberClient.subscribe(
    RedisTopics.CHAT_STREAM_CHUNK,
    (rawMessage:string)=>{


      try{

        const message:ChatStreamChunkMessage =
          JSON.parse(rawMessage);


        redisEventBus.emit(
          `chat:chunk:${message.requestId}`,
          message
        );


      }catch(err){

        logger.error(
          "Failed parsing chat stream chunk",
          {
            err,
            rawMessage
          }
        );

      }


    }
  );



  logger.info(
    "Subscribed to Redis response topics"
  );

}





export async function publishPdfProcessRequest(

  payload: Omit<
    PdfProcessRequestMessage,
    "requestId"
  >

): Promise<string>{


  const requestId = uuid();



  const message:PdfProcessRequestMessage = {

    requestId,

    ...payload

  };



  await publisherClient.publish(

    RedisTopics.PDF_PROCESS_REQUEST,

    JSON.stringify(message)

  );



  logger.info(
    `Published PDF processing request ${requestId}`
  );


  return requestId;

}







export function waitForPdfProcessResponse(

 requestId:string,

 timeoutMs:number = 5 * 60 * 1000

):Promise<PdfProcessResponseMessage>{



 return new Promise((resolve,reject)=>{


    const timer=setTimeout(()=>{


      redisEventBus.removeAllListeners(
        `pdf:${requestId}`
      );


      reject(
        new Error(
          "Timed out waiting for PDF processing response"
        )
      );


    },timeoutMs);





    redisEventBus.once(

      `pdf:${requestId}`,

      (message:PdfProcessResponseMessage)=>{


        clearTimeout(timer);


        resolve(message);


      }

    );


 });



}







export async function publishChatRequest(

 payload:Omit<
 ChatRequestMessage,
 "requestId"
 >

):Promise<string>{


 const requestId=uuid();



 const message:ChatRequestMessage={

   requestId,

   ...payload

 };



 await publisherClient.publish(

   RedisTopics.CHAT_REQUEST,

   JSON.stringify(message)

 );



 return requestId;


}








export function subscribeToChatStream(

 requestId:string,

 onChunk:(chunk:ChatStreamChunkMessage)=>void,

 onDone:(response:ChatResponseMessage)=>void,

 onError:(error:Error)=>void,

 timeoutMs:number=2*60*1000


):()=>void{


 const chunkEvent =
 `chat:chunk:${requestId}`;


 const doneEvent =
 `chat:done:${requestId}`;




 const chunkListener =
 (chunk:ChatStreamChunkMessage)=>{

    onChunk(chunk);

 };





 const doneListener =
 (response:ChatResponseMessage)=>{


    clearTimeout(timer);


    cleanup();


    onDone(response);

 };





 const timer=setTimeout(()=>{


    cleanup();


    onError(
      new Error(
        "Timed out waiting for chat response"
      )
    );


 },timeoutMs);






 function cleanup(){

    clearTimeout(timer);


    redisEventBus.removeListener(
      chunkEvent,
      chunkListener
    );


    redisEventBus.removeListener(
      doneEvent,
      doneListener
    );

 }





 redisEventBus.on(
   chunkEvent,
   chunkListener
 );



 redisEventBus.once(
   doneEvent,
   doneListener
 );



 return cleanup;


}