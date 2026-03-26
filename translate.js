import fs from "fs";
import fetch from "node-fetch"; // v2

// ---------------- CONFIG ----------------
const sourceLang = "en";       // source language
const targetLang = "ml";      // Tulu
const inputFile = "./en.json";
const outputFile = "./malayalam.json";

// ---------------- FUNCTION ----------------
async function translateText(text) {
  try {
    const res = await fetch("http://localhost:5000/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text"
      })
    });

    // make sure JSON is valid
    const data = await res.json();

    // return translatedText if exists, else fallback
    if (data && data.translatedText) {
      return data.translatedText;
    } else {
      console.warn("Warning: API returned unexpected response:", data);
      return text;
    }

  } catch (err) {
    console.error("Translation API error:", err);
    return text; // fallback to original text
  }
}

// ---------------- MAIN ----------------
async function main() {
  if (!fs.existsSync(inputFile)) {
    console.error("Source file not found:", inputFile);
    return;
  }

  const enJson = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
  const newLangJson = {};

  for (const key in enJson) {
    const value = enJson[key];
    console.log(`Translating key: "${key}" -> "${value}"`);
    const translated = await translateText(value);
    newLangJson[key] = translated;
    console.log(`Translated: "${translated}"\n`);
  }

  fs.writeFileSync(outputFile, JSON.stringify(newLangJson, null, 2), "utf-8");
  console.log(`✅ Tulu translations saved to ${outputFile}`);
}

// Run the script
main();
