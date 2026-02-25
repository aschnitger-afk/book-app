#!/bin/bash

echo "🌙 Moonshot API Test"
echo "===================="

KEY="$1"

if [ -z "$KEY" ]; then
    echo "Verwendung: ./test-moonshot.sh DEIN_API_KEY"
    exit 1
fi

echo "Teste Key: ${KEY:0:20}..."

# Test 1: Modelle abrufen
echo -e "\n📋 Verfügbare Modelle:"
curl -s https://api.moonshot.cn/v1/models \
    -H "Authorization: Bearer $KEY" | python3 -m json.tool 2>/dev/null || cat

# Test 2: Einfacher Chat
echo -e "\n💬 Test-Chat:"
curl -s -X POST https://api.moonshot.cn/v1/chat/completions \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "kimi-k2-5",
        "messages": [{"role": "user", "content": "Say hello"}],
        "max_tokens": 20
    }' | python3 -m json.tool 2>/dev/null || cat

echo -e "\n✅ Test abgeschlossen!"
