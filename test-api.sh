#!/bin/bash

echo "🔍 Teste Moonshot API Key..."

# Lade den Key aus .env
export $(grep -v '^#' .env | xargs)

if [ -z "$MOONSHOT_API_KEY" ] || [ "$MOONSHOT_API_KEY" = "sk-dein-echter-api-key-hier" ]; then
    echo "❌ Kein gültiger API Key gefunden!"
    echo "Bitte füge deinen Key in die .env Datei ein."
    exit 1
fi

echo "Key gefunden: ${MOONSHOT_API_KEY:0:15}..."

# Teste die API
response=$(curl -s https://api.moonshot.cn/v1/models \
    -H "Authorization: Bearer $MOONSHOT_API_KEY")

if echo "$response" | grep -q "data"; then
    echo "✅ API Key funktioniert!"
    echo "Verfügbare Modelle:"
    echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4
else
    echo "❌ API Key ungültig!"
    echo "Fehler: $response"
fi
