#!/usr/bin/env bash
# Pocket-Claude agent installer.
# Usage: curl -sSL <master>/connect.sh | bash -s -- --master wss://<host>/ws/agent --token <TOKEN> --name <NAME>
set -euo pipefail

MASTER=""
TOKEN=""
NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --master) MASTER="$2"; shift 2 ;;
    --token)  TOKEN="$2"; shift 2 ;;
    --name)   NAME="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$MASTER" || -z "$TOKEN" || -z "$NAME" ]]; then
  echo "Usage: curl ... | bash -s -- --master wss://host/ws/agent --token X --name home-mac"
  exit 1
fi

DIR="$HOME/.pocket-claude"
mkdir -p "$DIR"
chmod 700 "$DIR"

# Check node
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required. Install Node 20+ first."
  exit 1
fi
MAJOR=$(node -p "process.versions.node.split('.')[0]")
if (( MAJOR < 20 )); then
  echo "ERROR: Node 20+ required (you have $(node -v))"
  exit 1
fi

# Derive HTTP URL from WSS for bundle download
BASE_URL=$(echo "$MASTER" | sed 's|^ws://|http://|; s|^wss://|https://|; s|/ws/agent$||')
BUNDLE_URL="$BASE_URL/agent.js"
RFS_MCP_URL="$BASE_URL/rfs-mcp.js"

echo ">> Downloading agent from $BUNDLE_URL"
curl -sSL "$BUNDLE_URL" -o "$DIR/agent.js"

echo ">> Downloading rfs-mcp server (for remote filesystem proxy mode)"
curl -sSL "$RFS_MCP_URL" -o "$DIR/rfs-mcp.js" || echo "   (rfs-mcp.js not available on this master — proxy-mode disabled)"

cat > "$DIR/config.json" <<EOF
{
  "master_url": "$MASTER",
  "token": "$TOKEN",
  "name": "$NAME",
  "installed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
chmod 600 "$DIR/config.json"

# ================================================================
# Опционально: node-pty для полноценного PTY-терминала (vim/htop).
# Без него агент работает, просто PTY-режим в UI покажет инструкцию.
# ================================================================
OS=$(uname -s)
install_node_pty() {
  if node -e "require('node-pty')" 2>/dev/null; then
    echo "   node-pty уже установлен — ok"
    return 0
  fi
  echo ">> Пробую установить node-pty (для vim/htop/интерактивных команд)..."
  # Ставим build-tools для компиляции native addon
  if [[ "$OS" == "Linux" ]]; then
    if command -v apt-get >/dev/null 2>&1 && [[ $EUID -eq 0 ]]; then
      apt-get install -y build-essential python3 >/dev/null 2>&1 || true
    elif command -v yum >/dev/null 2>&1 && [[ $EUID -eq 0 ]]; then
      yum groupinstall -y 'Development Tools' >/dev/null 2>&1 || true
      yum install -y python3 >/dev/null 2>&1 || true
    fi
  fi
  if [[ $EUID -eq 0 ]] || [[ "$OS" == "Darwin" ]]; then
    if npm install -g node-pty >/dev/null 2>&1; then
      echo "   ✓ node-pty установлен глобально"
    else
      echo "   ⚠ node-pty не установлен — PTY в UI покажет инструкцию"
      echo "     руками: sudo npm install -g node-pty"
    fi
  else
    echo "   ⚠ не root — не могу поставить node-pty глобально"
    echo "     руками: sudo npm install -g node-pty"
  fi
}
install_node_pty

# Install service
if [[ "$OS" == "Linux" ]]; then
  # Под root ставим system-unit с лимитами и auto-restart.
  if [[ $EUID -eq 0 ]]; then
    UNIT="/etc/systemd/system/pocket-claude-agent.service"
    cat > "$UNIT" <<EOF
[Unit]
Description=Pocket Claude Agent (node-pty + WebSocket)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=$DIR
Environment=NODE_PATH=/usr/local/lib/node_modules:/usr/lib/node_modules
ExecStart=$(which node) $DIR/agent.js
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal
MemoryMax=512M
TasksMax=200

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable --now pocket-claude-agent
    echo "✓ systemd system service: pocket-claude-agent"
    echo "  logs: journalctl -u pocket-claude-agent -f"
  else
    # Non-root — user-scope (работает пока юзер залогинен или linger включён)
    UNIT="$HOME/.config/systemd/user/pocket-claude-agent.service"
    mkdir -p "$(dirname "$UNIT")"
    cat > "$UNIT" <<EOF
[Unit]
Description=Pocket Claude Agent
After=network-online.target

[Service]
ExecStart=$(which node) $DIR/agent.js
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
EOF
    systemctl --user daemon-reload
    systemctl --user enable --now pocket-claude-agent
    echo "✓ systemd user service: pocket-claude-agent"
    echo "  logs: journalctl --user -u pocket-claude-agent -f"
    echo "  (для auto-start при reboot без логина: sudo loginctl enable-linger $USER)"
  fi
elif [[ "$OS" == "Darwin" ]]; then
  PLIST="$HOME/Library/LaunchAgents/dev.pocket-claude.agent.plist"
  NODE=$(which node)
  cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>dev.pocket-claude.agent</string>
  <key>ProgramArguments</key><array>
    <string>$NODE</string><string>$DIR/agent.js</string>
  </array>
  <key>KeepAlive</key><true/>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$DIR/agent.log</string>
  <key>StandardErrorPath</key><string>$DIR/agent.log</string>
</dict></plist>
EOF
  launchctl unload "$PLIST" 2>/dev/null || true
  launchctl load "$PLIST"
  echo "✓ launchd service: dev.pocket-claude.agent"
  echo "  logs: tail -f $DIR/agent.log"
else
  echo "⚠ Unknown OS ($OS). Start manually:"
  echo "  node $DIR/agent.js"
fi

# Uninstaller
cat > "$DIR/uninstall.sh" <<EOF
#!/usr/bin/env bash
set -e
OS=\$(uname -s)
if [[ "\$OS" == "Linux" ]]; then
  if [[ \$EUID -eq 0 ]] && [[ -f /etc/systemd/system/pocket-claude-agent.service ]]; then
    systemctl disable --now pocket-claude-agent 2>/dev/null || true
    rm -f /etc/systemd/system/pocket-claude-agent.service
    systemctl daemon-reload
  else
    systemctl --user disable --now pocket-claude-agent 2>/dev/null || true
    rm -f "$HOME/.config/systemd/user/pocket-claude-agent.service"
    systemctl --user daemon-reload 2>/dev/null || true
  fi
elif [[ "\$OS" == "Darwin" ]]; then
  launchctl unload "$HOME/Library/LaunchAgents/dev.pocket-claude.agent.plist" 2>/dev/null || true
  rm -f "$HOME/Library/LaunchAgents/dev.pocket-claude.agent.plist"
fi
rm -rf "$DIR"
echo "Pocket Claude agent uninstalled."
EOF
chmod +x "$DIR/uninstall.sh"

echo ""
echo "Done! Device '$NAME' is now connecting to $MASTER"
echo "Uninstall: $DIR/uninstall.sh"
