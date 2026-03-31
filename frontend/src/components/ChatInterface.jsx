import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader2, Sparkles, FileText, Globe, Mic, Volume2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const SUPPORTED_LANGUAGES = ['English', 'Hindi', 'Tamil', 'Malayalam', 'Telugu', 'Kannada', 'Marathi', 'Odia', 'Gujarati'];

const UI_TRANSLATIONS = {
    English: {
        greeting: "Hello! I am the HED Document AI. Ask me any practical question about higher education policies, schemes, or regulations.",
        placeholder: "Message the HED Research Assistant...",
        disclaimer: "AI-generated responses may occasionally be inaccurate. Always verify against the provided source documents.",
        prompts: [
            "✨ Summarize the key eligibility criteria for the merit scholarship",
            "📊 What are the latest PhD admission guidelines?",
            "🎓 Explain the curriculum framework for undergraduate degrees"
        ]
    },
    Hindi: {
        greeting: "नमस्ते! मैं HED दस्तावेज़ AI हूँ। उच्च शिक्षा नीतियों, योजनाओं या नियमों के बारे में कोई भी व्यावहारिक प्रश्न पूछें।",
        placeholder: "HED रिसर्च असिस्टेंट को संदेश भेजें...",
        disclaimer: "AI-जनरेटेड प्रतिक्रियाएं कभी-कभी गलत हो सकती हैं। हमेशा प्रदान किए गए स्रोत दस्तावेजों से सत्यापित करें।",
        prompts: [
            "✨ मेरिट छात्रवृत्ति के लिए प्रमुख पात्रता मानदंडों का संक्षेप में वर्णन करें",
            "📊 नवीनतम पीएचडी प्रवेश दिशानिर्देश क्या हैं?",
            "🎓 स्नातक डिग्री के लिए पाठ्यक्रम ढांचे की व्याख्या करें"
        ]
    },
    Tamil: {
        greeting: "வணக்கம்! நான் HED ஆவண AI. உயர்கல்வி கொள்கைகள், திட்டங்கள் அல்லது விதிமுறைகள் குறித்து ஏதேனும் நடைமுறை கேள்விகளைக் கேளுங்கள்.",
        placeholder: "HED ஆராய்ச்சி உதவியாளருக்கு செய்தி அனுப்பவும்...",
        disclaimer: "AI உருவாக்கிய பதில்கள் சில நேரங்களில் தவறாக இருக்கலாம். வழங்கப்பட்ட மூல ஆவணங்களை எப்போதும் சரிபார்க்கவும்.",
        prompts: [
            "✨ தகுதி உதவித்தொகைக்கான முக்கிய தகுதி அளவுகோல்களை சுருக்கமாகக் கூறுங்கள்",
            "📊 சமீபத்திய பிஎச்டி சேர்க்கை வழிகாட்டுதல்கள் என்ன?",
            "🎓 இளங்கலை பட்டங்களுக்கான பாடத்திட்ட கட்டமைப்பை விளக்குங்கள்"
        ]
    },
    Malayalam: {
        greeting: "നമസ്കാരം! ഞാൻ HED ഡോക്യുമെന്റ് AI ആണ്. ഉന്നത വിദ്യാഭ്യാസ നയങ്ങളെക്കുറിച്ചോ പദ്ധതികളെക്കുറിച്ചോ നിയന്ത്രണങ്ങളെക്കുറിച്ചോ ഉള്ള പ്രായോഗിക ചോദ്യങ്ങൾ എന്നോട് ചോദിക്കൂ.",
        placeholder: "HED റിസർച്ച് അസിസ്റ്റൻ്റിന് സന്ദേശമയയ്‌ക്കുക...",
        disclaimer: "AI സൃഷ്ടിച്ച മറുപടികൾ ചിലപ്പോൾ തെറ്റായിരിക്കാം. നൽകിയിരിക്കുന്ന ഉറവിട പ്രമാണങ്ങളുമായി എപ്പോഴും പരിശോധിക്കുക.",
        prompts: [
            "✨ മെറിറ്റ് സ്കോളർഷിപ്പിനുള്ള പ്രധാന യോഗ്യതാ മാനദണ്ഡങ്ങൾ സംഗ്രഹിക്കുക",
            "📊 ഏറ്റവും പുതിയ പിഎച്ച്ഡി പ്രവേശന മാർഗ്ഗനിർദ്ദേശങ്ങൾ എന്തൊക്കെയാണ്?",
            "🎓 ബിരുദാനന്തര ബിരുദങ്ങളുടെ പാഠ്യപദ്ധതി ചട്ടക്കൂട് വിശദീകരിക്കുക"
        ]
    },
    Telugu: {
        greeting: "నమస్కారం! నేను HED డాక్యుమెంట్ AI. ఉన్నత విద్యా విధానాలు, పథకాలు లేదా నిబంధనల గురించి ఏవైనా ఆచరణాత్మక ప్రశ్నలు అడగండి.",
        placeholder: "HED రీసెర్చ్ అసిస్టెంట్‌కు సందేశం పంపండి...",
        disclaimer: "AI రూపొందించిన ప్రతిస్పందనలు కొన్నిసార్లు సరికానివి కావచ్చు. అందించిన మూల పత్రాలతో ఎల్లప్పుడూ ధృవీకరించండి.",
        prompts: [
            "✨ మెరిట్ స్కాలర్‌షిప్ కోసం కీలక అర్హత ప్రమాణాలను క్లుప్తీకరించండి",
            "📊 తాజా పీహెచ్‌డీ ప్రవేశ మార్గదర్శకాలు ఏమిటి?",
            "🎓 అండర్ గ్రాడ్యుయేట్ డిగ్రీల కర్రికులం ఫ్రేమ్‌వర్క్ వివరించండి"
        ]
    },
    Kannada: {
        greeting: "ನಮಸ್ಕಾರ! ನಾನು HED ಡಾಕ್ಯುಮೆಂಟ್ AI. ಉನ್ನತ ಶಿಕ್ಷಣ ನೀತಿಗಳು, ಯೋಜನೆಗಳು ಅಥವಾ ನಿಯಮಗಳ ಕುರಿತು ಯಾವುದೇ ಪ್ರಾಯೋಗಿಕ ಪ್ರಶ್ನೆಗಳನ್ನು ನನ್ನನ್ನು ಕೇಳಿ.",
        placeholder: "HED ಸಂಶೋಧನಾ ಸಹಾಯಕರಿಗೆ ಸಂದೇಶ ಕಳುಹಿಸಿ...",
        disclaimer: "AI-ರಚಿಸಿದ ಪ್ರತಿಕ್ರಿಯೆಗಳು ಕೆಲವೊಮ್ಮೆ ತಪ್ಪಾಗಿರಬಹುದು. ಒದಗಿಸಿದ ಮೂಲ ದಾಖಲೆಗಳ ವಿರುದ್ಧ ಯಾವಾಗಲೂ ಪರಿಶೀಲಿಸಿ.",
        prompts: [
            "✨ ಮೆರಿಟ್ ವಿದ್ಯಾರ್ಥಿವೇತನಕ್ಕೆ ಪ್ರಮುಖ ಅರ್ಹತೆ ಮಾನದಂಡಗಳನ್ನು ಸಂಕ್ಷೇಪಿಸಿ",
            "📊 ಇತ್ತೀಚಿನ ಪಿಎಚ್‌ಡಿ ಪ್ರವೇಶ ಮಾರ್ಗಸೂಚಿಗಳು ಯಾವುವು?",
            "🎓 ಪದವಿಪೂರ್ವ ಪದವಿಗಳಿಗೆ ಪಠ್ಯಕ್ರಮದ ಚೌಕಟ್ಟನ್ನು ವಿವರಿಸಿ"
        ]
    },
    Odia: {
        greeting: "ନମସ୍କାର! ମୁଁ HED ଡକ୍ୟୁମେଣ୍ଟ AI | ଉଚ୍ଚଶିକ୍ଷା ନୀତି, ଯୋଜନା, କିମ୍ବା ନିୟମାବଳୀ ବିଷୟରେ ମୋତେ କୌଣସି ବ୍ୟବହାରିକ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ |",
        placeholder: "HED ଅନୁସନ୍ଧାନ ସହାୟକଙ୍କୁ ବାର୍ତ୍ତା ପଠାନ୍ତୁ ...",
        disclaimer: "AI ଦ୍ୱାରା ଉତ୍ପନ୍ନ ପ୍ରତିକ୍ରିୟାଗୁଡ଼ିକ ବେଳେବେଳେ ଭୁଲ୍ ହୋଇପାରେ | ଦିଆଯାଇଥିବା ଉତ୍ସ ଡକ୍ୟୁମେଣ୍ଟ୍ ସହିତ ସବୁବେଳେ ଯାଞ୍ଚ କରନ୍ତୁ |",
        prompts: [
            "✨ ମେଧା ବୃତ୍ତି ପାଇଁ ମୁଖ୍ୟ ଯୋଗ୍ୟତା ମାନଦଣ୍ଡଗୁଡ଼ିକୁ ସଂକ୍ଷେପ କରନ୍ତୁ",
            "📊 ସର୍ବଶେଷ ପିଏଚଡି ନାମଲେଖା ନିୟମାବଳୀ କ’ଣ?",
            "🎓 ସ୍ନାତକ ଡିଗ୍ରୀ ପାଇଁ ପାଠ୍ୟକ୍ରମ ଢାଞ୍ଚା ବୁଝାନ୍ତୁ"
        ]
    },
    Marathi: {
        greeting: "नमस्कार! मी HED दस्तऐवज AI आहे. मला उच्च शिक्षण धोरणे, योजना किंवा नियमांबद्दल कोणतेही व्यावहारिक प्रश्न विचारा.",
        placeholder: "HED संशोधन सहाय्यकाला संदेश पाठवा...",
        disclaimer: "AI द्वारे व्युत्पन्न केलेला प्रतिसाद काहीवेळा चुकीचा असू शकतो. प्रदान केलेल्या मूळ दस्तऐवजांसह नेहमी सत्यापित करा.",
        prompts: [
            "✨ गुणवत्ता शिष्यवृत्तीसाठी प्रमुख पात्रता निकषांचा सारांश द्या",
            "📊 नवीनतम पीएचडी प्रवेश मार्गदर्शक तत्त्वे काय आहेत?",
            "🎓 पदवीपूर्व अभ्यासक्रमाची रचना स्पष्ट करा"
        ]
    },
    Gujarati: {
        greeting: "નમસ્તે! હું HED દસ્તાવેજ AI છું. મને ઉચ્ચ શિક્ષણ નીતિઓ, યોજનાઓ અથવા નિયમો વિશે કોઈપણ વ્યવહારુ પ્રશ્ન પૂછો.",
        placeholder: "HED સંશોધન સહાયકને સંદેશ મોકલો...",
        disclaimer: "AI-જનરેટેડ જવાબો ક્યારેક અચોક્કસ હોઈ શકે છે. પૂરા પાડવામાં આવેલ સ્રોત દસ્તાવેજો સાથે હંમેશા ચકાસણી કરો.",
        prompts: [
            "✨ મેરિટ શિષ્યવૃત્તિ માટેના મુખ્ય પાત્રતા માપદંડોનો સારાંશ આપો",
            "📊 નવીનતમ પીએચડી પ્રવેશ માર્ગદર્શિકા શું છે?",
            "🎓 અંડરગ્રેજ્યુએટ ડિગ્રી માટે અભ્યાસક્રમ માળખું સમજાવો"
        ]
    }
};

export default function ChatInterface({ user, pendingPrompt, setPendingPrompt }) {
    const [language, setLanguage] = useState('English');
    const t = UI_TRANSLATIONS[language]; // Current translation dictionary

    const [messages, setMessages] = useState([]);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentlySpeaking, setCurrentlySpeaking] = useState(null);
    const [voices, setVoices] = useState([]);
    const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);
    const [selectedVoiceOverride, setSelectedVoiceOverride] = useState(null);
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);
    const [voiceHealth, setVoiceHealth] = useState('unknown'); // 'ready', 'limited', 'missing', 'unknown'

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => prev ? `${prev} ${transcript}` : transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }

        // Initialize Voices
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            console.log(`Loaded ${availableVoices.length} voices`);
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Voice health check periodically
        const healthCheck = setInterval(() => {
            const currentVoices = window.speechSynthesis.getVoices();
            if (currentVoices.length > 0) {
                const hasRegional = currentVoices.some(v => !v.lang.startsWith('en'));
                setVoiceHealth(hasRegional ? 'ready' : 'limited');
            } else {
                setVoiceHealth('missing');
            }
        }, 2000);

        return () => {
            clearInterval(healthCheck);
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    // Explicitly update SpeechRecognition lang when language state changes
    useEffect(() => {
        if (recognitionRef.current) {
            const langMap = {
                'English': 'en-IN',
                'Hindi': 'hi-IN',
                'Tamil': 'ta-IN',
                'Malayalam': 'ml-IN',
                'Telugu': 'te-IN',
                'Kannada': 'kn-IN',
                'Odia': 'or-IN',
                'Marathi': 'mr-IN',
                'Gujarati': 'gu-IN'
            };
            recognitionRef.current.lang = langMap[language] || 'en-IN';
            console.log(`STT: Language set to ${recognitionRef.current.lang}`);
        }
        
        // Auto-enable Auto-Speak for Malayalam specifically if user switches to it
        if (language === 'Malayalam' && !autoSpeakEnabled) {
            setAutoSpeakEnabled(true);
        }
    }, [language]);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const handleSpeak = async (text, msgIdx) => {
        if (!window.speechSynthesis) {
            alert("Text-to-speech is not supported in this browser.");
            return;
        }

        // If currently speaking this message, stop it
        if (currentlySpeaking === msgIdx) {
            window.speechSynthesis.cancel();
            setCurrentlySpeaking(null);
            return;
        }

        window.speechSynthesis.cancel(); // Stop any ongoing speech

        const utterance = new SpeechSynthesisUtterance(text);

        const langMap = {
            'English': ['en-IN', 'en-GB', 'en-US'],
            'Hindi': ['hi-IN', 'hi_IN', 'hi'],
            'Tamil': ['ta-IN', 'ta_IN', 'ta'],
            'Malayalam': ['ml-IN', 'ml_IN', 'ml'],
            'Telugu': ['te-IN', 'te_IN', 'te'],
            'Kannada': ['kn-IN', 'kn_IN', 'kn'],
            'Odia': ['or-IN', 'or_IN', 'or'],
            'Marathi': ['mr-IN', 'mr_IN', 'mr'],
            'Gujarati': ['gu-IN', 'gu_IN', 'gu']
        };

        const targetLangs = langMap[language] || ['en-IN'];
        utterance.lang = targetLangs[0];

        // Find the best matching voice
        let currentVoices = voices;
        
        // Retry if voices list is empty
        if (currentVoices.length === 0) {
            currentVoices = window.speechSynthesis.getVoices();
            if (currentVoices.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 300));
                currentVoices = window.speechSynthesis.getVoices();
            }
            setVoices(currentVoices);
        }

        let selectedVoice = null;

        // 0. Manual Override
        if (selectedVoiceOverride) {
            selectedVoice = currentVoices.find(v => v.name === selectedVoiceOverride);
        }

        if (!selectedVoice) {
            const normalizedTargetLangs = targetLangs.map(l => l.toLowerCase().replace('_', '-'));

            // 1. Try exact matches on BCP-47 tags
            selectedVoice = currentVoices.find(v => 
                normalizedTargetLangs.includes(v.lang.toLowerCase().replace('_', '-'))
            );

            // 2. Try prefix matches (e.g., 'hi-' matches 'hi-IN')
            if (!selectedVoice) {
                selectedVoice = currentVoices.find(v => 
                    normalizedTargetLangs.some(target => v.lang.toLowerCase().startsWith(target.split('-')[0]))
                );
            }

            // 3. Try searching for original language name in voice name or lang string
            if (!selectedVoice) {
                selectedVoice = currentVoices.find(v => 
                    v.name.toLowerCase().includes(language.toLowerCase()) || 
                    v.lang.toLowerCase().includes(language.toLowerCase())
                );
            }
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`TTS: Success! Selected "${selectedVoice.name}" (${selectedVoice.lang}) for ${language}`);
        } else {
            console.warn(`TTS: No specialized voice found for ${language}. Browsing all ${currentVoices.length} voices...`);
        }

        utterance.onend = () => setCurrentlySpeaking(null);
        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setCurrentlySpeaking(null);
        };

        setCurrentlySpeaking(msgIdx);
        window.speechSynthesis.speak(utterance);
    };

    // Initial Fetch of Chat History
    useEffect(() => {
        if (!user || !user.identifier) return;

        let isMounted = true;
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/chat/history/${user.identifier}`, { timeout: 3000 });
                console.log("HISTORY FETCH RESULT:", res.data);
                if (isMounted) {
                    if (res.data && Array.isArray(res.data.messages) && res.data.messages.length > 0) {
                        setMessages(res.data.messages);
                    } else {
                        // User is completely new or has no history, give them the localized greeting
                        setMessages([{ role: 'assistant', content: t.greeting, sources: [] }]);
                    }
                    setIsHistoryLoaded(true);
                }
            } catch (err) {
                console.error("Failed to fetch chat history:", err);
                if (isMounted) {
                    setMessages([{ role: 'assistant', content: t.greeting, sources: [] }]);
                    setIsHistoryLoaded(true);
                }
            }
        };
        fetchHistory();
        return () => { isMounted = false; };
    }, [user, t.greeting]);

    // Background Sync of Chat History whenever messages change significantly
    useEffect(() => {
        if (!isHistoryLoaded) return; // Wait until initial fetch completes

        const syncHistory = async () => {
            if (!user || !user.identifier || messages.length <= 1) return;
            try {
                await axios.post(`${API_BASE_URL}/chat/history`, {
                    identifier: user.identifier,
                    messages: messages
                });
            } catch (err) {
                console.error("Failed to sync chat history:", err);
            }
        };

        // Let's only sync when a full interaction loop is complete (assistant replied or empty state generated)
        if (messages.length > 0) {
            syncHistory();
        }
    }, [messages, user, isHistoryLoaded]);

    // Update greeting if it's the only message in chat history
    useEffect(() => {
        if (messages.length === 1 && messages[0].role === 'assistant') {
            setMessages([{ role: 'assistant', content: t.greeting, sources: [] }]);
            
            // Auto-speak the greeting if Malayalam or Auto-Speak is enabled
            if (language === 'Malayalam' || autoSpeakEnabled) {
                setTimeout(() => {
                    handleSpeak(t.greeting, 0);
                }, 800);
            }
        }
    }, [language]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e, overrideInput = null) => {
        if (e) e.preventDefault();
        const userMsg = overrideInput || input.trim();
        if (!userMsg || loading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/query`, {
                query: userMsg,
                language: language,
                identifier: user?.identifier
            });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.answer,
                sources: response.data.sources
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Server connection error. Please try asking your question again.',
                sources: []
            }]);
        } finally {
            setLoading(false);
        }
    };

    // Auto-speak hook: Speak the last message if it's from the assistant and auto-speak is on
    useEffect(() => {
        if (autoSpeakEnabled && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant' && lastMsg.content !== t.greeting) {
                // Short delay to ensure browser is ready
                setTimeout(() => {
                    handleSpeak(lastMsg.content, messages.length - 1);
                }, 500);
            }
        }
    }, [messages.length, autoSpeakEnabled]);

    // Auto-send hook for Dashboard Quick Actions
    useEffect(() => {
        if (pendingPrompt && isHistoryLoaded && !loading) {
            handleSend(null, pendingPrompt);
            if (setPendingPrompt) setPendingPrompt(null);
        }
    }, [pendingPrompt, isHistoryLoaded, loading]);

    return (
        <div className="flex flex-col h-full bg-slate-50 relative flex-1 min-h-0 rounded-[2.5rem]">

            {/* Top Toolbar */}
            <div className="absolute top-0 right-0 z-10 p-4 flex gap-2">
                <button
                    onClick={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-[10px] font-bold uppercase transition-all ${autoSpeakEnabled ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 hover:text-blue-600'}`}
                    title={autoSpeakEnabled ? "Auto-speak ON" : "Auto-speak OFF"}
                >
                    <Volume2 className="w-3.5 h-3.5" />
                    {autoSpeakEnabled ? 'Auto Speak: ON' : 'Auto Speak: OFF'}
                </button>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-sm text-slate-700 font-semibold focus-within:ring-2 focus-within:ring-blue-500/20">
                    <div className="flex items-center gap-1.5 border-r border-slate-100 pr-2 mr-1">
                        <div 
                            className={`w-2 h-2 rounded-full ${voiceHealth === 'ready' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : voiceHealth === 'limited' ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            title={voiceHealth === 'ready' ? "Regional Voices Ready" : voiceHealth === 'limited' ? "Regional Voices Limited (English fallback likely)" : "No Voices Found"}
                        />
                        <button onClick={() => setShowVoiceSettings(true)} className="text-slate-400 hover:text-blue-500 transition-colors">
                            <Volume2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <Globe className="w-4 h-4 text-blue-500" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Voice Settings Modal */}
            {showVoiceSettings && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Voice Settings</h3>
                                <p className="text-xs text-slate-500 mt-1">If the AI sounds English, manually select a regional voice below.</p>
                            </div>
                            <button 
                                onClick={() => setShowVoiceSettings(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
                            >
                                <Sparkles className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Available System Voices</div>
                            
                            <button 
                                onClick={() => {
                                    setSelectedVoiceOverride(null);
                                    setShowVoiceSettings(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${!selectedVoiceOverride ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                            >
                                <div className="text-sm">Auto-Selection (Recommended)</div>
                                <div className="text-[10px] opacity-70">Detect best match for {language}</div>
                            </button>

                            {voices.map((v, i) => (
                                <button 
                                    key={i}
                                    onClick={() => {
                                        setSelectedVoiceOverride(v.name);
                                        setShowVoiceSettings(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${selectedVoiceOverride === v.name ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="text-sm flex justify-between">
                                        <span>{v.name}</span>
                                        {v.localService && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">High Quality</span>}
                                    </div>
                                    <div className="text-[10px] opacity-70 font-mono uppercase">{v.lang}</div>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                            <button 
                                onClick={() => handleSpeak("ഹലോ, എനിക്ക് മലയാളം സംസാരിക്കാൻ കഴിയും.", -2)}
                                className="w-full bg-blue-600 text-white rounded-xl py-2 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                            >
                                <Volume2 className="w-4 h-4" />
                                Test Malayalam Voice
                            </button>
                            <p className="text-[10px] text-slate-400 leading-tight text-center">
                                <b>Note:</b> If no regional voices (Hindi, Malayalam, etc.) appear, you may need to install the **Language Pack** in your Windows/macOS Settings or use <b>Google Chrome</b>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat History Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-48 pt-16">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {/* Avatar for Assistant */}
                            {msg.role === 'assistant' && (
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 shadow-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                                }`}>
                                <div className="prose prose-sm sm:prose-base max-w-none leading-relaxed">
                                    {msg.content}
                                </div>

                                {/* Sources Badge (Only for AI) */}
                                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                                        <FileText className="w-3 h-3 text-slate-400" />
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Sources:</span>
                                        {msg.sources.map((src, i) => (
                                            <span key={i} className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                                                {src.split('/').pop().split('\\').pop() || "Document"}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* Voices / TTS Button (Only for AI) */}
                                {msg.role === 'assistant' && (
                                    <div className="mt-3 flex items-center justify-end">
                                        <button
                                            onClick={() => handleSpeak(msg.content, idx)}
                                            className={`p-1.5 rounded-full transition-colors ${currentlySpeaking === idx ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100'}`}
                                            title="Listen to response"
                                        >
                                            <Volume2 className={`w-4 h-4 ${currentlySpeaking === idx ? 'animate-pulse' : ''}`} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Avatar for User */}
                            {msg.role === 'user' && (
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 shadow-md">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>
                    ))}


                    {/* Empty State / Suggested Prompts */}
                    {messages.length === 1 && (
                        <div className="flex flex-wrap gap-2 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {t.prompts.map((prompt, i) => (
                <button
                                    key={i}
                                    onClick={() => handleSend(null, prompt)}
                                    className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 px-4 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm flex items-center gap-2 group"
                                >
                                    <span className="flex-1 text-left">{prompt}</span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSpeak(prompt, -3);
                                        }}
                                        className="p-1.5 rounded-full hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Listen to this prompt"
                                    >
                                        <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Loading indicator bubble */}
                    {loading && (
                        <div className="flex gap-4 justify-start">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
                                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 shadow-sm">
                                <span className="flex h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="flex h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="flex h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Form Area */}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-10 pb-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <form onSubmit={handleSend} className="relative flex items-center bg-white rounded-full shadow-lg shadow-slate-200/50 border border-slate-200 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t.placeholder}
                            className="w-full pl-6 pr-16 py-4 bg-transparent border-transparent focus:border-transparent focus:ring-0 outline-none text-slate-800 placeholder:text-slate-400"
                            disabled={loading}
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={toggleRecording}
                                className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'}`}
                                title={isRecording ? "Stop recording" : "Start Voice Input"}
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full transition-colors flex items-center justify-center"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                        {t.disclaimer}
                    </p>
                </div>
            </div>

        </div>
    );
}
