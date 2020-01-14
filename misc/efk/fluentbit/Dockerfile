FROM fluent/fluent-bit:1.3

COPY conf /conf

CMD ["/fluent-bit/bin/fluent-bit", "-c", "/conf/fluent-bit.conf"]
