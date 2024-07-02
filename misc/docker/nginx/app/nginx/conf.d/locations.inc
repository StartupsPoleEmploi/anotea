 location ~ ^/(admin|backoffice|questionnaire|widget|stats)(.*)$ {

    limit_conn conn_limit_per_ip 20; 
    limit_req zone=req_limit_per_ip burst=100 nodelay;

    proxy_buffering off;

    proxy_pass http://ui/$2;
    proxy_redirect      off;
    proxy_cache         off;
    proxy_set_header    Host $host;
    proxy_set_header    X-Real-IP $remote_addr;
    proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header    X-Forwarded-Host $server_name;
}

location / {

    limit_conn conn_limit_per_ip 20; 
    limit_req zone=req_limit_per_ip burst=100 nodelay;

    proxy_buffering off;

    proxy_pass http://backend:8080;
    proxy_redirect      off;
    proxy_cache         off;
    proxy_set_header    Host $host;
    proxy_set_header    X-Real-IP $remote_addr;
    proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header    X-Forwarded-Host $server_name;
    proxy_set_header    X-Forwarded-Proto $scheme;
}
