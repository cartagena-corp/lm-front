
import { ChatIAIcon, XIcon, SendIcon, AttachIcon } from "@/assets/Icon"
import AutoResizeTextarea from "@/components/ui/AutoResizeTextarea"
import { useState } from "react"
import { useGeminiStore } from "@/lib/store/GeminiStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { toast } from "react-hot-toast"

// Formatea el texto plano de la IA a JSX enriquecido
function renderFormattedText(text: string) {
    // Divide en líneas
    const lines = text.split(/\r?\n/);
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let isList = false;

    const boldRegex = /\*\*(.*?)\*\*/g;
    const tabRegex = /^([\t]+)/;

    function formatLine(line: string) {
        // Sangría visual por tabs
        const tabMatch = line.match(tabRegex);
        const indent = tabMatch ? tabMatch[1].length : 0;
        let content = line.replace(tabRegex, "");
        // Negrita
        content = content.replace(boldRegex, (_, p1) => `<strong>${p1}</strong>`);
        // Render como HTML seguro
        return <span style={{ marginLeft: indent * 20 }} dangerouslySetInnerHTML={{ __html: content }} />;
    }

    lines.forEach((line, idx) => {
        if (/^([*\-])\s+/.test(line)) {
            // Es lista
            isList = true;
            listItems.push(line.replace(/^([*\-])\s+/, ""));
        } else {
            if (isList && listItems.length) {
                // Renderiza lista
                elements.push(
                    <ul key={`ul-${idx}`} className="list-disc ml-6">
                        {listItems.map((item, i) => (
                            <li key={i}>{formatLine(item)}</li>
                        ))}
                    </ul>
                );
                listItems = [];
                isList = false;
            }
            // Renderiza línea normal
            if (line.trim() !== "") {
                elements.push(<div key={idx}>{formatLine(line)}</div>);
            } else {
                elements.push(<br key={`br-${idx}`} />);
            }
        }
    });
    // Si termina con lista
    if (isList && listItems.length) {
        elements.push(
            <ul key={`ul-end`} className="list-disc ml-6">
                {listItems.map((item, i) => (
                    <li key={i}>{formatLine(item)}</li>
                ))}
            </ul>
        );
    }
    return elements;
}

export default function ChatWithIA({ onCancel }: { onCancel: () => void }) {
    const [messages, setMessages] = useState([
        { text: "¡Hola! Soy tu asistente de IA. Puedes preguntarme cualquier cosa y te responderé aquí.", isUser: false, role: "assistant" }
    ]);
    const [inputText, setInputText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const { chatWithGemini } = useGeminiStore();
    const { getValidAccessToken } = useAuthStore();

    const handleSubmit = async () => {
        if (!inputText.trim() || isProcessing) return;
        setIsProcessing(true);

        // Agregar mensaje del usuario con role
        setMessages(prev => [...prev, { text: inputText, isUser: true, role: "user" }]);

        try {
            const token = await getValidAccessToken();
            if (!token) throw new Error("No se pudo obtener el token de autenticación");

            // Mensaje informativo para la IA
            const systemInstruction = {
                role: "system",
                content: "Este es el contexto del chat. Responde en base a lo que se te ha preguntado. Si te preguntan algo que ya se preguntó antes, no repitas la misma respuesta, vuelve a procesar la pregunta y utiliza el historial para dar una respuesta más completa si es posible."
            };
            // Simula historial conversacional para la IA
            const formattedMessages = [
                systemInstruction,
                ...messages.map(msg => ({ role: msg.role, content: msg.text })),
                { role: "user", content: inputText }
            ];
            const response = await chatWithGemini(token, formattedMessages);
            let iaText = typeof response === "string" ? response : response?.text || "Respuesta de IA no disponible.";
            setMessages(prev => [...prev, { text: iaText, isUser: false, role: "assistant" }]);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Hubo un error al procesar tu mensaje.");
            setMessages(prev => [...prev, { text: "Lo siento, hubo un error al procesar tu mensaje.", isUser: false, role: "assistant" }]);
        } finally {
            setIsProcessing(false);
            setInputText("");
        }
    };

    return (
        <div className="bg-white border-gray-100 rounded-xl shadow-sm border h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-blue-600 rounded-md p-2">
                            <ChatIAIcon size={24} />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-gray-900 font-semibold text-lg">Chatea con IA</h3>
                            <p className="text-gray-500 text-sm">
                                Chatea con nuestro asistente de IA para que te ayude a solucionar tus dudas.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="bg-white text-gray-400 hover:text-gray-700 rounded-md cursor-pointer p-2 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <XIcon size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <section className="overflow-y-auto p-6 flex flex-col gap-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] text-sm p-3 rounded-2xl ${message.isUser
                                ? 'bg-blue-600 text-white rounded-br-none whitespace-pre-wrap'
                                : 'bg-black/5 text-black rounded-bl-none'
                                }`}
                        >
                            {message.isUser
                                ? message.text
                                : renderFormattedText(message.text)
                            }
                            {/* Loader animado de tres puntos verticales */}
                            {isProcessing && index === messages.length - 1 && !message.isUser && (
                                <div className="flex items-center h-5 ml-2">
                                    <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                                    <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {/* Loader flotante si no hay mensaje IA aún */}
                {isProcessing && messages.length > 0 && messages[messages.length - 1].isUser && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] text-sm p-3 rounded-2xl bg-black/5 text-black flex items-center rounded-bl-none">
                            <div className="flex justify-center items-center gap-[3px] h-3 w-7">
                                <span className="inline-block w-[5px] h-[5px] bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="inline-block w-[5px] h-[5px] bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                                <span className="inline-block w-[5px] h-[5px] bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Footer con input igual a CreateWithIA */}
            <div className="border-t border-gray-200 mt-auto">
                <div className="flex flex-col items-stretch gap-2 p-6">
                    <AutoResizeTextarea
                        className="focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:ring-2 transition-all max-h-28! w-full p-2.5 text-sm border resize-none focus:outline-none placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={inputText}
                        onChange={setInputText}
                        placeholder="Escribe tu mensaje para la IA..."
                        onPaste={() => { }}
                        disabled={isProcessing}
                    />
                    <div className="flex justify-between items-center">
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => { }}
                            type="button"
                            title="Adjuntar archivos"
                            disabled={isProcessing}
                        >
                            <AttachIcon size={16} stroke={2} />
                            Adjuntar
                        </button>

                        <button
                            className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            type="button"
                            disabled={!inputText.trim() || isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <SendIcon size={16} stroke={2} />
                                    Enviar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
