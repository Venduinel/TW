import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";


const socket = io("http://localhost:3000");



function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<any[]>([]);

    const [measurements, setMeasurements] = useState<any[]>([]);

    const [step2, setStep2] = useState<any[]>([]);


    useEffect(() => {
        socket.on("message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on("sensor-data", (data) => {
            setMeasurements((prev) => [...prev, data]);
        });

        socket.on("step2", (data) => {
            setStep2((prev) => [...prev, data]);
        });


        return () => {
            socket.off("message");
            socket.off("sensor-data");
            socket.off("step2");
        };
    }, []);


    const sendMessage = () => {
        if (message) {
            socket.emit("message", message);
            setMessage("");
        }
    };

    return (
        <>
            <div style={{ padding: "20px", textAlign: "center" }} className="col">
                <h2>WebSocket TWwAIR test App</h2>
                <div>
                    {messages.map((msg, index) => (
                        <p key={index}>💬 {msg}</p>
                    ))}
                </div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Wpisz wiadomość..."
                />
                <button onClick={sendMessage}>Wyślij</button>
            </div>

            <div className="col colot" id="mid">
                {measurements.map((msr, index) => (
                    <p key={index}>{JSON.stringify(msr)}</p>
                ))}
            </div>

            <div className="col colot">
                {step2.map((msg, index) => (
                    <p key={index}>{JSON.stringify(msg)}</p>
                ))}
            </div>
        </>
    );
}


export default App;