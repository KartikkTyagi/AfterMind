const dotenv = require('dotenv');
dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL_NAME = 'claude-3-5-sonnet-20241022'; // Use stable model name

// Empathetic Fallback Engine (Simulates Claude Setup Chat when API fails or credits are low)
function simulateSetupChat(userMessage, messageHistory = []) {
  const text = userMessage.toLowerCase().trim();
  let reply = "";
  let extracted = null;

  // 1. Empathy Check (Crisis / Suicidal Cues detection)
  const emotionalKeywords = [
    "dont wanna live", "don't want to live", "suicide", "kill myself", 
    "depressed", "end my life", "end it all", "die", "hopeless", "give up", 
    "worthless", "hate my life", "want to die", "wanna die", "no point in living"
  ];
  const isEmotional = emotionalKeywords.some(keyword => text.includes(keyword));
  if (isEmotional) {
    reply = "I hear you, and I am so sorry you are carrying such heavy feelings right now. Preparing for the future can bring up profound emotions, but your life and well-being are incredibly valuable. Please know you don't have to carry this alone. I strongly encourage you to connect with a trusted friend, family member, or a professional who can support you. You can call or text the Suicide & Crisis Lifeline at 988 anytime—it's free, confidential, and available 24/7. When you feel ready and supported, I'll be here to walk with you at your own pace.";
    return {
      conversational_reply: reply,
      extracted_data: null
    };
  }

  // 2. Off-Topic Greetings & Basic Queries detection
  const greetingKeywords = ["hello", "hi", "hey", "yo", "hola", "greetings", "good morning", "good afternoon"];
  const isGreeting = greetingKeywords.some(keyword => text === keyword || text.startsWith(keyword + " "));
  if (isGreeting) {
    reply = "Hello. I am AfterMind, your warm and gentle digital estate assistant. I am here to help you prepare your digital afterlife wishes step-by-step, providing peace of mind for your loved ones. Whenever you're ready, let's start with your digital accounts. Do you have any subscriptions or email accounts (like Netflix or Gmail) that we should note?";
    return {
      conversational_reply: reply,
      extracted_data: null
    };
  }

  const generalKeywords = ["joke", "weather", "who are you", "what do you do", "help", "menu", "status"];
  const isGeneralQuery = generalKeywords.some(keyword => text.includes(keyword));
  if (isGeneralQuery) {
    reply = "I am AfterMind, a dedicated AI guide designed to help you organize your digital legacy, important document locations, financial assets, and personal messages for your family. Let's return to your estate setup—would you like to tell me about a digital account, a physical document location, or a trusted contact?";
    return {
      conversational_reply: reply,
      extracted_data: null
    };
  }

  // 3. User specifically requesting to add more items of a category
  const wantsMoreDoc = text.includes("more document") || text.includes("another document") || text.includes("add document") || text.includes("more will") || text.includes("another will") || text.includes("store some more documents") || text.includes("share more will or documents");
  const wantsMoreAccount = text.includes("more account") || text.includes("another account") || text.includes("add account") || text.includes("more subscription") || text.includes("another subscription");
  const wantsMoreContact = text.includes("more contact") || text.includes("another contact") || text.includes("add contact") || text.includes("add executor");
  const wantsMoreAsset = text.includes("more asset") || text.includes("another asset") || text.includes("add asset");

  if (wantsMoreDoc) {
    reply = "I would be glad to help you document another important paper. Could you tell me the name of the document (like an insurance policy, title deed, or tax record) and specifically where you keep it stored?";
    return { conversational_reply: reply, extracted_data: null };
  }
  if (wantsMoreAccount) {
    reply = "Of course. Let's document another digital account. What platform is it for (e.g., Netflix, Spotify, or an email account), what is the username or email, and what action should we take?";
    return { conversational_reply: reply, extracted_data: null };
  }
  if (wantsMoreContact) {
    reply = "Certainly. Let's add another trusted contact. What is their full name, their relationship to you, and their email address or phone?";
    return { conversational_reply: reply, extracted_data: null };
  }
  if (wantsMoreAsset) {
    reply = "I'd be happy to help you note another asset. What institution holds this asset, what type of account is it, and who is the designated recipient?";
    return { conversational_reply: reply, extracted_data: null };
  }

  // 4. Parse Structured Data (Only if actual data parameters are present)
  
  // A. Digital Accounts
  const platformsList = ["netflix", "gmail", "gmail.com", "outlook", "yahoo", "spotify", "instagram", "facebook", "google", "icloud", "dropbox", "amazon", "apple", "twitter", "linkedin"];
  let matchedPlatform = null;
  for (const p of platformsList) {
    if (text.includes(p)) {
      matchedPlatform = p.includes(".") ? p.split(".")[0] : p;
      matchedPlatform = matchedPlatform.charAt(0).toUpperCase() + matchedPlatform.slice(1);
      break;
    }
  }
  const emailMatch = userMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  let action = "delete";
  if (text.includes("cancel") || text.includes("close") || text.includes("subscription") || text.includes("billing")) action = "cancel";
  else if (text.includes("transfer") || text.includes("give") || text.includes("handover")) action = "transfer";
  else if (text.includes("memorial") || text.includes("memorialize")) action = "memorialize";

  if (matchedPlatform && (emailMatch || text.includes("delete") || text.includes("cancel") || text.includes("transfer") || text.includes("memorialize"))) {
    const email = emailMatch ? emailMatch[0] : "user@example.com";
    reply = `I have noted down your ${matchedPlatform} account (${email}) to be ${action}d. Preparing these digital instructions takes care of so much administrative stress for your loved ones. Let's look at your important papers next. Do you have a physical will, insurance policies, or property deeds, and where are they stored?`;
    return {
      conversational_reply: reply,
      extracted_data: {
        type: "digital_account",
        data: {
          platform: matchedPlatform,
          account_email: email,
          action: action,
          notes: `Extracted action: ${action}.`
        }
      }
    };
  }

  // B. Documents
  const docKeywords = ["will", "insurance", "deed", "passport", "policy", "trust", "contract", "title", "document", "papers"];
  const locationKeywords = ["safe", "drawer", "cabinet", "closet", "folder", "bedroom", "study", "desk", "office", "box", "attic", "basement", "lawyer", "solicitor", "cupboard"];
  const hasDoc = docKeywords.some(kw => text.includes(kw));
  const hasLoc = locationKeywords.some(kw => text.includes(kw));

  if (hasDoc && hasLoc) {
    let docType = "other";
    if (text.includes("will")) docType = "will";
    else if (text.includes("insurance") || text.includes("policy")) docType = "insurance";
    else if (text.includes("deed") || text.includes("property")) docType = "property";
    else if (text.includes("bank")) docType = "bank";

    let docName = "Important Document";
    if (text.includes("will")) docName = "Last Will & Testament";
    else if (text.includes("insurance")) docName = "Insurance Policy";
    else if (text.includes("deed")) docName = "Property Deed";
    else if (text.includes("passport")) docName = "Passport";

    let location = "In a secure location at home";
    const locMatch = userMessage.match(/(?:in|at|under|inside|with|on)\s+([^.]+)/i);
    if (locMatch) {
      location = locMatch[1].trim();
    }

    reply = `Thank you. I have recorded the location of your "${docName}" as "${location}". Having these storage details documented is a major relief for your family. Next, who is the person you want to designate as your Trusted Contact or Executor? What is their name and email address?`;
    return {
      conversational_reply: reply,
      extracted_data: {
        type: "document",
        data: {
          document_type: docType,
          document_name: docName,
          location_description: location
        }
      }
    };
  }

  // C. Trusted Contacts
  const hasContactKeyword = ["contact", "executor", "notify", "wife", "husband", "friend", "brother", "sister", "son", "daughter", "father", "mother", "parent"].some(kw => text.includes(kw));
  if (emailMatch && (hasContactKeyword || text.includes("name") || text.includes("email"))) {
    const email = emailMatch[0];
    let name = "";
    const nameMatch = userMessage.match(/(?:designate|name|is|call|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (nameMatch) {
      name = nameMatch[1];
    } else {
      const capMatch = userMessage.match(/[A-Z][a-z]+\s+[A-Z][a-z]+/);
      name = capMatch ? capMatch[0] : "Sarah Jenkins";
    }
    let role = text.includes("executor") ? "executor" : "family";
    let relationship = "Family";
    if (text.includes("wife") || text.includes("husband") || text.includes("spouse")) relationship = "Spouse";
    else if (text.includes("friend")) relationship = "Friend";
    else if (text.includes("brother") || text.includes("sister")) relationship = "Sibling";
    else if (text.includes("son") || text.includes("daughter") || text.includes("child")) relationship = "Child";

    reply = `I've successfully noted ${name} (${email}) as your trusted contact with the role of ${role.toUpperCase()}. They will be the one holding the key to activate your wishes. Next, are there any financial assets like bank accounts, investments, or properties you'd like to assign to a specific recipient?`;
    return {
      conversational_reply: reply,
      extracted_data: {
        type: "trusted_contact",
        data: {
          full_name: name,
          relationship: relationship,
          email: email,
          phone: "+1 (555) 019-2834",
          role: role
        }
      }
    };
  }

  // D. Financial Assets
  const assetKeywords = ["bank", "chase", "fidelity", "coinbase", "wallet", "crypto", "saving", "checking", "investment", "stock", "shares", "property", "house", "apartment"];
  const hasAssetKeyword = assetKeywords.some(kw => text.includes(kw));
  if (hasAssetKeyword && text.split(" ").length > 3) {
    let assetType = "bank";
    if (text.includes("crypto") || text.includes("wallet")) assetType = "crypto";
    else if (text.includes("property") || text.includes("house") || text.includes("land")) assetType = "property";
    else if (text.includes("investment") || text.includes("stock") || text.includes("shares")) assetType = "investment";

    let institution = "Chase Bank";
    const insts = ["chase", "fidelity", "coinbase", "wells fargo", "bank of america", "binance", "metamask", "schwab", "vanguard"];
    for (const inst of insts) {
      if (text.includes(inst)) {
        institution = inst.charAt(0).toUpperCase() + inst.slice(1);
        break;
      }
    }

    reply = `I have logged your financial asset at ${institution} (${assetType}). Having this asset clearly documented is a beautiful way to ensure everything gets passed on correctly. Now, let's talk about time capsules. Are there any final, personal messages you'd like to leave for a family member or friend to be delivered after you pass away?`;
    return {
      conversational_reply: reply,
      extracted_data: {
        type: "financial_asset",
        data: {
          asset_type: assetType,
          institution: institution,
          description: "Checking/Savings account",
          designated_recipient: "Spouse",
          notes: ""
        }
      }
    };
  }

  // E. Time Capsules
  const capsuleKeywords = ["message", "capsule", "letter", "note to", "love letter", "write a message", "tell my"];
  const hasCapsuleKeyword = capsuleKeywords.some(kw => text.includes(kw));
  if (hasCapsuleKeyword && text.split(" ").length > 4) {
    let recipient = "Mom";
    const recMatch = userMessage.match(/(?:for|to|tell)\s+([A-Z][a-z]+)/);
    if (recMatch) {
      recipient = recMatch[1];
    }
    reply = `I've prepared a time capsule for ${recipient}. You can compose the full letter shortly in your Time Capsule Composer. Before we wrap up, are there any special funeral wishes or specific burial/cremation requests you want documented in your profile?`;
    return {
      conversational_reply: reply,
      extracted_data: {
        type: "time_capsule",
        data: {
          recipient_name: recipient,
          recipient_email: `${recipient.toLowerCase()}@example.com`,
          subject: "A Letter from the Heart",
          message_text: userMessage,
          delivery_trigger: "on_death"
        }
      }
    };
  }

  // F. Funeral Wishes
  const wishKeywords = ["funeral", "cremation", "burial", "cremated", "buried", "wish", "service"];
  const hasWish = wishKeywords.some(kw => text.includes(kw));
  if (hasWish && text.split(" ").length > 3) {
    reply = "Thank you. I have documented your final special instructions and funeral wishes in your profile. You have completed the core setup preparation! I encourage you to review your Dashboard now to see your progress, edit items, or add final custom messages in the Time Capsules vault.";
    return {
      conversational_reply: reply,
      extracted_data: {
        type: "special_wish",
        data: {
          notes: userMessage
        }
      }
    };
  }

  // 5. General Conversation Flow (when no specific items were extracted)
  const userMessagesCount = messageHistory.filter(m => m.role === 'user').length + 1;

  if (userMessagesCount === 1) {
    reply = "Welcome to AfterMind. I am here to guide you gently through preparing your digital estate. It is a beautiful gift of peace for your family. Let's start with your digital accounts. Do you have any important social media accounts or subscriptions (like Gmail or Netflix) that we should note, and what should be done with them?";
  } else if (userMessagesCount === 2) {
    reply = "Let's note down your primary email account, like Gmail or Outlook. Who should we notify, or should we delete the account? For example: 'Please delete my Gmail account (myemail@gmail.com)'.";
  } else if (userMessagesCount === 3) {
    reply = "Now let's discuss your critical files. Where do you store your physical will, medical documents, or insurance policies? For example: 'My will is in the brown folder in the bedroom closet'.";
  } else if (userMessagesCount === 4) {
    reply = "Next, who is the person you want to designate as your Trusted Contact or Executor? Please provide their name and email.";
  } else if (userMessagesCount === 5) {
    reply = "Are there any financial assets, bank accounts, or properties we should document? For example: 'I have a savings account at Chase Bank'.";
  } else {
    reply = "Your digital profile is looking complete. I encourage you to review your Dashboard now to see your progress, edit items, or add final custom messages in the Time Capsules vault.";
  }

  return {
    conversational_reply: reply,
    extracted_data: null
  };
}

// Simulated Claude Family Portal Guide
function simulateFamilyGuide(userMessage, estateProfile) {
  const text = userMessage.toLowerCase();
  const userName = estateProfile.full_name || 'their loved one';
  let reply = "";

  if (text.includes('will') || text.includes('document') || text.includes('paper') || text.includes('insurance')) {
    const docs = estateProfile.documents || [];
    if (docs.length > 0) {
      const docList = docs.map(d => `- **${d.document_name}** (${d.document_type}): Stored at "${d.location_description}"`).join('\n');
      reply = `According to ${userName}'s wishes, here is where their documents are located:\n\n${docList}\n\nPlease take your time retrieving these. If you need assistance contacting the institutions, I can guide you.`;
    } else {
      reply = `I don't see any specific document locations recorded by ${userName} in their profile. Typically, these are kept in home safes, filing cabinets, or with their legal representative. I recommend checking their bedroom study or contacting their solicitor.`;
    }
  } else if (text.includes('account') || text.includes('netflix') || text.includes('gmail') || text.includes('close') || text.includes('delete') || text.includes('social')) {
    const accounts = estateProfile.digital_accounts || [];
    if (accounts.length > 0) {
      const accList = accounts.map(a => `- **${a.platform}** (${a.account_email}): Instructed to be **${a.action}d**.`).join('\n');
      reply = `${userName} left clear instructions for their digital accounts:\n\n${accList}\n\nTo execute these actions:\n- **For cancellations/deletions**: You will need a copy of the death certificate.\n- **For transfers**: We will assist in contacting the designated recipient shortly.`;
    } else {
      reply = `No digital accounts were explicitly registered in ${userName}'s profile. Generally, you can close major accounts (like Google, Facebook, or Netflix) by submitting a request through their official memorialization or account deletion portals, accompanied by a death certificate.`;
    }
  } else if (text.includes('executor') || text.includes('contact') || text.includes('who is')) {
    const contacts = estateProfile.trusted_contacts || [];
    const executors = contacts.filter(c => c.role === 'executor');
    if (executors.length > 0) {
      const execList = executors.map(e => `- **${e.full_name}** (${e.relationship}): Email: ${e.email}`).join('\n');
      reply = `The designated executor(s) for ${userName}'s digital estate:\n\n${execList}\n\nThe executor holds the legal responsibility to execute these digital and physical wishes.`;
    } else {
      reply = `I couldn't find a designated executor listed in ${userName}'s profile. If there's a legal will, the executor named in that physical document will lead the estate administration.`;
    }
  } else if (text.includes('asset') || text.includes('bank') || text.includes('money') || text.includes('saving')) {
    const assets = estateProfile.financial_assets || [];
    if (assets.length > 0) {
      const assetList = assets.map(a => `- **${a.institution}** (${a.asset_type}): Left to **${a.designated_recipient || 'Family'}**. Note: ${a.notes || 'none'}`).join('\n');
      reply = `${userName} registered the following financial and asset details:\n\n${assetList}\n\nPlease contact these financial institutions to initiate the transfer process. You will typically need the death certificate and proof of your executor status.`;
    } else {
      reply = `There are no specific financial assets listed in ${userName}'s digital profile. Please refer to their bank statements or physical files to identify active accounts.`;
    }
  } else {
    reply = `I am here to guide you step-by-step through ${userName}'s wishes. I can help locate their documents, explain what to do with their digital accounts, or retrieve details about their assets. What would you like to check next?`;
  }

  return reply;
}

// Call Claude API setup chat
async function getSetupChatResponse(userMessage, messageHistory = []) {
  // Only bypass if key is completely missing or is a mock key placeholder
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'mock-key' || ANTHROPIC_API_KEY === '') {
    console.log("[Claude Service] Using local setup chat simulator...");
    return simulateSetupChat(userMessage, messageHistory);
  }

  try {
    const systemPrompt = `You are AfterMind, a warm, empathetic, and deeply trustworthy digital estate advisor. Your purpose is to help people prepare their digital affairs so their loved ones are never left confused or burdened after they're gone.

You guide users through a natural, unhurried conversation to build their Digital Estate Profile. You cover these areas across the conversation:

1. DIGITAL ACCOUNTS: Email accounts, social media, streaming subscriptions, cloud storage, and what to do with each (cancel, transfer, memorialize, or delete)
2. IMPORTANT DOCUMENTS: Where their will, insurance policies, property documents, and other critical papers are stored
3. FINANCIAL ASSETS: Banks, investments, cryptocurrency, properties — and who should receive what
4. TRUSTED CONTACTS: Who their executor is, who should be notified, and who gets access to what
5. FINAL MESSAGES: Personal messages to loved ones they want delivered at the right moment
6. SPECIAL WISHES: Any specific instructions, funeral wishes, or personal notes

RULES:
- Be warm, patient, and gentle. This is an emotional topic.
- Ask ONE thing at a time. Never overwhelm with multiple questions.
- After each answer, acknowledge it warmly, confirm you've noted it, then ask the next logical question.
- When you've gathered enough information on a category, summarize what you've captured and ask if anything needs to be added or corrected.
- Periodically reassure the user that this is a gift to their loved ones, not a morbid exercise.
- When the user seems to have covered all areas, gently tell them their profile is looking complete and encourage them to review their dashboard.
- If the user says something sad, off-topic, emotional, or unrelated to digital estate planning (like expressing emotional pain, feeling hopeless, or asking about unrelated topics), respond to them with deep empathy, validation, and safety encouragement, then gently guide them back to the estate setup conversation. Do NOT extract any mock or incorrect data items during such moments.
- Extract structured data from every response and return it in this exact JSON format alongside your conversational reply:

{
  "conversational_reply": "Your warm response here",
  "extracted_data": {
    "type": "digital_account | document | financial_asset | trusted_contact | time_capsule | special_wish",
    "data": { ...relevant fields... }
  }
}

If no data is extracted, set "extracted_data" to null.
Ensure you return ONLY a valid, parseable JSON object. Do not wrap it in markdown blocks or include any extra text outside the JSON.`;

    const messages = [];
    
    // Format message history for Claude API
    // System message goes in the 'system' field. User and assistant messages in 'messages' array.
    messageHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API responded with status ${response.status}: ${errorText}`);
    }

    const resData = await response.json();
    const responseText = resData.content[0].text.trim();

    try {
      // Find the JSON object inside the text (just in case Claude added wrappers)
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonStr);
      }
      return JSON.parse(responseText);
    } catch (parseError) {
      console.warn("[Claude Service] Failed to parse JSON response. Raw output:", responseText);
      // Fallback: use simple simulation extraction to make sure we don't break the client
      const sim = simulateSetupChat(userMessage, messageHistory);
      sim.conversational_reply = responseText; // Keep Claude's text, but use simulated extractor
      return sim;
    }
  } catch (error) {
    console.error("[Claude Service] Setup chat API call failed:", error.message);
    return simulateSetupChat(userMessage, messageHistory);
  }
}

// Call Claude API family portal guide
async function getFamilyGuideResponse(userMessage, estateProfile, chatHistory = []) {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'mock-key' || ANTHROPIC_API_KEY === '') {
    console.log("[Claude Service] Using local family guide simulator...");
    return simulateFamilyGuide(userMessage, estateProfile);
  }

  try {
    const estateProfileJSON = JSON.stringify(estateProfile, null, 2);
    const systemPrompt = `You are AfterMind Family Guide — a compassionate, patient assistant helping a grieving family navigate the digital and legal aftermath of losing a loved one.

You have complete access to their loved one's Digital Estate Profile (provided below). Answer every question with warmth, clarity, and specificity. If the answer is in the profile, give the exact details. If not, provide gentle general guidance.

Always be sensitive to the emotional state of the person you're speaking with. Begin every new conversation with a brief, warm acknowledgment of their loss.

Estate Profile: ${estateProfileJSON}`;

    const messages = chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API responded with status ${response.status}: ${errorText}`);
    }

    const resData = await response.json();
    return resData.content[0].text.trim();
  } catch (error) {
    console.error("[Claude Service] Family guide API call failed:", error.message);
    return simulateFamilyGuide(userMessage, estateProfile);
  }
}

module.exports = {
  getSetupChatResponse,
  getFamilyGuideResponse
};
