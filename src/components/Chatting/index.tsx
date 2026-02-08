"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    setDoc,
    getDocs,
    limit
} from "firebase/firestore";
import { CustomerListItem } from "@/components/Tables/customer-list/fetch";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Message {
    id: string;
    text?: string;
    img?: string;
    sender: "admin" | "customer";
    createdAt: any;
}

export function Chatting({
    initialCustomers,
    className,
}: {
    initialCustomers: CustomerListItem[];
    className?: string;
}) {
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(
        null
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredCustomers = initialCustomers.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Listen for messages when a customer is selected
    useEffect(() => {
        if (!selectedCustomer) {
            setMessages([]);
            return;
        }

        // Reference to the messages collection for this specific customer
        // We use the customer's user_id as the document ID in 'chats' collection
        const messagesRef = collection(db, "chats", selectedCustomer.id, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [selectedCustomer]);

    const handleSendMessage = async (e?: React.FormEvent, imageUrl?: string) => {
        if (e) e.preventDefault();

        // Allow sending if there's text OR an image
        if ((!newMessage.trim() && !imageUrl) || !selectedCustomer) return;

        try {
            const messageData: any = {
                sender: "admin",
                createdAt: serverTimestamp(),
            };

            if (newMessage.trim()) messageData.text = newMessage;
            if (imageUrl) messageData.img = imageUrl;

            // Add message to subcollection
            const messagesRef = collection(db, "chats", selectedCustomer.id, "messages");
            await addDoc(messagesRef, messageData);

            // Update parent chat document with last message info for sorting/preview if needed
            const chatDocRef = doc(db, "chats", selectedCustomer.id);
            await setDoc(chatDocRef, {
                customerId: selectedCustomer.id,
                customerName: selectedCustomer.name,
                lastMessage: imageUrl ? "[Image]" : newMessage,
                lastMessageTime: serverTimestamp(),
                // Helper field for sorting chats by recent activity could be added here
            }, { merge: true });

            setNewMessage("");
            if (imageUrl && fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/v1/chat/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            if (data.success && data.url) {
                // Send message with image immediately
                await handleSendMessage(undefined, data.url);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div
            className={cn(
                "flex h-[calc(100vh-180px)] rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card overflow-hidden",
                className
            )}
        >
            {/* Sidebar - Customer List */}
            <div className="w-1/3 min-w-[300px] border-r border-stroke dark:border-strokedark flex flex-col">
                <div className="p-4 border-b border-stroke dark:border-strokedark">
                    <h2 className="text-xl font-bold mb-4 text-dark dark:text-white">Customers</h2>
                    <input
                        type="text"
                        placeholder="Search by name or login ID"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                        <div className="p-4 text-center text-body-sm text-dark-4 dark:text-dark-6">
                            No customers found.
                        </div>
                    ) : (
                        filteredCustomers.map((customer) => (
                            <div
                                key={customer.id}
                                onClick={() => setSelectedCustomer(customer)}
                                className={cn(
                                    "cursor-pointer p-4 border-b border-stroke dark:border-strokedark hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors",
                                    selectedCustomer?.id === customer.id ? "bg-gray-2 dark:bg-gray-700" : ""
                                )}
                            >
                                <h3 className="text-sm font-semibold text-dark dark:text-white">
                                    {customer.name}
                                </h3>
                                <p className="text-xs text-body-sm text-dark-5 dark:text-dark-6">
                                    {customer.email} | {customer.id}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
                {selectedCustomer ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white dark:bg-gray-dark border-b border-stroke dark:border-strokedark flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-dark dark:text-white">
                                    {selectedCustomer.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-body-sm">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full",
                                        selectedCustomer.status === "Active" ? "bg-success" : "bg-danger"
                                    )}></span>
                                    {selectedCustomer.status}
                                </div>
                            </div>
                            <div></div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                            {messages.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-body-sm text-dark-5 dark:text-dark-6">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "max-w-[70%] rounded-lg p-3 text-sm",
                                            msg.sender === "admin"
                                                ? "bg-white text-dark self-end dark:bg-primary dark:text-white"
                                                : "bg-[#3C3C3C] text-white self-start" // Matching screenshot style roughly for received
                                        )}
                                    >
                                        {msg.img ? (
                                            <div className="mb-1">
                                                <a href={msg.img} target="_blank" rel="noopener noreferrer">
                                                    <Image
                                                        src={msg.img}
                                                        alt="Chat image"
                                                        width={200}
                                                        height={200}
                                                        className="rounded-md object-cover max-h-[300px] w-auto mb-2"
                                                    />
                                                </a>
                                                {msg.text && <div className="mt-2">{msg.text}</div>}
                                            </div>
                                        ) : (
                                            <div className="mb-1">{msg.text}</div>
                                        )}

                                        <div className={cn(
                                            "text-[10px]",
                                            msg.sender === "admin" ? "text-dark-5 dark:text-dark-6 text-right" : "text-gray-200"
                                        )}>
                                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-gray-dark border-t border-stroke dark:border-strokedark">
                            <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2 items-center">
                                <label className="cursor-pointer text-primary hover:text-opacity-80 p-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        ref={fileInputRef}
                                        disabled={isUploading}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                    </svg>
                                </label>

                                <input
                                    type="text"
                                    placeholder={isUploading ? "Uploading image..." : "Type your message..."}
                                    className="flex-1 rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={isUploading}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isUploading}
                                    className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg
                                            className="h-6 w-6 transform rotate-90"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                        <div className="text-center">
                            <h3 className="mb-2 text-xl font-bold text-dark dark:text-white">
                                Select a customer to chat
                            </h3>
                            <p className="text-body-sm text-dark-5 dark:text-dark-6">
                                Choose a customer from the sidebar to view messages.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
