const fs = require('fs');
const path = require('path');

// 1. Patch Chat.tsx
const chatFile = path.join(__dirname, 'aina-frontend', 'src', 'pages', 'Chat', 'Chat.tsx');
let chatContent = fs.readFileSync(chatFile, 'utf8');

// Use display: grid on the main container
chatContent = chatContent.replace(
    '<div className="relative flex min-h-screen z-10" >',
    '<div className="relative grid grid-cols-[auto_1fr] h-screen pt-20 z-10">'
);
// Make the main zone area take available space and handle scrolling correctly
chatContent = chatContent.replace(
    '<div className="flex-1 flex flex-col p-6 relative">',
    '<div className="flex-1 flex flex-col p-6 relative overflow-hidden h-full">'
);
fs.writeFileSync(chatFile, chatContent);

// 2. Patch ChatSidebar.tsx
const sidebarFile = path.join(__dirname, 'aina-frontend', 'src', 'components', 'chat', 'ChatSidebar.tsx');
let sidebarContent = fs.readFileSync(sidebarFile, 'utf8');

// Clean absolute positioning ("fixed left-0 top-20...") -> make it a grid item with width toggle
sidebarContent = sidebarContent.replace(
    'className="fixed left-0 top-20 transform -translate-y-1/2 h-4/5 max-h-[600px] w-80 bg-white dark:bg-gray-900 shadow-xl z-40 border border-gray-200 dark:border-gray-700 flex flex-col\\n                    rounded-tr-2xl rounded-br-2xl\\n                    rounded-tl-none rounded-bl-none">',
    'className={`relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-xl z-40 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-80" : "w-0 border-r-0"}`}>'
);

// Toggle button behavior change
sidebarContent = sidebarContent.replace(
    'onClick={onToggle}',
    'onClick={(e) => { e.stopPropagation(); onToggle(); }}' // Just in case
);
fs.writeFileSync(sidebarFile, sidebarContent);

// 3. Patch ChatMsg.tsx
const msgFile = path.join(__dirname, 'aina-frontend', 'src', 'components', 'chat', 'ChatMsg.tsx');
let msgContent = fs.readFileSync(msgFile, 'utf8');

// Remove absolute positioning, let flex take over
msgContent = msgContent.replace(
    'className="absolute top-16 sm:top-20 bottom-28 sm:bottom-24 left-0 right-0 mx-auto flex flex-col items-center gap-4 sm:gap-6 w-full max-w-4xl px-3 sm:px-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/30 dark:border-gray-700/30 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent hover:scrollbar-thumb-indigo-400 dark:scrollbar-thumb-indigo-600 dark:hover:scrollbar-thumb-indigo-500">',
    'className="flex-1 mx-auto flex flex-col items-center gap-4 sm:gap-6 w-full max-w-4xl px-3 sm:px-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 shadow-lg border border-gray-200/30 dark:border-gray-700/30 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent hover:scrollbar-thumb-indigo-400 dark:scrollbar-thumb-indigo-600 dark:hover:scrollbar-thumb-indigo-500">'
);
fs.writeFileSync(msgFile, msgContent);

// 4. Patch MessageBubble.tsx
const bubbleFile = path.join(__dirname, 'aina-frontend', 'src', 'components', 'chat', 'MessageBubble.tsx');
let bubbleContent = fs.readFileSync(bubbleFile, 'utf8');

// Apply Glassmorphism Frugal logic
bubbleContent = bubbleContent.replace(
    '<div className="bg-transparent text-gray-900 dark:text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl break-words text-left flex-1 max-w-3xl overflow-x-auto">',
    '<div className={`text-gray-900 dark:text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl break-words text-left flex-1 max-w-3xl overflow-x-auto ${msg.agent === "dev" ? "bg-white/40 dark:bg-gray-800/50 backdrop-blur-lg border border-white/50 dark:border-gray-600 shadow-[0_4px_30px_rgba(0,0,0,0.1)]" : "bg-transparent"}`}>'
);

// If there's missing agent property in the msg, it will fallback to transparent nicely
fs.writeFileSync(bubbleFile, bubbleContent);

console.log("UI updates applied successfully!");
