# Nginx 配置

LDesign Scaffold 提供了自动化的 Nginx 配置生成功能，帮助你快速部署前端应用和 API 服务。

## 自动生成配置

### 启用 Nginx 特性

创建项目时启用 Nginx 支持：

```bash
ldesign-scaffold create my-project --features nginx
```

这将自动生成：
- `nginx/nginx.conf` - 主配置文件
- `nginx/sites-available/` - 站点配置
- `nginx/ssl/` - SSL 证书目录
- `docker-compose.yml` - 包含 Nginx 服务

### 生成配置命令

为现有项目生成 Nginx 配置：

```bash
# 生成基础配置
ldesign-scaffold nginx generate

# 生成 HTTPS 配置
ldesign-scaffold nginx generate --ssl

# 生成负载均衡配置
ldesign-scaffold nginx generate --load-balancer

# 生成反向代理配置
ldesign-scaffold nginx generate --proxy
```

## 前端应用配置

### 单页应用 (SPA)

**nginx/sites-available/spa.conf：**
```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/html;
    index index.html;

    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }

    # HTML 文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self'; object-src 'none'; child-src 'none'; worker-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';" always;

    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 多页应用 (MPA)

**nginx/sites-available/mpa.conf：**
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html index.htm;

    # 启用目录浏览 (可选)
    autoindex off;

    # 静态资源处理
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML 文件处理
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # 特定页面路由
    location /admin {
        try_files $uri $uri/ /admin/index.html;
    }

    location /dashboard {
        try_files $uri $uri/ /dashboard/index.html;
    }
}
```

## HTTPS 配置

### SSL 证书配置

**nginx/sites-available/ssl.conf：**
```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    root /var/www/html;
    index index.html;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA;
    ssl_prefer_server_ciphers on;
    ssl_dhparam /etc/nginx/ssl/dhparam.pem;

    # SSL 会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/nginx/ssl/ca-certs.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # 应用配置
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Let's Encrypt 自动化

**scripts/ssl-setup.sh：**
```bash
#!/bin/bash

DOMAIN="example.com"
EMAIL="admin@example.com"

# 安装 Certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# 设置自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# 重启 Nginx
systemctl reload nginx
```

## 反向代理配置

### API 代理

**nginx/sites-available/api-proxy.conf：**
```nginx
upstream backend {
    server backend1:3000 weight=3;
    server backend2:3000 weight=2;
    server backend3:3000 weight=1 backup;
    
    # 健康检查
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;

    # 请求限制
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # API 代理
    location /api/v1/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # 缓存设置
        proxy_cache_bypass $http_upgrade;
        proxy_cache_key $scheme$proxy_host$request_uri;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
    }

    # WebSocket 支持
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 微服务代理

**nginx/sites-available/microservices.conf：**
```nginx
# 用户服务
upstream user-service {
    server user-service:3001;
}

# 订单服务
upstream order-service {
    server order-service:3002;
}

# 支付服务
upstream payment-service {
    server payment-service:3003;
}

server {
    listen 80;
    server_name gateway.example.com;

    # 用户相关 API
    location /api/users {
        proxy_pass http://user-service;
        include /etc/nginx/proxy_params;
    }

    # 订单相关 API
    location /api/orders {
        proxy_pass http://order-service;
        include /etc/nginx/proxy_params;
    }

    # 支付相关 API
    location /api/payments {
        proxy_pass http://payment-service;
        include /etc/nginx/proxy_params;
    }

    # 静态文件服务
    location /static {
        alias /var/www/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 负载均衡配置

### 轮询负载均衡

**nginx/nginx.conf：**
```nginx
http {
    upstream app_servers {
        server app1:3000;
        server app2:3000;
        server app3:3000;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://app_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

### 加权负载均衡

```nginx
upstream app_servers {
    server app1:3000 weight=3;  # 处理 3/6 的请求
    server app2:3000 weight=2;  # 处理 2/6 的请求
    server app3:3000 weight=1;  # 处理 1/6 的请求
}
```

### IP 哈希负载均衡

```nginx
upstream app_servers {
    ip_hash;  # 基于客户端 IP 的会话保持
    server app1:3000;
    server app2:3000;
    server app3:3000;
}
```

## 性能优化

### 缓存配置

**nginx/conf.d/cache.conf：**
```nginx
# 缓存路径配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g 
                 inactive=60m use_temp_path=off;

server {
    # 缓存配置
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_cache my_cache;
        proxy_cache_valid 200 302 60m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout invalid_header updating
                               http_500 http_502 http_503 http_504;
        proxy_cache_lock on;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

### Gzip 压缩

```nginx
# 启用 gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json
    application/xml
    image/svg+xml;
```

### Brotli 压缩

```nginx
# 启用 Brotli 压缩 (需要安装模块)
brotli on;
brotli_comp_level 6;
brotli_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json;
```

## 安全配置

### 基础安全

**nginx/conf.d/security.conf：**
```nginx
# 隐藏 Nginx 版本
server_tokens off;

# 限制请求大小
client_max_body_size 10M;

# 限制请求速率
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# 安全头
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# 禁止访问隐藏文件
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}

# 禁止访问备份文件
location ~* \.(bak|backup|old|orig|original|tmp)$ {
    deny all;
}
```

### DDoS 防护

```nginx
# 连接限制
limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
limit_conn conn_limit_per_ip 20;

# 请求限制
limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=5r/s;
limit_req zone=req_limit_per_ip burst=10 nodelay;

# 缓冲区限制
client_body_buffer_size 1K;
client_header_buffer_size 1k;
client_max_body_size 1k;
large_client_header_buffers 2 1k;
```

## Docker 集成

### Docker Compose 配置

**docker-compose.yml：**
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/sites-available:/etc/nginx/sites-available
      - ./nginx/ssl:/etc/nginx/ssl
      - ./dist:/var/www/html
    depends_on:
      - app
    restart: unless-stopped

  app:
    build: .
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### 自定义 Nginx 镜像

**nginx/Dockerfile：**
```dockerfile
FROM nginx:alpine

# 安装额外模块
RUN apk add --no-cache nginx-mod-http-brotli

# 复制配置文件
COPY nginx.conf /etc/nginx/nginx.conf
COPY sites-available/ /etc/nginx/sites-available/
COPY ssl/ /etc/nginx/ssl/

# 创建日志目录
RUN mkdir -p /var/log/nginx

# 设置权限
RUN chown -R nginx:nginx /var/log/nginx

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

## 监控和日志

### 访问日志格式

```nginx
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';

log_format json escape=json '{'
    '"time_local":"$time_local",'
    '"remote_addr":"$remote_addr",'
    '"remote_user":"$remote_user",'
    '"request":"$request",'
    '"status": "$status",'
    '"body_bytes_sent":"$body_bytes_sent",'
    '"request_time":"$request_time",'
    '"http_referrer":"$http_referer",'
    '"http_user_agent":"$http_user_agent"'
'}';

access_log /var/log/nginx/access.log json;
```

### 状态监控

```nginx
# 启用状态页面
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

## 故障排除

### 常见问题

1. **配置语法错误**
   ```bash
   # 测试配置文件
   nginx -t
   
   # 重新加载配置
   nginx -s reload
   ```

2. **权限问题**
   ```bash
   # 检查文件权限
   ls -la /var/www/html
   
   # 修复权限
   chown -R nginx:nginx /var/www/html
   ```

3. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :80
   
   # 停止冲突服务
   systemctl stop apache2
   ```

### 调试技巧

```bash
# 查看错误日志
tail -f /var/log/nginx/error.log

# 查看访问日志
tail -f /var/log/nginx/access.log

# 测试上游服务器
curl -H "Host: example.com" http://localhost/api/health
```

## 下一步

- [字体管理](/guide/font-management) - 字体优化工具
- [图标管理](/guide/icon-management) - 图标字体管理
- [API 参考](/api/) - 查看完整的 API 文档
