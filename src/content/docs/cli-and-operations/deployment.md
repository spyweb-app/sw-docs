---
title: Deployment
description: From fresh Linux VPS to production SpyWeb monitoring.
sidebar:
  order: 2
---

## 1. Installation

```bash
curl -L -o spyweb.tar.gz https://dl.spyweb.app/linux && tar -xf spyweb.tar.gz && rm spyweb.tar.gz
cd spyweb && rm spyweb-tray
# Set executable permissions
chmod +x spyweb
```

The tarball is pre-bundled with `ui/` (dashboard) and `jobs/starter-kit/`.

## 2. Running as a systemd Service

```bash
sudo hx /etc/systemd/system/spyweb.service
```

```ini
[Unit]
Description=SpyWeb Scraper Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/spyweb
ExecStart=/root/spyweb/spyweb start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

For better security, create a dedicated `spyweb` user:

```bash
sudo useradd -r -s /bin/false spyweb
sudo chown -R spyweb:spyweb /root/spyweb
```

Then change `User=root` to `User=spyweb` in the service file.

Port override example:

```ini
ExecStart=/root/spyweb/spyweb start --port 8080
Environment=SPYWEB_PORT=8080
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable spyweb
sudo systemctl start spyweb
sudo systemctl status spyweb
```

View logs:

```bash
sudo journalctl -u spyweb -f
```

## 3. Remote Editor Setup (Optional)

### Helix Editor

> **Don't get stuck!** Helix is modal: `i` for Insert mode, `Esc` to return to Normal mode. `:w` saves, `:q` quits, `:q!` force-quits. Remember: w = write, q = quit.

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install helix

# Arch Linux
sudo pacman -S helix

# Fedora
sudo dnf install helix
```

### lua-language-server

```bash
# Ubuntu/Debian
sudo apt install lua-language-server

# Arch Linux
sudo pacman -S lua-language-server

# Fedora
sudo dnf install lua-language-server
```

### Taplo (TOML LSP)

```bash
wget https://github.com/tamasfe/taplo/releases/latest/download/taplo-full-linux-x86_64.gz
gunzip taplo-full-linux-x86_64.gz
chmod +x taplo-full-linux-x86_64
sudo mv taplo-full-linux-x86_64 /usr/local/bin/taplo
```

**Why use this setup?** LSP gives you immediate syntax validation and autocompletion for Lua and TOML files, catching errors before you run SpyWeb.

## 4. Accessing the UI Securely

### Option 1: SSH Tunnel (Zero Public Exposure)

The safest method — traffic goes through SSH, the port stays closed to the internet.

```bash
ssh -L 7979:localhost:7979 user@your-vps-ip
```

Then open `http://localhost:7979` in your local browser.

### Option 2: Nginx Reverse Proxy + Basic Auth

Use this for a custom domain and shared access. Adds a password prompt before anyone can see the dashboard.

```bash
sudo apt install nginx apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd yourusername
```

Nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        auth_basic "SpyWeb Admin";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://127.0.0.1:7979;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 3: UFW Whitelist (Your IP Only)

If you have a static IP, this blocks the entire world while letting you through seamlessly.

```bash
sudo ufw allow from YOUR_HOME_IP to any port 7979
```
