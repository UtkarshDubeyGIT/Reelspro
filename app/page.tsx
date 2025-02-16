import { apiClient } from "@/lib/api-client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() { 
  const  [videos,setVideos]= useState<IVideo[]>([])
  useEffect((()=>{
    const fetchVideos = async () =>{
      try{
        const data = await apiClient.getVideos()
        setVideos(data)
      }catch(error){
        console.error("error fetching videos",error)
      }
    }

    fetchVideos()
  }),[])
  return (
    
    <div>
      <h1>chaiCode</h1>
    </div>
  );
}
