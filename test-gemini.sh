#!/bin/bash

echo "🔷 Google Gemini API Test"
echo "========================="

KEY="$1"

if [ -z "$KEY" ]; then
    echo "Verwendung: ./test-gemini.sh DEIN_GEMINI_API_KEY"
    echo ""
    echo "HOL DIR EINEN KOSTENLOSEN KEY:"
    echo "1. Gehe zu https://ai.google.dev/"
    echo "2. Melde dich mit Google an"
    echo "3. Klicke auf 'Get API Key'"
    exit 1
fi

echo "Teste Key: ${KEY:0:20}..."

# Test 1: Modelle abrufen
echo -e "\n📋 Verfügbare Modelle:"
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$KEY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {m['name']}\") for m in d.get('models',[]) if 'gemini' in m['name']]" 2>/dev/null || echo "Fehler beim Abrufen"

# Test 2: Einfacher Chat
echo -e "\n💬 Test-Chat (Gemini 1.5 Flash):"
curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "contents": [{"role": "user", "parts": [{"text": "Say hello in German"}]}]
    }' | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'candidates' in d:
    print('Antwort:', d['candidates'][0]['content']['parts'][0]['text'])
else:
    print('Fehler:', d)
" 2>/dev/null

echo -e "\n✅ Test abgeschlossen!"
