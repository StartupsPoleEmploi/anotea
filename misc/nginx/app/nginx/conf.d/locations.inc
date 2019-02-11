
location /admin  {

    limit_req zone=flood burst=100 nodelay;

    proxy_pass http://backoffice/;
    proxy_redirect     off;
    proxy_cache off;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Host $server_name;
}


location /questionnaire_v2  {

    limit_req zone=flood burst=100 nodelay;

    proxy_pass http://questionnaire/;
    proxy_redirect     off;
    proxy_cache off;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Host $server_name;
}

location / {

    limit_req zone=flood burst=100 nodelay;

    proxy_pass http://backend:8080;
    proxy_redirect     off;
    proxy_cache off;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Host $server_name;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
