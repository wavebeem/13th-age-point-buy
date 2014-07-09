#!/bin/bash
s3cmd sync -P --no-progress \
    --exclude "*" \
    --include "index.html" \
    --include "*.css" \
    --include "*.js" \
    . s3://mockbrian.com/13th-age/point-buy/
