FROM neo4j:latest

# Install curl for optional remote dump download
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /
COPY restore-and-run.sh /restore-and-run.sh
RUN chmod +x /restore-and-run.sh

# Call our restore wrapper directly (avoids depending on tini path variants)
ENTRYPOINT ["/restore-and-run.sh"]
CMD ["neo4j"]



