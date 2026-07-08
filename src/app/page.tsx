"use client"

import { useState } from "react";

export default function Home() {

  const [text, setText] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">머니로그</h1>
      
    
    <input
    type="text"
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="예: 어제 편의점 3천원"
    className="w-80 rounded-lg border px-4 pt-2"/>

    
    
    
    
    </main>
  );
}