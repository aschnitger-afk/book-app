#!/bin/bash

echo "🚀 Groq API Test"
echo "================"

KEY="$1"

if [ -z "$KEY" ]; then
    echo "Verwendung: ./test-groq.sh DEIN_GROQ_API_KEY"
    echo ""
    echo "HOL DIR EINEN KOSTENLOSEN KEY:"
    echo "1. Gehe zu https://console.groq.com/"
    echo "2. Melde dich mit Google/GitHub an"
    echo "3. Erstelle einen API Key"
    exit 1
fi

echo "Teste Key: ${KEY:0:20}..."

# Test 1: Modelle abrufen
echo -e "\n📋 Verfügbare Modelle:"
response=$(curl -s https://api.groq.com/openai/v1/models \
    -H "Authorization: Bearer $KEY")

echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  - {m['id']}\") for m in d.get('data',[])]" 2>/dev/null || echo "$response"

# Test 2: Einfacher Chat
echo -e "\n💬 Test-Chat (Llama 3.3):"
curl -s -X POST https://api.groq.com/openai/v1/chat/completions \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Say hello in German"}],
        "max_tokens": 50
    }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('Antwort:', d['choices'][0]['message']['content'] if 'choices' in d else d)" 2>/dev/null

echo -e "\n✅ Test abgeschlossen!"
