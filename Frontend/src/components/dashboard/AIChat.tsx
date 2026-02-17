import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    tokens?: number;
    cost?: number;
}

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your AI assistant for AegisAI. I can help you understand loan decisions, explain risk scores, analyze governance incidents, and answer questions about the system. How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.queryLLM({
                prompt: input.trim(),
                use_case: 'general_query',
                user_id: 'admin'
            });

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
                tokens: response.tokens_used,
                cost: response.cost_usd
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to get AI response:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please make sure the OpenRouter API key is configured in the Model API settings.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestedQuestions = [
        "Why was the last loan rejected?",
        "What factors influence loan approval?",
        "Explain the current trust score",
        "What is drift detection?"
    ];

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl transition-all transform hover:scale-110 z-50 group"
                    title="AI Assistant"
                >
                    <MessageSquare className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Ask AI Assistant
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-primary to-green-700 text-white rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold">AI Assistant</h3>
                                <p className="text-xs text-white/80">Powered by OpenRouter</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                        message.role === 'user'
                                            ? 'bg-primary text-white'
                                            : 'bg-white border border-gray-200 text-gray-800'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    {message.tokens && (
                                        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                                            <span>{message.tokens} tokens</span>
                                            {message.cost && <span>${message.cost.toFixed(5)}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        <span className="text-sm text-gray-600">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Questions (show when no messages) */}
                    {messages.length === 1 && (
                        <div className="px-4 py-2 border-t border-gray-200 bg-white">
                            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                            <div className="space-y-1">
                                {suggestedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInput(question)}
                                        className="w-full text-left text-xs px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                        <div className="flex items-end space-x-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about loans, risk, or governance..."
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                rows={2}
                                disabled={loading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="p-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Press Enter to send, Shift+Enter for new line
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChat;
